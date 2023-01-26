var choices = require('./choices');
function getSlideNumber(txtLabel) {
	return {
        type: 'number',
        label: txtLabel,
        id: 'SlideNumber',
        min: 1,
        max: 100000,
        default: 1,
        step: 1,
        required: true,
        range: false
	}
}



exports.getActions = function (instance) {

    function action_callback(action) {    
        var cmd = '';
        var terminationChar = '$';
        cmd = getCommand(action);
        cmd += terminationChar;
        if (cmd !== undefined && cmd !== terminationChar) {
            if (instance.socket !== undefined && instance.socket.isConnected) {
                instance.socket.send(cmd);
            }
        }
    }



	return {
        'Navigation_NextFS': {
            name: 'Next presentation',
            options: [
				getSlideNumber('Go to slide'),
                {
                    type: 'checkbox',
                    label: 'Run presentation in fullscreen',
                    id: 'Fullscreen',
                    default: true
                }
            ],
            callback: action_callback
        },
        'Navigation_PrevFS': {
            name: 'Prev presentation',
            options: [
				getSlideNumber('Go to slide'),
                {
                    type: 'checkbox',
                    label: 'Run presentation in fullscreen',
                    id: 'Fullscreen',
                    default: true
                }
            ],
            callback: action_callback
        },
        // 'Navigation_NextNoFS': { label: 'Next without putting to fullscreen' },
        'Navigation_CurrentFS': { name: 'Put current in fullscreen', options: [], callback: action_callback },
        'Navigation_CloseOthers': { name: 'Close all except current', options: [], callback: action_callback },

        'Keystroke': {
            name: 'Simulate keystroke',
            options: [
                {
                    type: 'dropdown',
                    label: 'Key',
                    id: 'Key',
                    default: 'Key_Right',
                    choices: [
                        { id: 'Key_Right', label: 'Right Arrow' },
                        { id: 'Key_Left', label: 'Left Arrow' },
                        { id: 'Key_Esc', label: 'Escape' },
                        { id: 'Key_B', label: 'B' }
                    ]
                }
            ],
            callback: action_callback
        },

        'Capture_Image': {
            name: 'Capture Image',
            options: [
                {
                    type: 'dropdown',
                    label: 'Destination',
                    id: 'Key',
                    default: 'Capture1',
                    choices: choices.getChoicesForCapture()
                }
            ],
            callback: action_callback
        },

        'Display_Image': {
            name: 'Display Image',
            options: [
                {
                    type: 'dropdown',
                    label: 'Source',
                    id: 'Key',
                    default: 'Display1',
                    choices: choices.getChoicesForDisplay()
                }
            ],
            callback: action_callback
        },

        'ExitImages': { name: 'Exit Images', options: [] },

        'states': { name: 'Refresh', options: [] },

        'OpenStart_Presentation': {
            name: 'Open/Start Presentation',
            options: [
                {
                    type: 'textinput',
                    label: 'Filename',
                    id: 'Filename',
                    default: '',
                    tooltip: 'Open the file with the filename (absolute file path)'
                },
				getSlideNumber('Go to slide'),
                {
                    type: 'checkbox',
                    label: 'Run presentation in fullscreen',
                    id: 'Fullscreen',
                    default: true
                }
            ],
            callback: action_callback
        },

        'Generic': {
            name: 'Generic - Go to slide',
            options: [
                getSlideNumber('Slide Nr.')
            ],
            callback: action_callback
        },

        'Powerpoint_Go': {
        	name: 'Powerpoint: Go to slide',
        	options: [
        		getSlideNumber('Slide Nr.')
        	],
            callback: action_callback
        },
        'Powerpoint_Previous': {
        	name: 'Powerpoint: Previous slide',
            options: [],
            callback: action_callback
        },
        'Powerpoint_Next': {
        	name: 'Powerpoint: Next slide',
            options: [],
            callback: action_callback
        },

        'Acrobat_Go': {
        	name: 'Adobe Acrobat DC: Go to slide',
        	options: [
        		getSlideNumber('Slide Nr.')
        	],
            callback: action_callback
        },
        'Acrobat_Previous': {
        	name: 'Adobe Acrobat DC: Previous slide',
            options: [],
            callback: action_callback
        },
        'Acrobat_Next': {
        	name: 'Adobe Acrobat DC: Next slide',
            options: [],
            callback: action_callback
        },

        'Keynote_Go': {
        	name: 'Keynote: Go to slide',
        	options: [
        		getSlideNumber('Slide Nr.')
        	],
            callback: action_callback
        },
        'Keynote_Previous': {
        	name: 'Keynote: Previous slide',
            options: [],
            callback: action_callback
        },
        'Keynote_Next': {
        	name: 'Keynote: Next slide',
            options: [],
            callback: action_callback
        },

		'OpenStart_Presentation_Slot': {
            name: 'Open/Start Presentation from slot',
            options: [
                {
                    type: 'dropdown',
                    label: 'Slot',
                    id: 'Key',
                    default: 'Slot1',
                    choices: choices.getChoicesForSlot()
                },
				getSlideNumber('Go to slide'),
                {
                    type: 'checkbox',
                    label: 'Run presentation in fullscreen',
                    id: 'Fullscreen',
                    default: true
                }
            ],
            callback: action_callback
        }

	}
}

