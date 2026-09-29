const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const { readFileSync } = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')
const vm = require('node:vm')

// Run the real module with a fake Companion base that records variables and feedback definitions.
async function companion() {
	let Instance
	class FakeBase {
		constructor() {
			this.label = 'aps'
			this.values = {}
		}
		setActionDefinitions() {}
		setFeedbackDefinitions(definitions) {
			this.feedbackDefinitions = definitions
		}
		setPresetDefinitions() {}
		setVariableDefinitions() {}
		setVariableValues(values) {
			Object.assign(this.values, values)
		}
		getVariableValue(id) {
			return this.values[id]
		}
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
	const feedback = (id, options = {}) => instance.feedbackDefinitions[id].callback({ options })
	return { instance, send, feedback }
}

const CAPABILITIES = ['presentation_preparation_feedback', 'webpage_preparation_feedback']
const FILES = ['/P/1 Intro.pptx', '/P/Keynote.key', '/P/3 Outro.pdf']

test('slot preparation drives the slot, general feedbacks and variables', async () => {
	const { instance, send, feedback } = await companion()
	send('aps_info', { capabilities: CAPABILITIES })
	send('presentation_preparing', { is_preparing: false })
	assert.equal(feedback('presentation_preparing'), false)

	send('presentation_preparing', {
		is_preparing: true,
		command_type: 'slot',
		is_fullscreen: true,
		slot: 3,
		to: '/P/Keynote.key',
	})
	assert.equal(feedback('presentation_preparing'), true)
	assert.equal(feedback('slot_preparing', { Key: 'Slot3' }), true)
	assert.equal(feedback('slot_preparing', { Key: 'Slot2' }), false)
	assert.equal(instance.values.presentation_preparing, true)
	assert.equal(instance.values.presentation_preparing_name, 'Keynote.key')
	assert.equal(instance.values.presentation_preparing_slot, 3)

	send('presentation_preparing', { is_preparing: false, command_type: 'slot', slot: 3, to: '/P/Keynote.key' })
	assert.equal(feedback('presentation_preparing'), false)
	assert.equal(feedback('slot_preparing', { Key: 'Slot3' }), false)
	assert.equal(instance.values.presentation_preparing_slot, '-')
	assert.equal(instance.values.presentation_preparing_name, '-')
})

test('watched folder file follows the index, and the path when the index is absent', async () => {
	const { instance, send, feedback } = await companion()
	send('aps_info', { capabilities: CAPABILITIES })
	send('watched_presentation_folder', { name: 'P', number: 2, files_list: FILES })

	send('presentation_preparing', {
		is_preparing: true,
		command_type: 'next',
		watched_folder_number: 2,
		to_watched_folder_index: 1,
	})
	assert.equal(feedback('presentation_file_preparing', { Key: 'File2' }), true)
	assert.equal(instance.values.presentation_preparing_folder_file_number, 2)
	assert.equal(feedback('slot_preparing', { Key: 'Slot1' }), false)

	send('presentation_preparing', { is_preparing: true, command_type: 'direct_path', to: '/P/3 Outro.pdf' })
	assert.equal(feedback('presentation_file_preparing', { Key: 'File2' }), false)
	assert.equal(feedback('presentation_file_preparing', { Key: 'File3' }), true)
})

test('numbered-only sorting maps the prepared file to its numbered position', async () => {
	const { instance, send, feedback } = await companion()
	instance.config.sort = 'numberedonly'
	send('aps_info', { capabilities: CAPABILITIES })
	send('watched_presentation_folder', { name: 'P', number: 1, files_list: FILES })
	send('presentation_preparing', {
		is_preparing: true,
		command_type: 'direct_path',
		to: '/P/3 Outro.pdf',
		watched_folder_number: 1,
		to_watched_folder_index: 2,
	})
	assert.equal(feedback('presentation_file_preparing', { Key: 'File3' }), true)
	send('presentation_preparing', {
		is_preparing: true,
		command_type: 'direct_path',
		to: '/P/Keynote.key',
		watched_folder_number: 1,
		to_watched_folder_index: 1,
	})
	assert.equal(instance.values.presentation_preparing_folder_file_number, '-')
})

test('Google Slides webpage preparation counts as presentation preparing', async () => {
	const { instance, send, feedback } = await companion()
	send('aps_info', { capabilities: CAPABILITIES })
	const url = 'https://docs.google.com/presentation/d/example/present'
	send('seamless_open_webpage_in_progress', {
		seamless_open_webpage_in_progress: true,
		to_url: url,
		is_google_slides: true,
	})
	send('seamless_fs_in_progress', { seamless_fs_in_progress: true, to_url: url, is_google_slides: true })
	assert.equal(feedback('presentation_preparing'), true)
	assert.equal(instance.values.presentation_preparing_name, url)
	send('seamless_open_webpage_in_progress', { seamless_open_webpage_in_progress: false, is_google_slides: true })
	assert.equal(feedback('presentation_preparing'), true)
	send('seamless_fs_in_progress', { seamless_fs_in_progress: false, is_google_slides: true })
	assert.equal(feedback('presentation_preparing'), false)

	send('seamless_open_webpage_in_progress', {
		seamless_open_webpage_in_progress: true,
		to_url: 'https://example.com/',
		is_google_slides: false,
	})
	assert.equal(feedback('presentation_preparing'), false)
	assert.equal(feedback('seamless_open_webpage_in_progress'), true)
})

test('without the capabilities, preparation frames are ignored', async () => {
	const { send, feedback } = await companion()
	send('aps_info', { platform: 'macos' })
	send('presentation_preparing', { is_preparing: true, command_type: 'slot', slot: 1 })
	send('seamless_fs_in_progress', { seamless_fs_in_progress: true, is_google_slides: true })
	assert.equal(feedback('presentation_preparing'), false)
	assert.equal(feedback('slot_preparing', { Key: 'Slot1' }), false)
})

test('a lost connection clears an active preparation', async () => {
	const { instance, send, feedback } = await companion()
	send('aps_info', { capabilities: CAPABILITIES })
	send('presentation_preparing', { is_preparing: true, command_type: 'slot', slot: 1 })
	instance.socket.emit('status_change', 'disconnected')
	assert.equal(feedback('presentation_preparing'), false)
	assert.equal(instance.values.presentation_preparing, false)
})
