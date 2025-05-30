const { 
	numberOfPresentationSlots, 
	numberOfMediaPlayerSlots, 
	minNumberOfPresentationFolderFiles, 
	numberOfPresentationFolders,
	minNumberOfMediaFolderFiles, 
	numberOfMediaFolders } = require('./constants')
var choices = require('./choices')
var utils = require('./utils')
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
	var schoices = choices.getChoicesForPresentationFolder()
	var states = new Object()
	for (var i = numberOfPresentationFolders - 1; i >= 0; i--) {
		const si = schoices[i].id
		states[si] = new Object()
		states[si].exists = false
	}
	return states
}
exports.generateMediaFolderStates = function () {
	var schoices = choices.getChoicesForMediaFolder()
	var states = new Object()
	for (var i = numberOfMediaFolders - 1; i >= 0; i--) {
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
	var cchoices = choices.getChoicesForPresentationFolder()
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
exports.updatePresentationFileOpenStates = function (states, openedFileIndex, useNumberedSystem = false) {
	let filesState = states.filesState
	let numberOfFiles = states.filesList.length
	if (!useNumberedSystem) {
		for (var i = Math.max(minNumberOfPresentationFolderFiles, numberOfFiles); i > 0; i--) {
			const si = 'File' + i
			filesState[si].opened = false
			if(i == openedFileIndex + 1)
				filesState[si].opened = true
		}
	}
	else{
        const numberedFiles = new Map();
        
        states.filesList.forEach(file => {
			let fileName = utils.getNameFromPath(file)
            const match = fileName.match(/^(\d+)/);
            if (match) {
                const slotNumber = parseInt(match[1], 10);
                if (!numberedFiles.has(slotNumber)) {
                    numberedFiles.set(slotNumber, file);
                }
            }
        });


		for (var i = Math.max(minNumberOfPresentationFolderFiles, numberOfFiles); i > 0; i--) {
			const si = 'File' + i;
			if (filesState.hasOwnProperty(si)) {
				filesState[si].opened = false;
			}
		}
		
		

		if(openedFileIndex >= 0){
			let openedFilePath = states.originalFilesList[openedFileIndex]
			numberedFiles.forEach((filePath, slotNumber) => {
				if(openedFilePath == filePath){
					const si = 'File' + slotNumber;
					states.filesState[si].opened = true
				}
			});
		}

	}
}
exports.updateMediaFolderStates = function (states, data) {
	for (var i = numberOfMediaFolders; i > 0; i--) {
		const si = 'Folder' + i
		states[si].exists = data.exists[i - 1]
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
exports.updateWatchedPresentationFolderState = function (states, data, useNumberedSystem = false) {
    states.name = data.name
    states.number = data.number
    states.originalFilesList = data.files_list;
    if (!useNumberedSystem) {
        states.filesList = data.files_list

        let numberOfFiles = states.filesList.length
        for (var i = Math.max(minNumberOfPresentationFolderFiles, numberOfFiles); i > 0; i--) {
            const si = 'File' + i
            states.filesState[si] = new Object()
            states.filesState[si].opened = false
            states.filesState[si].exists = false

			if(i <= numberOfFiles)
				states.filesState[si].exists = true
        }
    } else {
        let maxFileNumberPrefix = 0;
        const numberedFiles = new Map();
        
        data.files_list.forEach(file => {
			let fileName = utils.getNameFromPath(file)
            const match = fileName.match(/^(\d+)/);
            if (match) {
                const slotNumber = parseInt(match[1], 10);
                maxFileNumberPrefix = Math.max(maxFileNumberPrefix, slotNumber);
                if (!numberedFiles.has(slotNumber)) {
                    numberedFiles.set(slotNumber, file);
                }
            }
        });

        for (let i = 1; i <= Math.max(minNumberOfPresentationFolderFiles, maxFileNumberPrefix); i++) {
            const si = 'File' + i;
            states.filesState[si] = {
                opened: false,
                exists: false
            };
        }

        states.filesList = new Array(Math.max(minNumberOfPresentationFolderFiles, maxFileNumberPrefix)).fill('');
        numberedFiles.forEach((filename, slotNumber) => {
                states.filesList[slotNumber - 1] = filename;
                const si = 'File' + slotNumber;
                states.filesState[si] = {
                    exists: true
                };
            
        });
    }
}
exports.updateWatchedMediaFolderState = function (states, data) {
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
	mediaPlayerState.hold_at_end_on = data.Media_player_hold_at_end_status == 'on'
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