function getCommand(action) {
	var cmd = '';
    var separatorChar = '^';
    switch (action.actionId) {
        case 'Navigation_NextFS':
        // case 'Navigation_NextNoFS':
            if (action.options.SlideNumber === 1) {
                if (action.options.Fullscreen) {
                    cmd = 'Navigation_NextFS';
                } else {
                    cmd = 'Navigation_NextNoFS';
                }
            } else {
                cmd = 'Navigation_NextFS' + separatorChar;
                cmd += action.options.SlideNumber + separatorChar;
                cmd += (action.options.Fullscreen ? 1 : 0);
            }
            break;
        case 'Navigation_PrevFS':
            if (action.options.SlideNumber === 1 && 
                action.options.Fullscreen) {
                cmd = 'Navigation_PrevFS';
            } else {
                cmd = 'Navigation_PrevFS' + separatorChar;
                cmd += action.options.SlideNumber + separatorChar;
                cmd += (action.options.Fullscreen ? 1 : 0);
            }
            break;
        case 'Navigation_CurrentFS':
        case 'Navigation_CloseOthers':
            cmd = action.actionId;
            break;
        case 'Keystroke':
            cmd = action.options.Key;
            break;
        case 'Capture_Image':
        case 'Display_Image':
            cmd = action.options.Key;
            break;
        case 'ExitImages':
        case 'states':
            cmd = action.actionId;
            break;
        case 'OpenStart_Presentation':
            cmd = 'OpenStart_Presentation' + separatorChar;
            cmd += action.options.SlideNumber + separatorChar;
            cmd += (action.options.Fullscreen ? 1 : 0) + separatorChar;
            cmd += action.options.Filename;
            break;
        case 'Generic':
            cmd = 'Generic' + separatorChar;
            cmd += action.options.SlideNumber;
            break;
        case 'Powerpoint_Go':
        case 'Acrobat_Go':
        case 'Keynote_Go':
            cmd = action.actionId + separatorChar;
            cmd += action.options.SlideNumber;
        	break;
        case 'Powerpoint_Previous':
		case 'Powerpoint_Next':
        case 'Acrobat_Previous':
       	case 'Acrobat_Next':
        case 'Keynote_Previous':
		case 'Keynote_Next':
        	cmd = action.actionId;
        	break;
        case 'OpenStart_Presentation_Slot':
            cmd = 'OpenStart_Presentation_Slot' + separatorChar;
            cmd += action.options.SlideNumber + separatorChar;
            cmd += (action.options.Fullscreen ? 1 : 0) + separatorChar;
            cmd += action.options.Key.substring(4);
            break;
    };
    return cmd;
}