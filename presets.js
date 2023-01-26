const { combineRgb  } = require('@companion-module/base')
exports.getPresets = function (instance) {
	var self = instance;
	var presets = {};

	//Presentation Control
	presets['Navigation_PrevFS'] = getPresetForPresentationControl('Previous in full screen', 'Prev', 'Navigation_PrevFS', {'SlideNumber': 1, 'Fullscreen': true});
	presets['Navigation_NextFS'] = getPresetForPresentationControl('Next in full screen', 'Next', 'Navigation_NextFS', {'SlideNumber': 1, 'Fullscreen': true});
	presets['Navigation_NextNoFS'] = getPresetForPresentationControl('Next without putting to fullscreen', 'next no fs', 'Navigation_NextNoFS');
	presets['Navigation_CurrentFS'] = getPresetForPresentationControl('Put current in fullscreen', 'currnt', 'Navigation_CurrentFS');
	presets['Navigation_CloseOthers'] = getPresetForPresentationControl('Close all except current', 'close others', 'Navigation_CloseOthers');
	presets['Key_Left'] = getPresetForPresentationControl('Simulate left arrow keystroke', '<', 'Keystroke', {'Key': 'Key_Left'});
	presets['Key_Right'] = getPresetForPresentationControl('Simulate right arrow keystroke', '>', 'Keystroke', {'Key': 'Key_Right'});
	presets['Key_Esc'] = getPresetForPresentationControl('Simulate Esc keystroke', 'Esc', 'Keystroke', {'Key': 'Key_Esc'});
	presets['Key_B'] = getPresetForPresentationControl('Simulate B keystroke', 'B', 'Keystroke', {'Key': 'Key_B'});

	// Still Images - Capture
	for (var i = 1; i <= 10; i++) {
		presets[`Capture${i}`] = getPresetForStillImageCapture(`Capture Image ${i}`, `Captr ${i}`, `Capture${i}`, combineRgb(200, 180, 0));
	}

	// Still Images - Display
	for (var i = 1; i <= 10; i++) {
		presets[`Display${i}`] = getPresetForStillImageDisplay(`Display Image ${i}`, `Disply ${i}`, `Display${i}`, combineRgb(0, 90, 0), combineRgb(255, 0, 0));
	}
	presets['DisplayTest'] = getPresetForStillImageDisplay('Display Test Image', 'Test image', 'DisplayTest', combineRgb(153, 0, 153), combineRgb(255, 0, 0), '18');
	presets['Blackout'] = getPresetForStillImageDisplay('Display Blackout', 'Blackout', 'Blackout', combineRgb(0, 0, 0), combineRgb(255, 0, 0), '14');
	presets['Freeze'] = getPresetForStillImageDisplay('Freeze', 'Freeze', 'Freeze', combineRgb(0, 51, 153), combineRgb(255, 0, 0), '18');
	presets['ExitImages'] = getPresetForStillImageExit();
    // Presentation Files
    presets['PresentationFilesPrev'] = getPresetForPresentationFiles(self.label, 'Previous', 'prev', combineRgb(0, 0, 0));
    presets['PresentationFilesCurr'] = getPresetForPresentationFiles(self.label, 'Current', 'curr', combineRgb(255, 0, 0));
    presets['PresentationFilesNext'] = getPresetForPresentationFiles(self.label, 'Next', 'next', combineRgb(0, 153, 0));

	//Slot Presentations
	for (let i = 1; i <= 20; i++) {
		presets[`Slot${i}`] = getPresetforSlotPresentation(self.label, `Slot ${i}`, `slot${i}`, i, combineRgb(0, 0, 0), `Slot${i}`, 1, true)
	}

	return presets;
}

function getPresetForPresentationControl(lbl, txt, act, opt = null) {
	return {
        type: 'button',
        category: 'Presentation Control',
        name: lbl,
        style: {
            bgcolor: 0,
            text: txt,
            alignment: 'center:center',
            size: 'auto',
            color: 16777215

        },
        steps: [
            {
                down: [
                    {
                        actionId: act,
                        options: opt
                    }
                ],
                up: []
            }
        ],
        feedbacks: []
    };
}

function getPresetForStillImageCapture(lbl, txt, key, clr) {
	return {
        type: 'button',
        category: 'Still Images',
        name: lbl,
        style: {
            bgcolor: 0,
            text: txt,
            alignment: 'center:center',
            size: 'auto',
            color: 16777215

        },
        steps: [
            {
                down: [
                    {
                        actionId: 'Capture_Image',
                        delay: 0,
                        options: {
                            'Key': key
                        }
                    }
                ],
                up: []
            }
        ],
        feedbacks: [{
            feedbackId: 'captured',
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
        type: 'button',
        category: 'Still Images',
        name: lbl,
        style: {
            bgcolor: 0,
            text: txt,
            alignment: 'center:center',
            size: siz,
            color: 16777215

        },
        steps: [
            {
                down: [
                    {
                        actionId: 'Display_Image',
                        delay: 0,
                        options: {
                            'Key': key
                        }
                    }
                ],
                up: []
            }
        ],
        feedbacks: [{
            feedbackId: 'loaded',
            options: {
            	'Key': key
            },
            style: {
                color: 16777215,
                bgcolor: clr1
            }
        },{
            feedbackId: 'displayed',
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
        type: 'button',
        category: 'Still Images',
        name: 'Exit Images',
        style: {
            bgcolor: 0,
            text: 'Exit images',
            alignment: 'center:center',
            size: 'auto',
            color: 16777215

        },
        steps: [
            {
            down: [{ actionId: 'ExitImages' }],
            up: []
            }
        ],
        feedbacks: []
    };
}

function getPresetForPresentationFiles(instanceLabel, lbl, txt, cr) {
    return {
        type: 'button',
        category: 'Presentation Files',
        name: lbl,
        style: {
            text: `$(${instanceLabel}:${txt})`,
            alignment: 'center:center',
            size: 'auto',
            color: 16777215,
            bgcolor: cr
        }
    };
}

function getPresetforSlotPresentation(instanceLabel, lbl, txt, i, cr, SlotNumber, SlideNumber, Fullscreen) {
    console.log(instanceLabel)
	return {
        type: 'button',
		category: 'Slot Presentations',
		name: lbl,
		style: {
			text: `${i} $(${instanceLabel}:${txt})`,
            alignment: 'center:center',
            size: 'auto',
            color: 16777215,
            bgcolor: cr
		},
		steps: [
            {
                down: [
                    {
                        actionId: 'OpenStart_Presentation_Slot',
                        options: {
                            Key: SlotNumber,
                            SlideNumber: SlideNumber,
                            Fullscreen: Fullscreen
                        }
                    }
                ],
                up: []
            }
		],
		feedbacks: [
			{
				feedbackId: 'slot_exist',
				options: {
					Key: SlotNumber
				},
				style: {
					color: 16777215,
					bgcolor: 13421568
				}
			},
			{
				feedbackId: 'slot_displayed',
				options: {
					Key: SlotNumber
				},
				style: {
					color: 16777215,
					bgcolor: 13369344
				}
			}
		]
	}
}