const { 
	numberOfImagesSlots,
	numberOfPresentationSlots, 
	numberOfMediaPlayerSlots, 
	numberOfPresentationFolders, 
	minNumberOfPresentationFolderFiles,
	numberOfMediaFolders, 
	minNumberOfMediaFolderFiles,
	minNumberOfTabs,
} = require('./constants')
var utils = require('./utils')


exports.getChoicesForImage = function () {
	choicesList = []
	for (let i = 1; i <= numberOfImagesSlots; i++) {
		choicesList.push({ id: `Image${i}`, label: i })
	}
	return choicesList
}

exports.getChoicesForMedia = function () {
	choicesList = []
	for (let i = 1; i <= numberOfMediaPlayerSlots; i++) {
		choicesList.push({ id: `Media${i}`, label: i })
	}
	return choicesList
}

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

exports.getChoicesForPresentationFolder = function () {
	choicesList = []
	for (let i = 1; i <= numberOfPresentationFolders; i++) {
		choicesList.push({ id: `Folder${i}`, label: i })
	}
	return choicesList
}

exports.getChoicesForPresentationFolderFiles = function (filesList) {
	choicesList = []
	for (let i = 1; i <= Math.max(minNumberOfPresentationFolderFiles, filesList.length); i++) {
		let text = `${i} - `
		if(i <= filesList.length && filesList[i - 1] != null) {
			text += utils.getNameFromPath(filesList[i - 1])
		}

		choicesList.push({ id: `File${i}`, label: text})
	}
	return choicesList
}

exports.getChoicesForMediaFolder = function () {
	choicesList = []
	for (let i = 1; i <= numberOfMediaFolders; i++) {
		choicesList.push({ id: `Folder${i}`, label: i })
	}
	return choicesList
}

exports.getChoicesForMediaFolderFiles = function (filesList) {
	choicesList = []
	for (let i = 1; i <= Math.max(minNumberOfMediaFolderFiles, filesList.length); i++) {
		let text = `${i} - `
		if(i <= filesList.length && filesList[i - 1] != null) {
			text += utils.getNameFromPath(filesList[i - 1])
		}

		choicesList.push({ id: `File${i}`, label: text})
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

exports.getDeltaValues = function() {
	return [
			{id: "-10", label: "-10"},
			{id: "-1", label: "-1"},
			{id: "1", label: "+1"},
			{id: "10", label: "+10"},
	]
}

exports.getNextPrevDeltaValues = function() {
	return [
			{id: "-1", label: "Previous"},
			{id: "1", label: "Next"},
	]
}

exports.getItemForSelectedOption = function() {
	return [{id: 'selected', label: 'Selected'}]
}

exports.getChoicesForTabs = function (tabsList) {
	choicesList = []
	for (let i = 1; i <= Math.max(minNumberOfTabs, tabsList.length); i++) {
		let text = `${i} - `
		if(i <= tabsList.length && tabsList[i - 1]?.title != null) {
			text += tabsList[i - 1].title
		}

		choicesList.push({ id: `Tab${i}`, label: text})
	}
	return choicesList
}
