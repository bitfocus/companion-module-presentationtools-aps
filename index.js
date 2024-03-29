const { InstanceBase, Regex, runEntrypoint, TCPHelper, InstanceStatus } = require('@companion-module/base')
const { numberOfPresentationSlots } = require('./constants');

var actions = require('./actions')
var feedbacks = require('./feedbacks')
var states = require('./states')
var presets = require('./presets')

class APSInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async configUpdated(config) {
		this.config = config

		this.captureStates = states.generateCaptureStates()
		this.displayStates = states.generateDisplayStates()
		this.slotStates = states.generateSlotStates()
		this.captureTimeoutObj = null
		this.statesTimeoutObj = null
		this.receiver = new MessageBuffer('$')

		this.initTCP()
		this.actions() // export actions
		this.feedbacks()
		this.variables()
		this.presets()
	}

	async init(config) {
		this.configUpdated(config);
	}

	initTCP() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
		}

		if (self.config.host && self.config.port) {
			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('status_change', (status, message) => {
				self.log('debug', `Status ${status}, message: ${message}`)
				self.updateStatus(status)
			})

			self.socket.on('error', (_err) => {
				self.updateStatus(InstanceStatus.UnknownError)
			})

			self.socket.on('connect', () => {
				self.updateStatus(InstanceStatus.Ok)

				if (self.statesTimeoutObj !== null) {
					clearTimeout(self.statesTimeoutObj)
				}

				self.statesTimeoutObj = setTimeout(() => {
					try {
						self.socket.send('states$')
						self.statesTimeoutObj = null
					} catch (err) {
						this.log('debug', err)
					}
				}, 1000)
			})

			self.socket.on('data', (data) => {
				self.receiver.push(data)
				let messages = self.receiver.getMessages()
				if (messages == null) return
				for (let i = 0; i < messages.length; i++){
					let message = messages[i]
					try {
						let jsonData = JSON.parse(message)
						if (jsonData.action === 'states') {
							states.updateStates(self.displayStates, jsonData.data)
							self.checkFeedbacks('loaded', 'displayed')
						} else if (jsonData.action === 'display') {
							states.updateDisplayStates(self.displayStates, jsonData.data)
							self.checkFeedbacks('displayed')
						} else if (jsonData.action === 'capture') {
							states.uploadLoadStates(self.displayStates, jsonData.index)
							states.updateCaptureStates(self.captureStates, jsonData.index)
							self.checkFeedbacks('captured')
							if (self.captureTimeoutObj !== null) {
								clearTimeout(self.captureTimeoutObj)
							}
							self.captureTimeoutObj = setTimeout(() => {
								states.updateCaptureStates(self.captureStates, 999)
								self.checkFeedbacks('captured', 'loaded')
								self.captureTimeoutObj = null
							}, 1500)
						} else if (jsonData.action === 'delete') {
							states.updateUnloadStates(self.displayStates, jsonData.index)
							self.checkFeedbacks('loaded')
						} else if (jsonData.action === 'files') {
							let update_obj = {
								prev: jsonData.data.prev,
								curr: jsonData.data.curr,
								next: jsonData.data.next,
							}
							// For not raising exception while using old verions of APS
							if(jsonData.data.slide_number){
								update_obj["slide_number"] = jsonData.data.slide_number
								update_obj["slides_count"] = jsonData.data.slides_count
								update_obj["builds_count"] = jsonData.data.builds_count
							}
							self.setVariableValues(update_obj)
						} else if (jsonData.action === 'slots') {
							self.setSlotVariables(jsonData.data)
							states.updateSlotStates(self.slotStates, jsonData.data)
							self.checkFeedbacks('slot_exist', 'slot_displayed')
						}
					} catch (e) {
						console.error(e)
					}
				}
			})
		}
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This will establish a TCP connection to interact with the APS app',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP (For local: 127.0.0.1)',
				default: '127.0.0.1',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port (Default: 31600)',
				default: '31600',
				width: 6,
				regex: Regex.PORT,
			},
			{
				type: 'static-text',
				id: 'info-defaultport',
				width: 12,
				label: 'Check that the port in APS matches the target port shown here. To change the default port in APS, go to “Settings” in the app interface. Note that for earlier versions of APS, (2.2 and below) the default port is 4778. We recommend using port 31600 for connection. If this port is not available, try something else in the same range.',
			}
		]
	}

	actions() {
		let ats = actions.getActions(this)
		this.setActionDefinitions(ats)
	}

	feedbacks() {
		var self = this
		var fdbs = feedbacks.getFeedbacks(self)
		self.setFeedbackDefinitions(fdbs)
	}

	variables() {
		var self = this
		var variables = [
			{ name: 'Previous', variableId: 'prev' },
			{ name: 'Current', variableId: 'curr' },
			{ name: 'Next', variableId: 'next' },
			{ name: 'Slide Number', variableId: 'slide_number' },
			{ name: 'Slides Count', variableId: 'slides_count' },
			{ name: 'Builds Count', variableId: 'builds_count' },
		]
		for (let i = 1; i <= numberOfPresentationSlots; i++) {
			variables.push({
				name: `Slot ${i}`,
				variableId: `slot${i}`,
			})
		}

		self.setVariableDefinitions(variables)

		const values = {
			prev: '',
			curr: '',
			next: '',
			slide_number: '',
			slides_count: '',
			builds_count: '',
		}
		try {
			for (let i = numberOfPresentationSlots; i > 0; i--) {
				values[`slot${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	setSlotVariables(data) {
		var self = this
		const values = {}

		try {
			for (let i = numberOfPresentationSlots; i > 0; i--) {
				values[`slot${i}`] = data.filenames[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	presets() {
		var self = this
		try {
			self.setPresetDefinitions(presets.getPresets(self))
		} catch (err) {
			self.log('debug', err)
		}
	}

	async destroy() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
		}

		self.log('debug', `destroy ${self.id}`)
	}
}

class MessageBuffer {
	constructor(delimiter) {
		this.delimiter = delimiter
		this.buffer = ''
	}

	isFinished() {
		return this.buffer.length === 0 || this.buffer.indexOf(this.delimiter) === -1
	}

	push(data) {
		this.buffer += data
	}

	getMessages() {
		const messages = []
	  
		while (!this.isFinished()) {
			const delimiterIndex = this.buffer.indexOf(this.delimiter)
			if (delimiterIndex !== -1) {
				const message = this.buffer.slice(0, delimiterIndex)
				this.buffer = this.buffer.replace(message + this.delimiter, '')
				messages.push(message)
			}
		}
		return messages.length > 0 ? messages : null;
	}
}

runEntrypoint(APSInstance, [])
