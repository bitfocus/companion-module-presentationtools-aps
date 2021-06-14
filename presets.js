exports.getPresets = function (instance) {
	var self = instance;
	var presets = [];

	//Presentation Control
	presets.push(getPresetForPresentationControl('Previous in full screen', 'Prev', 'Navigation_PrevFS'));
	presets.push(getPresetForPresentationControl('Next in full screen', 'Next', 'Navigation_NextFS'));
	presets.push(getPresetForPresentationControl('Next without putting to fullscreen', 'next no fs', 'Navigation_NextNoFS'));
	presets.push(getPresetForPresentationControl('Put current in fullscreen', 'currnt', 'Navigation_CurrentFS'));
	presets.push(getPresetForPresentationControl('Close all except current', 'close others', 'Navigation_CloseOthers'));
	presets.push(getPresetForPresentationControl('Simulate left arrow keystroke', '<', 'Keystroke', {'Key': 'Key_Left'}));
	presets.push(getPresetForPresentationControl('Simulate right arrow keystroke', '>', 'Keystroke', {'Key': 'Key_Right'}));
	presets.push(getPresetForPresentationControl('Simulate Esc keystroke', 'Esc', 'Keystroke', {'Key': 'Key_Esc'}));
	presets.push(getPresetForPresentationControl('Simulate B keystroke', 'B', 'Keystroke', {'Key': 'Key_B'}));

	// Still Images - Capture
	for (var i = 1; i <= 10; i++) {
		presets.push(getPresetForStillImageCapture(`Capture Image ${i}`, `Captr ${i}`, `Capture${i}`, self.rgb(200, 180, 0)));
	}

	// Still Images - Display
	for (var i = 1; i <= 10; i++) {
		presets.push(getPresetForStillImageDisplay(`Display Image ${i}`, `Disply ${i}`, `Display${i}`, self.rgb(0, 90, 0), self.rgb(255, 0, 0)));
	}
	presets.push(getPresetForStillImageDisplay('Display Test Image', 'Test image', 'DisplayTest', self.rgb(153, 0, 153), self.rgb(255, 0, 0), '18'));
	presets.push(getPresetForStillImageDisplay('Display Blackout', 'Blackout', 'Blackout', self.rgb(0, 0, 0), self.rgb(255, 0, 0), '14'));
	presets.push(getPresetForStillImageDisplay('Freeze', 'Freeze', 'Freeze', self.rgb(0, 51, 153), self.rgb(255, 0, 0), '18'));
	presets.push(getPresetForStillImageExit());

	return presets;
}

function getPresetForPresentationControl(lbl, txt, act, opt = null) {
	return {
        category: 'Presentation Control',
        label: lbl,
        bank: {
            bgcolor: 0,
            style: 'text',
            text: txt,
            alignment: 'center:center',
            size: 'auto',
            color: 16777215

        },
        actions: [{
            action: act,
            options: opt
        }]
    };
}

function getPresetForStillImageCapture(lbl, txt, key, clr) {
	return {
        category: 'Still Images',
        label: lbl,
        bank: {
            bgcolor: 0,
            style: 'text',
            text: txt,
            alignment: 'center:center',
            size: 'auto',
            color: 16777215

        },
        actions: [{
            action: 'Capture_Image',
            delay: 0,
            options: {
            	'Key': key
            }
        }],
        feedbacks: [{
            type: 'captured',
            options: {
            	'Key': key
            },
            style: {
                color: 16777215,
                bgcolor: clr
            }
        }]
    };
}

function getPresetForStillImageDisplay(lbl, txt, key, clr1, crl2, siz = 'auto') {
	return {
        category: 'Still Images',
        label: lbl,
        bank: {
            bgcolor: 0,
            style: 'text',
            text: txt,
            alignment: 'center:center',
            size: siz,
            color: 16777215

        },
        actions: [{
            action: 'Display_Image',
            delay: 0,
            options: {
            	'Key': key
            }
        }],
        feedbacks: [{
            type: 'loaded',
            options: {
            	'Key': key
            },
            style: {
                color: 16777215,
                bgcolor: clr1
            }
        },{
            type: 'displayed',
            options: {
            	'Key': key
            },
            style: {
                color: 16777215,
                bgcolor: crl2
            }
        }]
    };
}

function getPresetForStillImageExit() {
	return {
        category: 'Still Images',
        label: 'Exit Images',
        bank: {
            bgcolor: 0,
            style: 'text',
            text: 'Exit images',
            alignment: 'center:center',
            size: 'auto',
            color: 16777215

        },
        actions: [{ action: 'ExitImages' }]
    };
}