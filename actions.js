var choices = require('./choices')
function getSlideNumber(txtLabel) {
	return {
		type: 'textinput',
		label: txtLabel,
		id: 'SlideNumber',
		default: 1,
		required: true,
		useVariables: true,
	}
}

exports.getActions = function (instance) {
	async function action_callback(action) {
		var cmd = ''
		var terminationChar = '$'
		cmd = await getCommand(action, instance)
		if(!cmd)
			return
		cmd += terminationChar
		if (cmd !== undefined && cmd !== terminationChar) {
			instance.log('debug', `sending ${cmd}`)
			if (instance.socket !== undefined && instance.socket.isConnected) {
				instance.socket.send(cmd)
			} else {
				instance.log('warn', 'Cannot send command. Socket not connected.')
			}
		}
	}

	return {
		Navigation_NextFS: {
			name: 'Presentation: Open next in folder',
			options: [
				getSlideNumber('Go to slide'),
				{
					type: 'checkbox',
					label: 'Run presentation in fullscreen',
					id: 'Fullscreen',
					default: true,
				},
			],
			callback: action_callback,
		},
		Navigation_PrevFS: {
			name: 'Presentation: Open previous in folder',
			options: [
				getSlideNumber('Go to slide'),
				{
					type: 'checkbox',
					label: 'Run presentation in fullscreen',
					id: 'Fullscreen',
					default: true,
				},
			],
			callback: action_callback,
		},
		// 'Navigation_NextNoFS': { label: 'Next without putting to fullscreen' },
		Navigation_CurrentFS: {
			name: 'Presentation: Put current in fullscreen',
			options: [],
			callback: action_callback,
		},
		Navigation_CloseOthers: {
			name: 'Presentation: Close all except current',
			options: [],
			callback: action_callback,
		},

		PresentationExit: {
			name: 'Presentation: Exit',
			options: [
				{
					id: 'Key',
					type: 'textinput',
					default: 'Key_Esc',
					isVisible: (_o, _d) => false,
					useVariables: true,
				},
			],
			callback: action_callback,
		},

		SlideNext: {
			name: 'Slide: Next',
			options: [
				{
					id: 'Key',
					type: 'textinput',
					default: 'Key_Right',
					isVisible: (_o, _d) => false,
					useVariables: true,
				},
			],
			callback: action_callback,
		},

		SlidePrevious: {
			name: 'Slide: Previous',
			options: [
				{
					id: 'Key',
					type: 'textinput',
					default: 'Key_Left',
					isVisible: (_o, _d) => false,
					useVariables: true,
				},
			],
			callback: action_callback,
		},

		Capture_Image: {
			name: 'Still Image: Capture',
			options: [
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'Key',
					default: 'Capture1',
					choices: choices.getChoicesForCapture(),
				},
			],
			callback: action_callback,
		},

		Display_Image: {
			name: 'Still Image: Display',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Key',
					default: 'Display1',
					choices: choices.getChoicesForDisplay(),
				},
			],
			callback: action_callback,
		},

		ExitImages: { name: 'Still Image: Exit', options: [], callback: action_callback },

		SetSelected_PresentationFolder: {
			name: 'Set presentation folder X',
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: [
						{ id: `Previous`, label: `Previous` },
						{ id: `Next`, label: `Next` },
					].concat(choices.getChoicesForFolder()),
				},
			],
			callback: action_callback,
		},

		Change_selected_presentation_in_watched_folder: {
			name: 'Presentation: Scroll selected presentation in watched folder',
			options: [
				{
					type: 'dropdown',
					label: 'Scroll value',
					id: 'ScrollValue',
					default: "1",
					tooltip: 'Scroll value',
					choices: [
						{id: "-10", label: "-10"},
						{id: "-1", label: "-1"},
						{id: "1", label: "+1"},
						{id: "10", label: "+10"},
						
					],
				},
			],
			callback: action_callback,
		},
		open_presentation_from_watched_folder: {
			name: 'Presentation: Open from watched folder',
			options: [
				{
					type: 'dropdown',
					label: 'File name',
					id: 'FileNumber',
					default: 'File1',
					tooltip: 'Open the file with the filename (From the watched folder)',
					choices: choices.getChoicesForFolderFiles(instance.watchedFolderState.filesList),
				},
				getSlideNumber('Go to slide'),
				{
					type: 'checkbox',
					label: 'Run presentation in fullscreen',
					id: 'Fullscreen',
					default: true,
				},
			],
			callback: action_callback,
		},

		OpenStart_Presentation: {
			name: 'Presentation: Open from file path',
			options: [
				{
					type: 'textinput',
					label: 'File path',
					id: 'Filename',
					default: '',
					tooltip: 'Open the file with the filename (absolute file path)',
					useVariables: true,
				},
				getSlideNumber('Go to slide'),
				{
					type: 'checkbox',
					label: 'Run presentation in fullscreen',
					id: 'Fullscreen',
					default: true,
				},
			],
			callback: action_callback,
		},

		Generic: {
			name: 'Slide: Go to slide',
			options: [getSlideNumber('Slide Nr.')],
			callback: action_callback,
		},

		Powerpoint_Go: {
			name: 'Powerpoint: Go to slide',
			options: [getSlideNumber('Slide Nr.')],
			callback: action_callback,
		},
		Powerpoint_Previous: {
			name: 'Powerpoint: Previous slide',
			options: [],
			callback: action_callback,
		},
		Powerpoint_Next: {
			name: 'Powerpoint: Next slide',
			options: [],
			callback: action_callback,
		},

		Acrobat_Go: {
			name: 'Adobe Acrobat DC: Go to slide',
			options: [getSlideNumber('Slide Nr.')],
			callback: action_callback,
		},
		Acrobat_Previous: {
			name: 'Adobe Acrobat DC: Previous slide',
			options: [],
			callback: action_callback,
		},
		Acrobat_Next: {
			name: 'Adobe Acrobat DC: Next slide',
			options: [],
			callback: action_callback,
		},

		Keynote_Go: {
			name: 'Keynote: Go to slide',
			options: [getSlideNumber('Slide Nr.')],
			callback: action_callback,
		},
		Keynote_Previous: {
			name: 'Keynote: Previous slide',
			options: [],
			callback: action_callback,
		},
		Keynote_Next: {
			name: 'Keynote: Next slide',
			options: [],
			callback: action_callback,
		},

		OpenStart_Presentation_Slot: {
			name: 'Presentation: Open from slot',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getChoicesForSlot(),
				},
				getSlideNumber('Go to slide'),
				{
					type: 'checkbox',
					label: 'Run presentation in fullscreen',
					id: 'Fullscreen',
					default: true,
				},
			],
			callback: action_callback,
		},

		CapturePresentationSlot: {
			name: 'Presentation: Capture current presentation',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getChoicesForSlot(),
				},
			],
			callback: action_callback,
		},

		CaptureFolder: {
			name: "Presentation: Capture current presentation's folder",
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: choices.getChoicesForFolder(),
				},
			],
			callback: action_callback,
		},

		Play_MediaPlayer: {
			name: 'Media Player: Play',
			options: [],
			callback: action_callback,
		},

		Pause_MediaPlayer: {
			name: 'Media Player: Pause',
			options: [],
			callback: action_callback,
		},

		Restart_MediaPlayer: {
			name: 'Media Player: Restart',
			options: [],
			callback: action_callback,
		},

		Stop_MediaPlayer: {
			name: 'Media Player: Stop',
			options: [],
			callback: action_callback,
		},

		Loop_MediaPlayer: {
			name: 'Media Player: Loop mode',
			options: [],
			callback: action_callback,
		},

		Fade_MediaPlayer: {
			name: 'Media Player: Fade mode',
			options: [],
			callback: action_callback,
		},

		Load_MediaPlayer: {
			name: 'Media Player: Load',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Key',
					default: 'Load_MediaPlayer#1',
					choices: [
						{ id: `Load_MediaPlayer#Previous`, label: `Previous` },
						{ id: `Load_MediaPlayer#Next`, label: `Next` },
					].concat(choices.getChoicesForMediaPlayer()),
				},
			],
			callback: action_callback,
		},

		MediaPlayer_Position: {
			name: 'Media Player: Go to position',
			options: [
				{
					type: 'number',
					label: 'Go to position (seconds)',
					id: 'Seconds',
					default: 0,
					min: 0,
					step: 1,
					required: true,
					range: false,
				},
			],
			callback: action_callback,
		},

		MediaPlayer_Forward: {
			name: 'Media Player: Move forward',
			options: [
				{
					type: 'number',
					label: 'Move forward (seconds)',
					id: 'Seconds',
					default: 10,
					min: 1,
					step: 1,
					required: true,
					range: false,
				},
			],
			callback: action_callback,
		},

		MediaPlayer_Rewind: {
			name: 'Media Player: Move back',
			options: [
				{
					type: 'number',
					label: 'Move back (seconds)',
					id: 'Seconds',
					default: 10,
					min: 1,
					step: 1,
					required: true,
					range: false,
				},
			],
			callback: action_callback,
		},
	}
}

