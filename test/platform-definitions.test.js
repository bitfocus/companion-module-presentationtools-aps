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
async function companion(config = { host: '127.0.0.1', port: 31601 }) {
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
	await instance.configUpdated(config)
	instance.socket.emit('connect')
	const send = (action, data, socket = instance.socket) => {
		const body = Buffer.from(JSON.stringify({ action, data }))
		const header = Buffer.alloc(4)
		header.writeUInt32BE(body.length)
		socket.emit('data', Buffer.concat([header, body]))
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

test('conditional fields register expressions while retaining saved option IDs and defaults', async () => {
	const { instance } = await companion()
	const fields = instance.getConfigFields()
	for (const id of ['host', 'port', 'info-defaultport']) {
		const field = fields.find((field) => field.id === id)
		assert.equal(field.isVisibleExpression, '!$(options:bonjourHost)')
		assert.equal(field.isVisible, undefined)
	}
	assert.equal(fields.find((field) => field.id === 'host').default, '127.0.0.1')
	assert.equal(fields.find((field) => field.id === 'port').default, '31600')
	const definitions = instance.actionDefinitions
	assert.deepEqual(definitions.PresentationExit.options[0], {
		id: 'Key',
		type: 'textinput',
		default: 'Key_Esc',
		isVisibleExpression: 'false',
		useVariables: true,
	})
	for (const id of ['Slot', 'Folder']) {
		const field = definitions.CapturePresentation.options.find((field) => field.id === id)
		assert.equal(field.isVisibleExpression, `$(options:destination) == '${id}'`)
		assert.equal(field.default, `${id}1`)
		assert.ok(field.choices.some((choice) => choice.id === field.default))
	}
	for (const id of ['StillImages', 'Media', 'SlotPresentations', 'PresentationFolders', 'MediaFolders']) {
		const field = definitions.Clear.options.find((field) => field.id === id)
		assert.equal(field.isVisibleExpression, `$(options:Key) == '${id}'`)
		assert.equal(field.default, 'All')
		assert.ok(field.choices.some((choice) => choice.id === 'All'))
	}
	for (const definition of Object.values(definitions)) {
		for (const option of definition.options) assert.equal(option.isVisible, undefined)
	}
})

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

function pdfProgramChoices(instance) {
	const action = instance.actionDefinitions.Settings_pdf_controlled_program
	assert.ok(action.options[0].choices.some((choice) => choice.id === action.options[0].default))
	return action.options[0].choices.map((choice) => choice.id)
}

test('PDF controlled program choices follow the reported platform', async () => {
	const { instance, send } = await companion()
	assert.deepEqual(pdfProgramChoices(instance), ['adobe_acrobat', 'skim', 'adobe_reader', 'okular', 'speedf'])
	send('aps_info', { platform: 'macos' })
	assert.deepEqual(pdfProgramChoices(instance), ['skim', 'adobe_acrobat'])
	send('aps_info', { platform: 'windows' })
	assert.deepEqual(pdfProgramChoices(instance), ['adobe_acrobat', 'adobe_reader', 'okular', 'speedf'])
})

test('PDF controlled program choices only list installed programs', async () => {
	const { instance, send } = await companion()
	send('aps_info', { platform: 'windows' })
	send('settings', { installed_presentation_apps: ['powerpoint', 'okular', 'speedf'] })
	assert.deepEqual(pdfProgramChoices(instance), ['okular', 'speedf'])
	send('settings', { installed_presentation_apps: ['powerpoint'] })
	assert.deepEqual(pdfProgramChoices(instance), ['adobe_acrobat', 'adobe_reader', 'okular', 'speedf'])
	send('settings', { installed_presentation_apps: ['powerpoint', 'okular'] })
	send('aps_info', { platform: 'macos' })
	assert.deepEqual(pdfProgramChoices(instance), ['skim', 'adobe_acrobat'])
	send('settings', { installed_presentation_apps: ['powerpoint', 'keynote', 'skim'] })
	assert.deepEqual(pdfProgramChoices(instance), ['skim'])
})

function dropdownIds(definition, optionId) {
	return definition.options.find((option) => option.id === optionId).choices.map((choice) => choice.id)
}

function assertKeynoteShown(instance, shown) {
	assert.equal(dropdownIds(instance.actionDefinitions.SlideNext, 'Key').includes('Keynote_Next'), shown)
	assert.equal(dropdownIds(instance.actionDefinitions.SlidePrevious, 'Key').includes('Keynote_Previous'), shown)
	assert.equal(dropdownIds(instance.actionDefinitions.GoToSlide, 'App').includes('Keynote_Go'), shown)
	assert.equal(dropdownIds(instance.feedbackDefinitions.active_app, 'Application').includes('Keynote'), shown)
	for (const id of ['KeynotePrevious', 'KeynoteNext', 'KeynoteGoTo'])
		assert.equal(id in instance.presetDefinitions, shown, id)
}

test('Keynote options are hidden only once Windows is confirmed', async () => {
	const { instance, send } = await companion()
	assertKeynoteShown(instance, true)
	send('aps_info', { platform: 'windows' })
	assertKeynoteShown(instance, false)
	instance.socket.emit('connect')
	assertKeynoteShown(instance, false)
	send('aps_info', { platform: 'macos' })
	assertKeynoteShown(instance, true)
})

test('active application feedback matches Keynote', async () => {
	const { instance, send } = await companion()
	send('aps_info', { platform: 'macos' })
	send('active_application', { application: 'Keynote' })
	const feedback = instance.feedbackDefinitions.active_app
	assert.equal(feedback.callback({ options: { Application: 'Keynote' } }), true)
	assert.equal(feedback.callback({ options: { Application: 'PowerPoint' } }), false)
})

test('PowerPoint slide variables are hidden on Mac and show - when APS omits them', async () => {
	const { instance, send } = await companion()
	const variableIds = () => instance.variableDefinitions.map((variable) => variable.variableId)
	const values = {}
	instance.setVariableValues = (update) => Object.assign(values, update)
	assert.ok(variableIds().includes('Powerpoint_slide_number'))
	send('files', { slide_number: '3', slides_count: '10' })
	assert.equal(values.Powerpoint_slide_number, '-')
	assert.equal(values.Powerpoint_slides_count, '-')
	send('aps_info', { platform: 'macos' })
	assert.ok(!variableIds().includes('Powerpoint_slide_number'))
	assert.ok(!variableIds().includes('Powerpoint_slides_count'))
	assert.ok(variableIds().includes('Powerpoint_Slides_builds_count'))
	send('aps_info', { platform: 'windows' })
	assert.ok(variableIds().includes('Powerpoint_slides_count'))
	send('files', { powerpoint_slide_number: '4', powerpoint_slides_count: '12' })
	assert.equal(values.Powerpoint_slide_number, '4')
	assert.equal(values.Powerpoint_slides_count, '12')
})

test('idle Media Player values show - on Windows and Mac', async () => {
	const { instance, send } = await companion()
	const values = {}
	instance.setVariableValues = (update) => Object.assign(values, update)
	const idle = (value) => ({
		filenames: [],
		Media_playing: value,
		Media_loaded: value,
		Media_playing_filename: value,
		Media_loaded_filename: value,
		Media_playback_state: 'None',
	})
	for (const value of ['None', '-']) {
		send('MediaPlayer', idle(value))
		assert.equal(values.Media_playing, '-')
		assert.equal(values.Media_loaded, '-')
		assert.equal(values.Media_playing_filename, '-')
		assert.equal(values.Media_loaded_filename, '-')
		assert.equal(values.Media_playback_state, 'None')
	}
	send('MediaPlayer', { ...idle('None'), Media_playing: '2', Media_playing_filename: 'clip.mp4' })
	assert.equal(values.Media_playing, '2')
	assert.equal(values.Media_playing_filename, 'clip.mp4')
})

test('still-image delete is handled for both delete and deleteimage', async () => {
	const { instance } = await companion()
	for (const action of ['delete', 'deleteimage']) {
		instance.displayStates.Display4.loaded = true
		const body = Buffer.from(JSON.stringify({ action, index: 3 }))
		const header = Buffer.alloc(4)
		header.writeUInt32BE(body.length)
		instance.socket.emit('data', Buffer.concat([header, body]))
		assert.equal(instance.displayStates.Display4.loaded, false, action)
	}
})

test('changing endpoint restores unknown-platform definitions before older APS identifies itself', async (t) => {
	for (const platform of ['macos', 'windows']) {
		for (const changed of [
			{ host: '127.0.0.2', port: 31601 },
			{ host: '127.0.0.1', port: 31602 },
			{ host: '', port: 31601 },
		]) {
			const config = { host: '127.0.0.1', port: 31601 }
			const { instance, send } = await companion(config)
			t.after(() => instance.destroy())
			send('aps_info', { platform })
			send('settings', { installed_presentation_apps: [platform === 'macos' ? 'skim' : 'okular'] })
			const oldSocket = instance.socket
			Object.assign(config, changed)
			await instance.configUpdated(config)
			assert.equal(instance.apsPlatform, null)
			assert.equal(instance.settingsState.installedPresentationApps, null)
			assertMediaShown(instance, true)
			assertKeynoteShown(instance, true)
			assert.ok(instance.variableDefinitions.some((v) => v.variableId === 'Powerpoint_slide_number'))
			assert.deepEqual(pdfProgramChoices(instance), ['adobe_acrobat', 'skim', 'adobe_reader', 'okular', 'speedf'])
			if (instance.socket) instance.socket.emit('connect') // Older APS sends no aps_info.
			send('aps_info', { platform }, oldSocket)
			send('settings', { installed_presentation_apps: ['skim'] }, oldSocket)
			assert.equal(instance.apsPlatform, null)
			assert.equal(instance.settingsState.installedPresentationApps, null)
			if (!instance.socket) {
				await instance.configUpdated({ host: '127.0.0.2', port: 31601 })
				assert.equal(instance.apsPlatform, null)
			}
			assertMediaShown(instance, true)
			assertKeynoteShown(instance, true)
		}
	}
})

test('same-endpoint saves retain platform but reset installed-app filtering', async (t) => {
	for (const platform of ['macos', 'windows']) {
		const { instance, send } = await companion()
		t.after(() => instance.destroy())
		send('aps_info', { platform })
		for (const config of [
			{ host: '127.0.0.1', port: '31601', sort: 'numbered' },
			{ host: 'ignored', port: 1, bonjourHost: '127.0.0.1:31601' },
			{ host: ' 127.0.0.1 ', port: 31601, bonjourHost: null },
		]) {
			send('settings', { installed_presentation_apps: [platform === 'macos' ? 'skim' : 'okular'] })
			await instance.configUpdated(config)
			instance.socket.emit('connect')
			assert.equal(instance.apsPlatform, platform)
			assert.equal(instance.settingsState.installedPresentationApps, null)
			assertMediaShown(instance, platform !== 'macos')
			assertKeynoteShown(instance, platform !== 'windows')
			assert.deepEqual(
				pdfProgramChoices(instance),
				platform === 'macos' ? ['skim', 'adobe_acrobat'] : ['adobe_acrobat', 'adobe_reader', 'okular', 'speedf'],
			)
		}
	}
})
