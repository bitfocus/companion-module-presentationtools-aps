var choices = require('./choices')
const { numberOfPresentationSlots, numberOfMediaPlayerSlots, numberOfImagesSlots } = require('./constants')
var utils = require('./utils')
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

function sendMessage(socket, message){
	// Convert the message to a Buffer
    const messageBuffer = Buffer.from(message, 'utf-8');
    const messageLength = messageBuffer.length;

    // Create a Buffer for the message length (4 bytes, big-endian)
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(messageLength);

    // Concatenate the buffers: prefix + length + message
    const fullMessage = Buffer.concat([lengthBuffer, messageBuffer]);

    // Send the full message to the server
    socket.send(fullMessage);
}

exports.send = sendMessage

exports.getActions = function (instance) {
	async function action_callback(action) {
		let cmd = ''		
		const handler = instance.apiVersionMapping[instance.toBeUsedAPIversion].commandHandler;
		data = await handler(action, instance);
		
		if (instance.socket == undefined || !instance.socket.isConnected)
			return

		if(!data.command)
			return

		if(instance.toBeUsedAPIversion == 1){
			cmd = data.command
			cmd += '$'
			instance.socket.send(cmd)
		}else{
			cmd = JSON.stringify(data)
			sendMessage(instance.socket, cmd)
		}

		instance.log('debug', `sending ${cmd}`)
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
					type: 'dropdown',
					label: 'Application',
					id: 'Key',
					default: "Key_Right",
					tooltip: 'Application',
					choices: 
						[
							{id: "Key_Right", label: "All"},
							{id: "Powerpoint_Next", label: "Powerpoint"},
							{id: "Acrobat_Next", label: "Acrobat"},
							{id: "Keynote_Next", label: "Keynote"},
						]
				},
			],
			callback: action_callback,
		},

		SlidePrevious: {
			name: 'Slide: Previous',
			options: [
				{
					type: 'dropdown',
					label: 'Application',
					id: 'Key',
					default: "Key_Left",
					tooltip: 'Application',
					choices: 
						[
							{id: "Key_Left", label: "All"},
							{id: "Powerpoint_Previous", label: "Powerpoint"},
							{id: "Acrobat_Previous", label: "Acrobat"},
							{id: "Keynote_Previous", label: "Keynote"},
						]
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
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForCapture()),
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
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForDisplay()),
				},
			],
			callback: action_callback,
		},

		ExitImages: { name: 'Still Image: Exit', options: [], callback: action_callback },

		SetSelected_PresentationFolder: {
			name: 'Presentation: Set watched folder',
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: [
						{ id: `Previous`, label: `Previous` },
						{ id: `Next`, label: `Next` },
					].concat(choices.getChoicesForPresentationFolder()),
				},
			],
			callback: action_callback,
		},

		Change_selected_presentation_in_watched_presentation_folder: {
			name: 'Presentation: Select from watched folder',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'File',
					default: "1",
					tooltip: 'File',
					choices: 
						choices.getDeltaValues()
						.concat(choices.getChoicesForPresentationFolderFiles(instance.watchedPresentationFolderState.filesList)),
				},
			],
			callback: action_callback,
		},
		open_presentation_from_watched_presentation_folder: {
			name: 'Presentation: Open from watched presentation folder',
			options: [
				{
					type: 'dropdown',
					label: 'File name',
					id: 'FileNumber',
					default: 'File1',
					tooltip: 'Open the file with the filename (From the watched presentation folder)',
					choices: choices.getChoicesForPresentationFolderFiles(instance.watchedPresentationFolderState.filesList),
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

		select_presentation_slot: {
			name: 'Presentation: Select slot',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Slot',
					default: "Slot1",
					tooltip: 'Slot',
					choices: 
						choices.getNextPrevDeltaValues()
						.concat(choices.getChoicesForSlot()),
				},
			],
			callback: action_callback,
		},

		select_media_slot: {
			name: 'Media: Select slot',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Slot',
					default: "Media1",
					tooltip: 'Slot',
					choices: 
						choices.getNextPrevDeltaValues()
						.concat(choices.getChoicesForMedia()),
				},
			],
			callback: action_callback,
		},

		select_image_slot: {
			name: 'Still Image: Select slot',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Slot',
					default: "Image1",
					tooltip: 'Slot',
					choices: 
						choices.getNextPrevDeltaValues()
						.concat(choices.getChoicesForImage()),
				},
			],
			callback: action_callback,
		},

		SetSelected_MediaFolder: {
			name: 'Media Player: Set watched folder',
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: [
						{ id: `Previous`, label: `Previous` },
						{ id: `Next`, label: `Next` },
					].concat(choices.getChoicesForMediaFolder()),
				},
			],
			callback: action_callback,
		},

		Change_selected_media_in_watched_media_folder: {
			name: 'Media Player: Select from watched folder',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'File',
					default: "1",
					tooltip: 'File',
					choices: 
						choices.getDeltaValues()
						.concat(choices.getChoicesForMediaFolderFiles(instance.watchedMediaFolderState.filesList)),
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


		GoToSlide: {
			name: 'Slide: Go to slide',
			options: [
				{
					type: 'dropdown',
					label: 'Application',
					id: 'App',
					default: "Generic",
					tooltip: 'Application',
					choices: 
						[
							{id: "Generic", label: "All"},
							{id: "Powerpoint_Go", label: "Powerpoint"},
							{id: "Acrobat_Go", label: "Acrobat"},
							{id: "Keynote_Go", label: "Keynote"},
						]
				},
				getSlideNumber('Slide Nr.')
			],
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
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForSlot()),
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

		CapturePresentation: {
			name: 'Presentation: Capture current presentation',
			options: [
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'destination',
					default: 'Slot',
					choices: [
						{id: "Slot", label: "Slot"},
						{id: "Folder", label: "Folder"},
					],
				},
				{
					type: 'dropdown',
					label: 'Number',
					id: 'Slot',
					default: 'Slot1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForSlot()),
					isVisible: (opt, _d) => opt.destination == 'Slot',
				},
				{
					type: 'dropdown',
					label: 'Number',
					id: 'Folder',
					default: 'Folder1',
					choices: choices.getChoicesForPresentationFolder(),
					isVisible: (opt, _d) => opt.destination == 'Folder',
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

		HoldAtEnd_MediaPlayer: {
			name: 'Media Player: hold at end',
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
					].concat(choices.getItemForSelectedOption()).concat(choices.getChoicesForMediaPlayer()),
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
		Clear: {
			name: 'Clear',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'Key',
					default: "StillImages",
					tooltip: 'Type',
					choices: [
						{id: "StillImages", label: "Still Images"},
						{id: "Media", label: "Media Slot"},
						{id: "SlotPresentations", label: "Presentation Slot"},
						{id: "PresentationFolders", label: "Presentation Folders"},
						{id: "MediaFolders", label: "Media Folders"},
					],
				},
				{
					type: 'dropdown',
					label: 'Source',
					id: 'StillImages',
					tooltip: 'Set <<All>> to clear all slots\nSet <<Selected>> to clear selected slot',
					default: 'All',
					choices: [
						{ id: `All`, label: `All` },
					].concat(choices.getItemForSelectedOption())
					.concat(choices.getChoicesForImage()),
					isVisible: (opt, _d) => opt.Key == 'StillImages',
				},
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Media',
					tooltip: 'Set <<All>> to clear all slots\nSet <<Selected>> to clear selected slot',
					default: 'All',
					choices: [
						{ id: `All`, label: `All` },
					].concat(choices.getItemForSelectedOption())
					.concat(choices.getChoicesForMedia()),
					isVisible: (opt, _d) => opt.Key == 'Media',
				},
				{
					type: 'dropdown',
					label: 'Source',
					id: 'SlotPresentations',
					tooltip: 'Set <<All>> to clear all slots\nSet <<Selected>> to clear selected slot',
					default: 'All',
					choices: [
						{ id: `All`, label: `All` },
					].concat(choices.getItemForSelectedOption())
					.concat(choices.getChoicesForSlot()),
					isVisible: (opt, _d) => opt.Key == 'SlotPresentations',
				},
				{
					type: 'dropdown',
					label: 'Source',
					id: 'PresentationFolders',
					tooltip: 'Set <<All>> to clear all slots',
					default: 'All',
					choices: [
						{ id: `All`, label: `All` },
					].concat(choices.getChoicesForPresentationFolder()),
					isVisible: (opt, _d) => opt.Key == 'PresentationFolders',
				},
				{
					type: 'dropdown',
					label: 'Source',
					id: 'MediaFolders',
					tooltip: 'Set <<All>> to clear all slots',
					default: 'All',
					choices: [
						{ id: `All`, label: `All` },
					].concat(choices.getChoicesForMediaFolder()),
					isVisible: (opt, _d) => opt.Key == 'MediaFolders',
				},
			],
			callback: action_callback,
		},
		SetPresentationSlotPath: {
			name: 'Presentation: Set file path for slot',
			options: [
				{
					type: 'textinput',
					label: 'File Path',
					id: 'FilePath',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForSlot()),
				},
				
			],
			callback: action_callback,
		},
		SetMediaSlotPath: {
			name: 'Media Player: Set file path for slot',
			options: [
				{
					type: 'textinput',
					label: 'File Path',
					id: 'FilePath',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Media',
					id: 'Key',
					default: 'Media1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForMedia()),
				},
				
			],
			callback: action_callback,
		},
		SetImageSlotPath: {
			name: 'Still Images: Set file path for slot',
			options: [
				{
					type: 'textinput',
					label: 'File Path',
					id: 'FilePath',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Image',
					id: 'Key',
					default: 'Image1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForImage()),
				},
				
			],
			callback: action_callback,
		},

		OpenWebPage: {
			name: 'WebPage: Open',
			options: [
				{
					type: 'textinput',
					label: 'Web address',
					id: 'url',
					useVariables: true,
				},
				{
					type: 'checkbox',
					label: 'Run in fullscreen',
					id: 'fullscreen',
					default: true,
				},
				{
					type: 'checkbox',
					label: 'New tab',
					id: 'newTab',
					default: true,
				},
			],
			callback: action_callback,
		},

		SwitchTab: {
			name: 'WebPage: Switch tab',
			options: [
				{
					type: 'dropdown',
					label: 'Tab',
					id: 'Tab',
					default: "Tab1",
					tooltip: 'Tab',
					choices: choices.getChoicesForTabs(instance.browserState.tabsList),
				},
			],
			callback: action_callback,
		},

		DeleteTab: {
			name: 'WebPage: Delete tab',
			options: [
				{
					type: 'dropdown',
					label: 'Tab',
					id: 'Tab',
					default: "Tab1",
					tooltip: 'Tab',
					choices: choices.getChoicesForTabs(instance.browserState.tabsList),
				},
			],
			callback: action_callback,
		},
	}
}

