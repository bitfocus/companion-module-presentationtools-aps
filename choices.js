const { numberOfPresentationSlots, numberOfMediaPlayerSlots } = require('./constants')
exports.getChoicesForCapture = function () {
	return [
		{ id: 'Capture1', label: 'Image 1' },
		{ id: 'Capture2', label: 'Image 2' },
		{ id: 'Capture3', label: 'Image 3' },
		{ id: 'Capture4', label: 'Image 4' },
		{ id: 'Capture5', label: 'Image 5' },
		{ id: 'Capture6', label: 'Image 6' },
		{ id: 'Capture7', label: 'Image 7' },
		{ id: 'Capture8', label: 'Image 8' },
		{ id: 'Capture9', label: 'Image 9' },
		{ id: 'Capture10', label: 'Image 10' },
	]
}

exports.getChoicesForDisplay = function () {
	return [
		{ id: 'Display1', label: 'Image 1' },
		{ id: 'Display2', label: 'Image 2' },
		{ id: 'Display3', label: 'Image 3' },
		{ id: 'Display4', label: 'Image 4' },
		{ id: 'Display5', label: 'Image 5' },
		{ id: 'Display6', label: 'Image 6' },
		{ id: 'Display7', label: 'Image 7' },
		{ id: 'Display8', label: 'Image 8' },
		{ id: 'Display9', label: 'Image 9' },
		{ id: 'Display10', label: 'Image 10' },

		{ id: 'DisplayTest', label: 'Test' },
		{ id: 'Freeze', label: 'Freeze' },
		{ id: 'Blackout', label: 'Black' },
	]
}

exports.getChoicesForSlot = function () {
	choicesList = []
	for (let i = 1; i <= numberOfPresentationSlots; i++) {
		choicesList.push({ id: `Slot${i}`, label: i })
	}
	return choicesList
}

exports.getChoicesForMediaPlayer = function () {
	choicesList = []
	for (let i = 1; i <= numberOfMediaPlayerSlots; i++) {
		choicesList.push({ id: `Load_MediaPlayer#${i}`, label: `Media ${i}` })
	}
	return choicesList
}
