const { numberOfPresentationSlots, numberOfMediaPlayerSlots, minNumberOfPresentationFolderFiles, numberOfPresentationFolders } = require('./constants')
var choices = require('./choices')
exports.generateCaptureStates = function () {
	var cchoices = choices.getChoicesForCapture()
	var states = new Object()
	for (var i = cchoices.length - 1; i >= 0; i--) {
		var ci = cchoices[i].id
		states[ci] = false
	}
	return states
}
exports.generateDisplayStates = function () {
	var dchoices = choices.getChoicesForDisplay()
	var states = new Object()
	for (var i = dchoices.length - 1; i >= 0; i--) {
		var di = dchoices[i].id
		states[di] = new Object()
		states[di].loaded = false
		states[di].displayed = false
	}
	return states
}
exports.generateSlotStates = function () {
	var schoices = choices.getChoicesForSlot()
	var states = new Object()
	for (var i = numberOfPresentationSlots - 1; i >= 0; i--) {
		const si = schoices[i].id
		states[si] = new Object()
		states[si].exists = false
		states[si].opened = false
	}
	return states
}
exports.generatePresentationFolderStates = function () {
	var schoices = choices.getChoicesForFolder()
	var states = new Object()
	for (var i = numberOfPresentationFolders - 1; i >= 0; i--) {
		const si = schoices[i].id
		states[si] = new Object()
		states[si].exists = false
	}
	return states
}
exports.generateSlotCaptureStates = function () {
	var cchoices = choices.getChoicesForSlot()
	var states = new Object()
	for (var i = cchoices.length - 1; i >= 0; i--) {
		var ci = cchoices[i].id
		states[ci] = false
	}
	return states
}
exports.generateFolderCaptureStates = function () {
	var cchoices = choices.getChoicesForFolder()
	var states = new Object()
	for (var i = cchoices.length - 1; i >= 0; i--) {
		var ci = cchoices[i].id
		states[ci] = false
	}
	return states
}
function doUpdateDisplayStates(states, data) {
	const key = 'Display' + (data.displayIndex + 1)
	for (const k in states) {
		states[k].displayed = false
		if (key === k) {
			states[key].displayed = true
		}
	}
	states.DisplayTest.displayed = data.displayTest
	states.Freeze.displayed = data.displayFreeze
	states.Blackout.displayed = data.displayBlack
}
exports.updateStates = function (states, data) {
	// DisplayTest
	states.DisplayTest.loaded = true
	// Freeze
	states.Freeze.loaded = true
	// Blackout
	states.Blackout.loaded = true

	for (var i = data.isLoaded.length; i > 0; i--) {
		var key = 'Display' + i
		states[key].loaded = data.isLoaded[i - 1]
	}

	doUpdateDisplayStates(states, data)
}
exports.updateDisplayStates = function (states, data) {
	doUpdateDisplayStates(states, data)
}
exports.updateCaptureStates = function (states, index) {
	const key = 'Capture' + (index + 1)
	for (const k in states) {
		if (key === k) {
			states[k] = true
		} else {
			states[k] = false
		}
	}
}
exports.uploadLoadStates = function (states, index) {
	const key = 'Display' + (index + 1)
	for (const k in states) {
		if (key === k) {
			states[key].loaded = true
		}
	}
}
exports.updateUnloadStates = function (states, index) {
	const key = 'Display' + (index + 1)
	for (const k in states) {
		if (key === k) {
			states[key].loaded = false
		}
	}
}
exports.updateSlotStates = function (states, data) {
	for (var i = numberOfPresentationSlots; i > 0; i--) {
		const si = 'Slot' + i
		states[si].exists = data.exists[i - 1]
		states[si].opened = data.opened[i - 1]
	}
}
exports.updatePresentationFolderStates = function (states, data) {
	for (var i = numberOfPresentationFolders; i > 0; i--) {
		const si = 'Folder' + i
		states[si].exists = data.exists[i - 1]
	}
}
exports.updatePresentationFileStates = function (states, openedFileIndex) {
	let filesState = states.filesState
	let numberOfFiles = states.filesList.length
	for (var i = Math.max(minNumberOfPresentationFolderFiles, numberOfFiles); i > 0; i--) {
		const si = 'File' + i
		filesState[si] = new Object()
		filesState[si].opened = false
		filesState[si].exists = false
		if(i == openedFileIndex + 1)
			filesState[si].opened = true
		if(i <= numberOfFiles)
			filesState[si].exists = true
	}
}
exports.updateSlotCaptureStates = function (states, index) {
	const key = 'Slot' + (index + 1)
	for (const k in states) {
		if (key === k) {
			states[k] = true
		} else {
			states[k] = false
		}
	}
}
exports.updateFolderCaptureStates = function (states, index) {
	const key = 'Folder' + (index + 1)
	for (const k in states) {
		if (key === k) {
			states[k] = true
		} else {
			states[k] = false
		}
	}
}
exports.updateWatchedPresentationFolderState = function (states, data) {
		states.name = data.name
		states.number = data.number
		states.filesList = data.files_list
}

exports.generateMediaSlotStates = function () {
	var schoices = choices.getChoicesForMediaPlayer()
	var states = new Object()
	states['any_media_loaded'] = new Object()
	states['any_media_loaded'].loaded = false
	for (var i = numberOfMediaPlayerSlots - 1; i >= 0; i--) {
		const si = schoices[i].id
		states[si] = new Object()
		states[si].playing = false
		states[si].loaded = false
	}
	return states
}
exports.updateMediaPlayerState = function (mediaPlayerState, data) {
	mediaPlayerState.playing = data.Media_playback_state == 'playing'
	mediaPlayerState.paused = data.Media_playback_state == 'paused'
	mediaPlayerState.loop_on = data.Media_player_loop_status == 'on'
	mediaPlayerState.fade_on = data.Media_player_fade_status == 'on'
	mediaPlayerState.slots['any_media_loaded'].loaded = false

	// Slots
	for (var i = numberOfMediaPlayerSlots; i > 0; i--) {
		const si = 'Load_MediaPlayer#' + i
		if (data.Media_playing == i) {
			mediaPlayerState.slots[si].playing = true
		} else {
			mediaPlayerState.slots[si].playing = false
		}

		if (data.Media_loaded == i) {
			mediaPlayerState.slots[si].loaded = true
			mediaPlayerState.slots['any_media_loaded'].loaded = true
		} else {
			mediaPlayerState.slots[si].loaded = false
		}
	}
}