exports.getCommandV1 = async function (action, instance) {
	var cmd = ''
	var separatorChar = '^'
	var mediaPlayerSeparatorChar = '#'
	let slideNumber = 1
	switch (action.actionId) {
		case 'Navigation_NextFS':
			slideNumber = parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			// case 'Navigation_NextNoFS':
			if (slideNumber === 1) {
				if (action.options.Fullscreen) {
					cmd = 'Navigation_NextFS'
				} else {
					cmd = 'Navigation_NextNoFS'
				}
			} else {
				cmd = 'Navigation_NextFS' + separatorChar
				cmd += slideNumber + separatorChar
				cmd += action.options.Fullscreen ? 1 : 0
			}
			break
		case 'Navigation_PrevFS':
			slideNumber = parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			if (slideNumber === 1 && action.options.Fullscreen) {
				cmd = 'Navigation_PrevFS'
			} else {
				cmd = 'Navigation_PrevFS' + separatorChar
				cmd += slideNumber + separatorChar
				cmd += action.options.Fullscreen ? 1 : 0
			}
			break
		case 'PresentationExit':
		case 'SlideNext':
		case 'SlidePrevious':
			cmd = await instance.parseVariablesInString(action.options.Key)
		case 'Capture_Image':
			if(action.options.Key == 'selected'){
				cmd = 'Capture' + instance.getVariableValue('image_slot_selected_number')
			}else{
				cmd = action.options.Key
			}
			break
		case 'Display_Image':
			if(action.options.Key == 'selected'){
				cmd = 'Display' + instance.getVariableValue('image_slot_selected_number')
			}else{
				cmd = action.options.Key
			}
			break
		case 'Load_MediaPlayer':
			if(action.options.Key == 'selected'){
				cmd = 'Load_MediaPlayer#' + instance.getVariableValue('media_slot_selected_number')
			}else{
				cmd = action.options.Key
			}
			break
		case 'OpenStart_Presentation':
			slideNumber = parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			let path = await instance.parseVariablesInString(action.options.Filename)
			
			if(!path)
				return

			cmd = action.actionId + separatorChar
			cmd += slideNumber + separatorChar
			cmd += (action.options.Fullscreen ? 1 : 0) + separatorChar
			cmd += path
			break
		case 'OpenStart_Presentation_Slot':
			slideNumber = parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			cmd = action.actionId + separatorChar
			cmd += slideNumber + separatorChar
			cmd += (action.options.Fullscreen ? 1 : 0) + separatorChar

			let slot = action.options.Key
			if(slot == 'selected'){
				slot = instance.getVariableValue('presentation_slot_selected_number')
			}
			cmd += utils.extcractNumber(slot)
			break
		case 'GoToSlide':
			slideNumber = parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			cmd = action.options.App + separatorChar + slideNumber
			break
		case 'MediaPlayer_Position':
		case 'MediaPlayer_Forward':
		case 'MediaPlayer_Rewind':
			cmd = action.actionId + mediaPlayerSeparatorChar
			cmd += action.options.Seconds
			break

		case 'select_presentation_slot':
			selectPresentationSlot(
				instance,
				action.options.Slot,
				choices.getNextPrevDeltaValues().some(item => item.id === action.options.Slot))
			instance.checkFeedbacks('presentation_slot_selected', 'slot_exist', 'slot_displayed')
			break
		case 'select_media_slot':
			selectMediaSlot(
				instance,
				action.options.Slot,
				choices.getNextPrevDeltaValues().some(item => item.id === action.options.Slot))
			instance.checkFeedbacks('media_slot_selected', 'Media_loaded', 'Media_playing')
			break
		case 'select_image_slot':
			selectImageSlot(
				instance,
				action.options.Slot,
				choices.getNextPrevDeltaValues().some(item => item.id === action.options.Slot))
			instance.checkFeedbacks('image_slot_selected', 'loaded', 'displayed')
			break
		default:
			cmd = action.actionId
			break
	}
	return {command: cmd}
}

