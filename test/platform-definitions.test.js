const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const { readFileSync } = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')
const vm = require('node:vm')

const MEDIA_ACTIONS = ['Presentation_Media_Control', 'Presentation_Media_Seek']
const MEDIA_PRESETS = [
	'PowerPointMediaPlayPause',
	'PowerPointMediaStop',
	'PowerPointMediaBack',
	'PowerPointMediaForward',
	'PowerPointMediaTimer',
]

// Run the real module with a fake Companion base that records the registered definitions.
async function companion() {
	let Instance
	class FakeBase {
		constructor() {
			this.label = 'aps'
			this.registrations = 0
		}
		setActionDefinitions(definitions) {
			this.actionDefinitions = definitions
			this.registrations++
		}
		setFeedbackDefinitions(definitions) {
			this.feedbackDefinitions = definitions
		}
		setPresetDefinitions(definitions) {
			this.presetDefinitions = definitions
		}
		setVariableDefinitions(definitions) {
			this.variableDefinitions = definitions
		}
		setVariableValues() {}
		getVariableValue() {}
		log() {}
		updateStatus() {}
		checkFeedbacks() {}
	}
	class FakeTCP extends EventEmitter {
		send() {
			return Promise.resolve()
		}
		destroy() {}
	}
	const filename = path.resolve(__dirname, '../index.js')
	const localRequire = createRequire(filename)
	vm.runInNewContext(
		readFileSync(filename, 'utf8'),
		{
			require(name) {
				if (name === '@companion-module/base')
					return {
						...localRequire(name),
						InstanceBase: FakeBase,
						TCPHelper: FakeTCP,
						runEntrypoint(instance) {
							Instance = instance
						},
					}
				return localRequire(name)
			},
			Buffer,
			console,
			setTimeout,
			clearTimeout,
		},
		{ filename },
	)
	const instance = new Instance()
	await instance.configUpdated({ host: '127.0.0.1', port: 31601 })
	instance.socket.emit('connect')
	const send = (action, data) => {
		const body = Buffer.from(JSON.stringify({ action, data }))
		const header = Buffer.alloc(4)
		header.writeUInt32BE(body.length)
		instance.socket.emit('data', Buffer.concat([header, body]))
	}
	return { instance, send }
}

function assertMediaShown(instance, shown) {
	for (const id of MEDIA_ACTIONS) assert.equal(id in instance.actionDefinitions, shown, id)
	for (const id of MEDIA_PRESETS) assert.equal(id in instance.presetDefinitions, shown, id)
	assert.equal('PowerPoint_media_state' in instance.feedbackDefinitions, shown)
	const variableIds = instance.variableDefinitions.map((variable) => variable.variableId)
	assert.equal(variableIds.includes('PowerPoint_media_time_left'), shown)
}

test('media options are shown before APS identifies its platform', async () => {
	const { instance } = await companion()
	assertMediaShown(instance, true)
})

test('a Mac hides media options, and they stay hidden after it disconnects', async () => {
	const { instance, send } = await companion()
	send('aps_info', { platform: 'macos' })
	assertMediaShown(instance, false)
	instance.socket.emit('error', new Error('disconnected'))
	instance.socket.emit('status_change', 'disconnected')
	instance.socket.emit('connect')
	assertMediaShown(instance, false)
	assert.equal(instance.presetDefinitions.PowerPointSectionPrevious !== undefined, true)
})

test('Windows or an older APS without platform shows media options again', async () => {
	const { instance, send } = await companion()
	send('aps_info', { platform: 'macos' })
	send('aps_info', { platform: 'windows' })
	assertMediaShown(instance, true)
	send('aps_info', { platform: 'macos' })
	send('aps_info', { app_version: '4.2' })
	assertMediaShown(instance, true)
})

test('repeated aps_info from the same platform does not re-register definitions', async () => {
	const { instance, send } = await companion()
	send('aps_info', { platform: 'macos' })
	const registrations = instance.registrations
	send('aps_info', { platform: 'macos' })
	assert.equal(instance.registrations, registrations)
})
