const assert = require('node:assert/strict')
const { test } = require('node:test')
const actions = require('../src/actions')

function companion() {
	const frames = []
	const instance = {
		apsPlatform: null,
		settingsState: {},
		apiVersionMapping: { 2: { commandHandler: actions.getCommandV2 } },
		toBeUsedAPIversion: 2,
		watchedPresentationFolderState: { filesList: ['/Presentations/عرض résumé.pptx'] },
		watchedMediaFolderState: { filesList: [] },
		powerPointSectionsState: { sections: [] },
		browserState: { tabsList: [] },
		getVariableValue: () => 2,
		parseVariablesInString() {
			assert.fail('Companion has already resolved variable-enabled text inputs')
		},
		log() {},
		socket: { isConnected: true, send: (frame) => frames.push(frame) },
	}
	return { instance, frames, definitions: actions.getActions(instance) }
}

async function expectCommand(actionId, options, expected) {
	const { instance, frames, definitions } = companion()
	const action = { actionId, options }
	assert.deepEqual(await actions.getCommandV2(action, instance), expected)
	await definitions[actionId].callback(action)
	assert.equal(frames.length, 1)
	const body = Buffer.from(JSON.stringify(expected), 'utf8')
	assert.equal(frames[0].readUInt32BE(0), body.length)
	assert.deepEqual(frames[0].subarray(4), body)
}

test('resolved slide values preserve navigation and fullscreen special cases', async () => {
	for (const SlideNumber of [1, '1', '12', '12suffix']) {
		for (const Fullscreen of [true, false]) {
			const slideNr = parseInt(SlideNumber)
			await expectCommand(
				'Navigation_NextFS',
				{ SlideNumber, Fullscreen },
				slideNr === 1 && !Fullscreen
					? { command: 'Navigation_NextNoFS' }
					: { command: 'Navigation_NextFS', parameters: { slideNr, isFullscreen: Fullscreen } },
			)
			await expectCommand(
				'Navigation_PrevFS',
				{ SlideNumber, Fullscreen },
				slideNr === 1 && Fullscreen
					? { command: 'Navigation_PrevFS' }
					: { command: 'Navigation_PrevFS', parameters: { slideNr, isFullscreen: Fullscreen } },
			)
		}
	}
})

test('presentation opening preserves resolved filenames and slide values', async () => {
	const file_path = '/Presentations/عرض résumé.pptx'
	await expectCommand(
		'open_presentation_from_watched_presentation_folder',
		{ FileNumber: 'File1', SlideNumber: '7', Fullscreen: true },
		{ command: 'OpenStart_Presentation', parameters: { file_path, slideNr: 7, isFullscreen: true } },
	)
	for (const Filename of [file_path, '/Presentations/$(custom:literal).pptx']) {
		await expectCommand(
			'OpenStart_Presentation',
			{ Filename, SlideNumber: '7', Fullscreen: false },
			{ command: 'OpenStart_Presentation', parameters: { file_path: Filename, slideNr: 7, isFullscreen: false } },
		)
	}
	for (const Key of ['Slot2', 'selected']) {
		await expectCommand(
			'OpenStart_Presentation_Slot',
			{ Key, SlideNumber: '7', Fullscreen: true },
			{ command: 'OpenStart_Presentation_Slot', parameters: { slot: '2', isFullscreen: true, slideNr: 7 } },
		)
	}
	const { instance } = companion()
	assert.equal(
		await actions.getCommandV2({ actionId: 'OpenStart_Presentation', options: { Filename: '' } }, instance),
		undefined,
	)
})

test('Go to slide retains commands for every supported application', async () => {
	const { definitions } = companion()
	for (const { id: App } of definitions.GoToSlide.options[0].choices) {
		for (const SlideNumber of [3, '3']) {
			await expectCommand('GoToSlide', { App, SlideNumber }, { command: App, parameters: { slideNr: 3 } })
		}
	}
})

test('slot paths preserve Unicode, spaces and literal variable-like text', async () => {
	for (const actionId of ['SetPresentationSlotPath', 'SetMediaSlotPath', 'SetImageSlotPath']) {
		const bankKey = actionId === 'SetPresentationSlotPath' ? 'slot' : 'bank_number'
		for (const FilePath of ['C:\\Show files\\عرض résumé.pptx', '/Show files/$(custom:literal).png']) {
			for (const Key of ['Slot2', 'selected']) {
				await expectCommand(
					actionId,
					{ Key, FilePath },
					{ command: actionId, parameters: { [bankKey]: '2', file_path: FilePath } },
				)
			}
		}
		const { frames, definitions } = companion()
		await definitions[actionId].callback({ actionId, options: { Key: 'Slot2', FilePath: '' } })
		assert.equal(frames.length, 0)
	}
})

test('URLs and hidden command values are consumed without recursive expansion', async () => {
	for (const url of ['https://example.com/عرض?q=show notes', 'https://example.com/$(custom:literal)']) {
		await expectCommand(
			'OpenWebPage',
			{ url, fullscreen: true },
			{ command: 'OpenWebPage', parameters: { url, fullscreen: true, new_tab: true } },
		)
	}
	for (const Key of ['Key_Esc', '$(custom:literal)']) {
		await expectCommand('PresentationExit', { Key }, { command: Key })
	}
})

test('navigation dropdown command values are used directly', async () => {
	const { definitions } = companion()
	for (const actionId of ['SlideNext', 'SlidePrevious']) {
		for (const { id: Key } of definitions[actionId].options[0].choices) {
			await expectCommand(actionId, { Key }, { command: Key })
		}
	}
})
