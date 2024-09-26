const { InstanceBase, Regex, runEntrypoint, TCPHelper, InstanceStatus } = require('@companion-module/base')
const { numberOfPresentationSlots, numberOfMediaPlayerSlots, minNumberOfFolderFiles, numberOfPresentationFolders } = require('./constants')

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
		this.folderStates = states.generateFolderStates()
		this.slotCaptureStates = states.generateSlotCaptureStates()
		this.folderCaptureStates = states.generateFolderCaptureStates()
		this.presentationFolderState = {
			filesList: [],
			filesState: {}
		}
		this.mediaPlayerState = {
			slots: states.generateMediaSlotStates(),
			playing: false,
			paused: false,
			loop_on: false,
			fade_on: false,
		}
		this.captureTimeoutObj = null
		this.slotCaptureTimeoutObj = null
		this.folderCaptureTimeoutObj = null
		this.statesTimeoutObj = null
		this.receiver = new MessageBuffer('$')

		this.initTCP()
		this.actions() // export actions
		this.feedbacks()
		this.variables()
		this.presets()
	}

	async init(config) {
		this.configUpdated(config)
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
				//self.log('debug', `Status ${status}, message: ${message}`)
				//self.updateStatus(status)
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
				for (let i = 0; i < messages.length; i++) {
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
						} else if (jsonData.action === 'slot_capture') {
							states.updateSlotCaptureStates(self.slotCaptureStates, jsonData.index)
							self.checkFeedbacks('slot_captured')
							if (self.slotCaptureTimeoutObj !== null) {
								clearTimeout(self.slotCaptureTimeoutObj)
							}
							self.slotCaptureTimeoutObj = setTimeout(() => {
								states.updateSlotCaptureStates(self.slotCaptureStates, -1)
								self.checkFeedbacks('slot_captured')
								self.slotCaptureTimeoutObj = null
							}, 1000)
						} else if (jsonData.action === 'folder_capture') {
							states.updateFolderCaptureStates(self.folderCaptureStates, jsonData.index)
							self.checkFeedbacks('folder_captured')
							if (self.folderCaptureTimeoutObj !== null) {
								clearTimeout(self.folderCaptureTimeoutObj)
							}
							self.folderCaptureTimeoutObj = setTimeout(() => {
								states.updateFolderCaptureStates(self.folderCaptureStates, -1)
								self.checkFeedbacks('folder_captured')
								self.folderCaptureTimeoutObj = null
							}, 1000)
						} else if (jsonData.action === 'delete') {
							states.updateUnloadStates(self.displayStates, jsonData.index)
							self.checkFeedbacks('loaded')
						} else if (jsonData.action === 'files') {
							let update_obj = {
								Presentation_previous: jsonData.data.prev,
								Presentation_current: jsonData.data.curr,
								Presentation_next: jsonData.data.next,
							}
							// For not raising exception while using old verions of APS
							if (jsonData.data.slide_number) {
								update_obj['slide_number'] = jsonData.data.slide_number
								update_obj['slides_count'] = jsonData.data.slides_count
								update_obj['Slides_builds_count'] = jsonData.data.builds_count
							}
							self.setVariableValues(update_obj)
						} else if (jsonData.action === 'slots') {
							self.lastCachedSlotVariablesData = jsonData.data
							self.setSlotVariables(jsonData.data)
							states.updateSlotStates(self.slotStates, jsonData.data)
							self.checkFeedbacks('slot_exist', 'slot_displayed')
						} else if (jsonData.action === 'folders') {
							self.lastCachedFolderVariablesData = jsonData.data
							self.setFolderVariables(jsonData.data)
							states.updateFolderStates(self.folderStates, jsonData.data)
							self.checkFeedbacks('folder_exist', 'folder_active')
							self.log('debug', JSON.stringify(jsonData))
						} else if (jsonData.action === 'active_folder_presentations') {
							states.updatePresentationsFolderStates(self.presentationFolderState, jsonData.data)
							self.variables(true)
							self.actions()
							self.feedbacks()
							self.presets()
							self.setFolderFilesVariables()
						} else if (jsonData.action === 'opened_folder_presentation') {
							states.updateFileStates(self.presentationFolderState, jsonData.data.current_opened_file_index)
							self.checkFeedbacks('file_exist', 'file_displayed')
						} else if (jsonData.action === 'MediaPlayer') {
							self.lastCachedMediaPlayerVariablesData = jsonData.data
							self.setMediaPlayerVariables(jsonData.data)
							states.updateMediaPlayerState(self.mediaPlayerState, jsonData.data)
							self.checkFeedbacks(
								'Media_playing',
								'Media_loaded',
								'Media_playback_state_playing',
								'Media_playback_state_paused',
								'Media_player_loop_on',
								'Media_player_fade_on',
							)
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
				label:
					'Check that the port in APS matches the target port shown here. To change the default port in APS, go to “Settings” in the app interface. Note that for earlier versions of APS, (2.2 and below) the default port is 4778. We recommend using port 31600 for connection. If this port is not available, try something else in the same range.',
			},
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

	variables(initOnly = false) {
		var self = this
		var variables = [
			{ name: 'Presentation: Previous in folder', variableId: 'Presentation_previous' },
			{ name: 'Presentation: Current', variableId: 'Presentation_current' },
			{ name: 'Presentation: Next in folder', variableId: 'Presentation_next' },
			{ name: 'Slide: Current', variableId: 'slide_number' },
			{ name: 'Slide: Total number', variableId: 'slides_count' },
			{ name: 'Slide: Builds count', variableId: 'Slides_builds_count' },
			{ name: 'Media player: Playing media', variableId: 'Media_playing' },
			{ name: 'Media player: Loaded media', variableId: 'Media_loaded' },
			{ name: 'Media player: Playing media filename', variableId: 'Media_playing_filename' },
			{ name: 'Media player: Loaded media filename', variableId: 'Media_loaded_filename' },
			{ name: 'Media player: Playback state', variableId: 'Media_playback_state' },
			{ name: 'Media player: Time left', variableId: 'Media_time_left' },
			{ name: 'Media player: Time elapsed', variableId: 'Media_time_elapsed' },
			{ name: 'Media player: Time duration', variableId: 'Media_time_duration' },
		]
		for (let i = 1; i <= numberOfPresentationSlots; i++) {
			variables.push({
				name: `Presentation Slot ${i}`,
				variableId: `presentation_slot${i}`,
			})
		}
		for (let i = 1; i <= numberOfPresentationFolders; i++) {
			variables.push({
				name: `Presentation Folder ${i}`,
				variableId: `presentation_folder${i}`,
			})
		}

		for (let i = 1; i <= Math.max(minNumberOfFolderFiles, self.presentationFolderState.filesList.length); i++) {
			variables.push({
				name: `Presentation Folder File ${i}`,
				variableId: `presentation_folder_file${i}`,
			})
		}

		for (let i = 1; i <= numberOfMediaPlayerSlots; i++) {
			variables.push({
				name: `Media ${i}`,
				variableId: `media_slot${i}`,
			})
		}

		self.setVariableDefinitions(variables)

		if(initOnly)
			return

		const values = {
			Presentation_previous: '',
			Presentation_current: '',
			Presentation_next: '',
			slide_number: '',
			slides_count: '',
			Slides_builds_count: '',
			Media_playing: '',
			Media_loaded: '',
			Media_playing_filename: '',
			Media_loaded_filename: '',
			Media_playback_state: '',
			Media_time_left: '',
			Media_time_elapsed: '',
			Media_time_duration: '',
		}
		try {
			for (let i = numberOfPresentationSlots; i > 0; i--) {
				values[`presentation_slot${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}

		try {
			for (let i = numberOfPresentationFolders; i > 0; i--) {
				values[`presentation_folder${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}

		try {
			for (let i = numberOfMediaPlayerSlots; i > 0; i--) {
				values[`media_slot${i}`] = '-'
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
				values[`presentation_slot${i}`] = data.filenames[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	setFolderVariables(data) {
		var self = this
		const values = {}

		try {
			for (let i = numberOfPresentationFolders; i > 0; i--) {
				values[`presentation_folder${i}`] = data.names[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	setFolderFilesVariables() {
		var self = this
		const values = {}
		let filesList = self.presentationFolderState.filesList
		try {
			for (let i = Math.max(minNumberOfFolderFiles, filesList.length); i > 0; i--) {
				let text = ''
				if(i <= filesList.length)
					text = filesList[i - 1].split('\\').pop()
				values[`presentation_folder_file${i}`] = text
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	setMediaPlayerVariables(data) {
		var self = this
		const values = {
			Media_playing: data.Media_playing,
			Media_loaded: data.Media_loaded,
			Media_playing_filename: data.Media_playing_filename,
			Media_loaded_filename: data.Media_loaded_filename,
			Media_playback_state: data.Media_playback_state,
			Media_time_left: data.Media_time_left,
			Media_time_elapsed: data.Media_time_elapsed,
			Media_time_duration: data.Media_duration,
		}

		try {
			for (let i = numberOfMediaPlayerSlots; i > 0; i--) {
				values[`media_slot${i}`] = data.filenames[i - 1]
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
		return messages.length > 0 ? messages : null
	}
}

runEntrypoint(APSInstance, [])
