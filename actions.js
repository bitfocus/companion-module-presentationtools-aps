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
	var self = instance;

	return {
        'Navigation_NextFS': {
            label: 'Next presentation',
            options: [
				getSlideNumber('Go to slide'),
                {
                    type: 'checkbox',
                    label: 'Run presentation in fullscreen',
                    id: 'Fullscreen',
                    default: true
                }
            ]
        },
        'Navigation_PrevFS': {
            label: 'Prev presentation',
            options: [
				getSlideNumber('Go to slide'),
                {
                    type: 'checkbox',
                    label: 'Run presentation in fullscreen',
                    id: 'Fullscreen',
                    default: true
                }
            ]
        },
        // 'Navigation_NextNoFS': { label: 'Next without putting to fullscreen' },
        'Navigation_CurrentFS': { label: 'Put current in fullscreen' },
        'Navigation_CloseOthers': { label: 'Close all except current' },

        'Keystroke': {
            label: 'Simulate keystroke',
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
            ]
        },

        'Capture_Image': {
            label: 'Capture Image',
            options: [
                {
                    type: 'dropdown',
                    label: 'Destination',
                    id: 'Key',
                    default: 'Capture1',
                    choices: choices.getChoicesForCapture()
                }
            ]
        },

        'Display_Image': {
            label: 'Display Image',
            options: [
                {
                    type: 'dropdown',
                    label: 'Source',
                    id: 'Key',
                    default: 'Display1',
                    choices: choices.getChoicesForDisplay()
                }
            ]
        },

        'ExitImages': { label: 'Exit Images' },

        'states': { label: 'Refresh' },

        'OpenStart_Presentation': {
            label: 'Open/Start Presentation',
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
            ]
        },

        'Generic': {
            label: 'Generic - Go to slide',
            options: [
                getSlideNumber('Slide Nr.')
            ]
        },

        'Powerpoint_Go': {
        	label: 'Powerpoint: Go to slide',
        	options: [
        		getSlideNumber('Slide Nr.')
        	]
        },
        'Powerpoint_Previous': {
        	label: 'Powerpoint: Previous slide'
        },
        'Powerpoint_Next': {
        	label: 'Powerpoint: Next slide'
        },

        'Acrobat_Go': {
        	label: 'Adobe Acrobat DC: Go to slide',
        	options: [
        		getSlideNumber('Slide Nr.')
        	]
        },
        'Acrobat_Previous': {
        	label: 'Adobe Acrobat DC: Previous slide'
        },
        'Acrobat_Next': {
        	label: 'Adobe Acrobat DC: Next slide'
        },

        'Keynote_Go': {
        	label: 'Keynote: Go to slide',
        	options: [
        		getSlideNumber('Slide Nr.')
        	]
        },
        'Keynote_Previous': {
        	label: 'Keynote: Previous slide'
        },
        'Keynote_Next': {
        	label: 'Keynote: Next slide'
        },

		'OpenStart_Presentation_Slot': {
            label: 'Open/Start Presentation from slot',
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
            ]
        }

	}
}

exports.getCommand = function (action) {
	var cmd = '';
    var separatorChar = '^';
    switch (action.action) {
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
            cmd = action.action;
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
            cmd = action.action;
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
            cmd = action.action + separatorChar;
            cmd += action.options.SlideNumber;
        	break;
        case 'Powerpoint_Previous':
		case 'Powerpoint_Next':
        case 'Acrobat_Previous':
       	case 'Acrobat_Next':
        case 'Keynote_Previous':
		case 'Keynote_Next':
        	cmd = action.action;
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