exports.getCommandV2 = async function (action, instance) {
	let data = {
		"command": action.actionId,
	}

	let slideNumber = 1
	switch (action.actionId) {
		case 'Navigation_NextFS':
			slideNumber = parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			if (slideNumber === 1 && !action.options.Fullscreen) {
				data.command = 'Navigation_NextNoFS'
			} else {
				data.parameters = {
					slideNr: slideNumber,
					isFullscreen: action.options.Fullscreen,
				}
			}
			break
		case 'Navigation_PrevFS':
			slideNumber = parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			if (slideNumber !== 1 || !action.options.Fullscreen) {
				data.parameters = {
					slideNr: slideNumber,
					isFullscreen: action.options.Fullscreen,
				}
			}
			break
		case 'PresentationExit':
		case 'SlideNext':
		case 'SlidePrevious':
			data.command = await instance.parseVariablesInString(action.options.Key)
			break
		case 'Capture_Image':
		case 'Display_Image':
			let key = action.options.Key
			let bankNumber = null
			if(action.options.Key == 'selected'){
				bankNumber = instance.getVariableValue('image_slot_selected_number')
			}
			else{
				bankNumber = utils.extcractNumber(key)
			}
			if(!bankNumber){
				// Test | Freeze | Black
				data.command = key
			}else{
				data.parameters = {
					bank_number: bankNumber,
				}
			}
			break
		case 'Load_MediaPlayer':
			if(action.options.Key.includes('#Next') || action.options.Key.includes('#Previous')){
				data.parameters = {
					bank_number: action.options.Key.split('#')[1],
				}
			}else if(action.options.Key == 'selected'){
				data.parameters = {
					bank_number: instance.getVariableValue('media_slot_selected_number'),
				}
			}else{
				data.parameters = {
					bank_number: utils.extcractNumber(action.options.Key),
				}
			}
			break
		case 'SetSelected_PresentationFolder':
			if(action.options.Key == 'Next' || action.options.Key == 'Previous'){
				data.parameters = {
					bank_number: action.options.Key,
				}
			}else{
				data.parameters = {
					bank_number: utils.extcractNumber(action.options.Key),
				}
			}
			break;
		case 'open_presentation_from_watched_presentation_folder':
			data.command = 'OpenStart_Presentation'
			data.parameters = {
				file_path: instance.watchedPresentationFolderState.filesList[utils.extcractNumber(action.options.FileNumber) - 1],
				slideNr: parseInt(await instance.parseVariablesInString(action.options.SlideNumber)),
				isFullscreen: action.options.Fullscreen,
			}
			break
		case 'OpenStart_Presentation':
			let path = await instance.parseVariablesInString(action.options.Filename)
			
			if(!path)
				return

			data.parameters = {
				file_path: path,
				slideNr: parseInt(await instance.parseVariablesInString(action.options.SlideNumber)),
				isFullscreen: action.options.Fullscreen,
			}
			break
		case 'SetSelected_MediaFolder':

			if(action.options.Key == 'Next' || action.options.Key == 'Previous'){
				data.parameters = {
					bank_number: action.options.Key,
				}
			}else{
				data.parameters = {
					bank_number: utils.extcractNumber(action.options.Key),
				}
			}
			break;
		case 'OpenStart_Presentation_Slot':
			let slot = action.options.Key
			if(slot == 'selected'){
				slot = instance.getVariableValue('presentation_slot_selected_number')
			}
			data.parameters = {
				slot: utils.extcractNumber(slot),
				isFullscreen: action.options.Fullscreen,
				slideNr: parseInt(await instance.parseVariablesInString(action.options.SlideNumber)),
			}
			break
		case 'GoToSlide':
			data.command = action.options.App,
			data.parameters = {
				slideNr: parseInt(await instance.parseVariablesInString(action.options.SlideNumber))
			}
			break
		case 'CapturePresentation':
			if(action.options.destination == 'Slot'){
				let slot = action.options.Slot
				if(slot == 'selected'){
					slot = instance.getVariableValue('presentation_slot_selected_number')
				}
				data.command = 'CapturePresentationSlot'
				data.parameters = {
					bank_number: utils.extcractNumber(slot),
				}
			}
			else if (action.options.destination == 'Folder'){
				data.command = 'CaptureFolder'
				data.parameters = {
					bank_number: utils.extcractNumber(action.options.Folder),
				}
			}
			break
		case 'MediaPlayer_Position':
		case 'MediaPlayer_Forward':
		case 'MediaPlayer_Rewind':
			data.parameters = {
				video_seconds: action.options.Seconds,
			}
			break
		case 'Change_selected_presentation_in_watched_presentation_folder':
			data.command = ''
			selectPresentationFile(
				instance,
				action.options.File,
				choices.getDeltaValues().some(item => item.id === action.options.File))
			instance.checkFeedbacks('presentation_file_selected', 'presentation_file_displayed')
			break
		case 'Change_selected_media_in_watched_media_folder':
			data.command = ''
			selectMediaFile(
				instance,
				action.options.File,
				choices.getDeltaValues().some(item => item.id === action.options.File))
			instance.checkFeedbacks('media_file_selected')
			break
		case 'select_presentation_slot':
			data.command = ''
			selectPresentationSlot(
				instance,
				action.options.Slot,
				choices.getNextPrevDeltaValues().some(item => item.id === action.options.Slot))
			instance.checkFeedbacks('presentation_slot_selected', 'slot_exist', 'slot_displayed')
			break
		case 'select_media_slot':
			data.command = ''
			selectMediaSlot(
				instance,
				action.options.Slot,
				choices.getNextPrevDeltaValues().some(item => item.id === action.options.Slot))
			instance.checkFeedbacks('media_slot_selected', 'Media_loaded', 'Media_playing')
			break
		case 'select_image_slot':
			data.command = ''
			selectImageSlot(
				instance,
				action.options.Slot,
				choices.getNextPrevDeltaValues().some(item => item.id === action.options.Slot))
			instance.checkFeedbacks('image_slot_selected', 'loaded', 'displayed')
			break
		case 'Clear':
			let clear_type_key = action.options.Key
			let clearType = action.options[clear_type_key]
			let source = ''
			if(clearType == 'All'){
				source = 'All'
			}
			else if(clearType == 'selected'){
				if(clear_type_key == 'SlotPresentations'){
					source = instance.getVariableValue('presentation_slot_selected_number')
				}
				else if(clear_type_key == 'Media'){
					source = instance.getVariableValue('media_slot_selected_number')
				}
				else if(clear_type_key == 'StillImages'){
					source = instance.getVariableValue('image_slot_selected_number')
				}
			}
			else{
				source = utils.extcractNumber(clearType)
			}
			

			data.parameters = {
				clear_type_key: clear_type_key,
				bank_number: source,
			}
			break
		case 'SetPresentationSlotPath':
			{
				let key = action.options.Key
				if(key == 'selected'){
					key = instance.getVariableValue('presentation_slot_selected_number')
				}
				data.parameters = {
					slot: utils.extcractNumber(key),
					file_path: await instance.parseVariablesInString(action.options.FilePath),
				}

				if(!data.parameters.file_path){
					// Don't send the command
					data.command = ''
				}
			}
			break
		case 'SetMediaSlotPath':
			{
				let key = action.options.Key
				if(key == 'selected'){
					key = instance.getVariableValue('media_slot_selected_number')
				}
				data.parameters = {
					bank_number: utils.extcractNumber(key),
					file_path: await instance.parseVariablesInString(action.options.FilePath),
				}

				if(!data.parameters.file_path){
					// Don't send the command
					data.command = ''
				}
			}
			break
		case 'SetImageSlotPath':
			{
				let key = action.options.Key
				if(key == 'selected'){
					key = instance.getVariableValue('image_slot_selected_number')
				}
				data.parameters = {
					bank_number: utils.extcractNumber(key),
					file_path: await instance.parseVariablesInString(action.options.FilePath),
				}

				if(!data.parameters.file_path){
					// Don't send the command
					data.command = ''
				}
			}
			break
		case 'OpenWebPage':
			{
				data.parameters = {
					url: await instance.parseVariablesInString(action.options.url),
					fullscreen: action.options.fullscreen,
					new_tab: action.options.newTab,
				}
			}
			break
		case 'SwitchTab':
			{
				data.parameters = {
					tabId: instance.browserState.tabsList[parseInt(utils.extcractNumber(action.options.Tab)) - 1].id,
				}
			}
			break
		case 'DeleteTab':
			{
				data.parameters = {
					tabId: instance.browserState.tabsList[parseInt(utils.extcractNumber(action.options.Tab)) - 1].id,
				}
			}
			break
		default:
			break
	}
	return data
}