async function getCommand(action, instance) {
	var cmd = ''
	var separatorChar = '^'
	var mediaPlayerSeparatorChar = '#'
	switch (action.actionId) {
		case 'Navigation_NextFS':
			// case 'Navigation_NextNoFS':
			if (action.options.SlideNumber === 1) {
				if (action.options.Fullscreen) {
					cmd = 'Navigation_NextFS'
				} else {
					cmd = 'Navigation_NextNoFS'
				}
			} else {
				cmd = 'Navigation_NextFS' + separatorChar
				cmd += action.options.SlideNumber + separatorChar
				cmd += action.options.Fullscreen ? 1 : 0
			}
			break
		case 'Navigation_PrevFS':
			if (action.options.SlideNumber === 1 && action.options.Fullscreen) {
				cmd = 'Navigation_PrevFS'
			} else {
				cmd = 'Navigation_PrevFS' + separatorChar
				cmd += action.options.SlideNumber + separatorChar
				cmd += action.options.Fullscreen ? 1 : 0
			}
			break
		case 'PresentationExit':
		case 'SlideNext':
		case 'SlidePrevious':
			cmd = await instance.parseVariablesInString(action.options.Key)
		case 'Capture_Image':
		case 'Display_Image':
		case 'Load_MediaPlayer':
			cmd = action.options.Key
			break
		case 'SetSelected_PresentationFolder':
			if(action.options.Key == 'Next' || action.options.Key == 'Previous'){
				cmd = action.actionId + separatorChar + action.options.Key
			}else{
				let folderNumMatches = action.options.Key.match(/\d+$/);
				if (folderNumMatches) {
					number = folderNumMatches[0];
					cmd = action.actionId + separatorChar + number
				}
			}
			break;
		case 'open_presentation_from_watched_folder':
			let fileNumberMatches = action.options.FileNumber.match(/\d+$/);
			if (fileNumberMatches) {
				cmd = 'OpenStart_Presentation' + separatorChar
				cmd += action.options.SlideNumber + separatorChar
				cmd += (action.options.Fullscreen ? 1 : 0) + separatorChar
				let fileNumber = fileNumberMatches[0]
				let filePath = instance.watchedFolderState.filesList[fileNumber - 1]
				cmd += filePath
			}
			break
		case 'OpenStart_Presentation':
			let path = await instance.parseVariablesInString(action.options.Filename)
			
			if(!path)
				return

			cmd = action.actionId + separatorChar
			cmd += action.options.SlideNumber + separatorChar
			cmd += (action.options.Fullscreen ? 1 : 0) + separatorChar
			cmd += path
			break
		case 'Generic':
			cmd = 'Generic' + separatorChar
			cmd += action.options.SlideNumber
			break
		case 'Powerpoint_Go':
		case 'Acrobat_Go':
		case 'Keynote_Go':
			cmd = action.actionId + separatorChar
			cmd += action.options.SlideNumber
			break
		case 'OpenStart_Presentation_Slot':
			cmd = 'OpenStart_Presentation_Slot' + separatorChar
			cmd += action.options.SlideNumber + separatorChar
			cmd += (action.options.Fullscreen ? 1 : 0) + separatorChar
			cmd += action.options.Key.substring(4)
			break
		case 'CapturePresentationSlot':
			cmd = action.actionId + separatorChar + action.options.Key.substring(4)
			break
		case 'CaptureFolder':
			cmd = action.actionId + separatorChar + action.options.Key.substring(6)
			break
		case 'MediaPlayer_Position':
		case 'MediaPlayer_Forward':
		case 'MediaPlayer_Rewind':
			cmd = action.actionId + mediaPlayerSeparatorChar
			cmd += action.options.Seconds
			break
		case 'Change_selected_presentation_in_watched_folder':
			scrollSelectedPresentation(instance, action.options.ScrollValue)
			break
		default:
			cmd = action.actionId
			break
	}
	return cmd
}


function scrollSelectedPresentation(instance, delta) {
	var self = instance
	const values = {}
	let filesList = self.watchedFolderState.filesList
	
	if(!filesList || filesList.length == 0)
		return

	let oldSelectedNumber = self.getVariableValue('watched_folder_selected_presentation_number')
	if(!oldSelectedNumber)
		oldSelectedNumber = 1
	let newSelectedNumber = parseInt(oldSelectedNumber) + parseInt(delta)
	let sIndex = ((newSelectedNumber - 1) % filesList.length + filesList.length) % filesList.length;
	values['watched_folder_selected_presentation_number'] = sIndex + 1
	values['watched_folder_total_files_count'] = filesList.length
	values['watched_folder_selected_presentation_path'] = filesList[sIndex]
	values['watched_folder_selected_presentation_name'] = filesList[sIndex].split('\\').pop()
	self.setVariableValues(values)
}