function selectPresentationFile(instance, selectionValue, delta = false) {
	var self = instance
	const values = {}
	let filesList = self.watchedPresentationFolderState.filesList
	
	if(!filesList || filesList.length == 0)
		return

	let sIndex = 0
	if(delta){
		let oldSelectedNumber = self.getVariableValue('watched_presentation_folder_selected_presentation_number')
		if(!oldSelectedNumber)
			oldSelectedNumber = 1
		let newSelectedNumber = parseInt(oldSelectedNumber) + parseInt(selectionValue)
		sIndex = ((newSelectedNumber - 1) % filesList.length + filesList.length) % filesList.length;
	}
	else {
		// Extcract number
		let newSelectedNumber = parseInt(utils.extcractNumber(selectionValue))
		if(newSelectedNumber > filesList.length)
			return
		sIndex = newSelectedNumber - 1

	}
	values['watched_presentation_folder_selected_presentation_number'] = sIndex + 1
	values['watched_presentation_folder_total_files_count'] = filesList.length
	values['watched_presentation_folder_selected_presentation_path'] = filesList[sIndex]
	values['watched_presentation_folder_selected_presentation_name'] = utils.getNameFromPath(filesList[sIndex])
	self.setVariableValues(values)
}

function selectMediaFile(instance, selectionValue, delta = false) {
	// delta means one of -1, +1, ...
	var self = instance
	const values = {}
	let filesList = self.watchedMediaFolderState.filesList
	
	if(!filesList || filesList.length == 0)
		return
	let sIndex = 0
	if(delta){
		let oldSelectedNumber = self.getVariableValue('watched_media_folder_selected_media_number')
		if(!oldSelectedNumber)
			oldSelectedNumber = 1
		let newSelectedNumber = parseInt(oldSelectedNumber) + parseInt(selectionValue)
		sIndex = ((newSelectedNumber - 1) % filesList.length + filesList.length) % filesList.length;
	}
	else {
		// Extcract number
		let newSelectedNumber = parseInt(utils.extcractNumber(selectionValue))
		if(newSelectedNumber > filesList.length)
			return
		sIndex = newSelectedNumber - 1

	}
	values['watched_media_folder_selected_media_number'] = sIndex + 1
	values['watched_media_folder_total_files_count'] = filesList.length
	values['watched_media_folder_selected_media_path'] = filesList[sIndex]
	values['watched_media_folder_selected_media_name'] = utils.getNameFromPath(filesList[sIndex])
	self.setVariableValues(values)
}


function getNewSelectedNumber(input, current, max, delta){
	let newSelectedNumber = 1
	if(delta){
		if(!current)
			current = 1
		newSelectedNumber = (parseInt(current) - 1 + parseInt(input) + max) % max + 1;
	}
	else {
		newSelectedNumber = parseInt(utils.extcractNumber(input))
	}
	return newSelectedNumber
}

function selectPresentationSlot(instance, selectionValue, delta = false) {
	let newSelectedNumber = getNewSelectedNumber(
		selectionValue, instance.getVariableValue('presentation_slot_selected_number'), numberOfPresentationSlots, delta)
		
	instance.setVariableValues({
		'presentation_slot_selected_number': newSelectedNumber,
		'presentation_slot_selected_filename': instance.getVariableValue(`presentation_slot${newSelectedNumber}`),
	})
}

function selectMediaSlot(instance, selectionValue, delta = false) {
	let newSelectedNumber = getNewSelectedNumber(
		selectionValue, instance.getVariableValue('media_slot_selected_number'), numberOfMediaPlayerSlots, delta)

	instance.setVariableValues({
		'media_slot_selected_number': newSelectedNumber,
		'media_slot_selected_filename': instance.getVariableValue(`media_slot${newSelectedNumber}`),
	})
}

function selectImageSlot(instance, selectionValue, delta = false) {
	let newSelectedNumber = getNewSelectedNumber(
		selectionValue, instance.getVariableValue('image_slot_selected_number'), numberOfImagesSlots, delta)

	instance.setVariableValues({
		'image_slot_selected_number': newSelectedNumber,
		'image_slot_selected_filename': instance.getVariableValue(`image_slot${newSelectedNumber}`),
	})
}