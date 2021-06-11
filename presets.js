exports.getPresets = function (instance) {
	var self = instance;
	return [{
            category: 'Presentation Control',
            label: 'Previous in full screen',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Prev',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Navigation_PrevFS'
            }]
        }, {
            category: 'Presentation Control',
            label: 'Next in full screen',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Next',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Navigation_NextFS'
            }]
        }, {
            category: 'Presentation Control',
            label: 'Next without putting to fullscreen',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'next no fs',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Navigation_NextNoFS'
            }]
        }, {
            category: 'Presentation Control',
            label: 'Put current in fullscreen',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'currnt',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Navigation_CurrentFS'
            }]
        }, {
            category: 'Presentation Control',
            label: 'Close all except current',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'close others',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Navigation_CloseOthers'
            }]
        }, {
            category: 'Presentation Control',
            label: 'Simulate left arrow keystroke',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: '<',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Keystroke',
                options: {
                	'Key': 'Key_Left'
                }
            }]
        }, {
            category: 'Presentation Control',
            label: 'Simulate right arrow keystroke',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: '>',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Keystroke',
                options: {
                	'Key': 'Key_Right'
                }
            }]
        }, {
            category: 'Presentation Control',
            label: 'Simulate Esc keystroke',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Esc',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Keystroke',
                options: {
                	'Key': 'Key_Esc'
                }
            }]
        }, {
            category: 'Presentation Control',
            label: 'Simulate B keystroke',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'B',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Keystroke',
                options: {
                	'Key': 'Key_B'
                }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 1',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 1',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture1'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture1'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 2',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 2',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture2'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture2'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 3',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 3',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture3'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture3'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 4',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 4',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture4'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture4'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 5',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 5',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture5'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture5'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 6',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 6',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture6'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture6'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 7',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 7',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture7'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture7'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 8',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 8',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture8'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture8'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 9',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 9',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture9'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture9'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Capture Image 10',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Captr 10',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Capture_Image',
                delay: 0,
                options: {
                	'Key': 'Capture10'
                }
            }],
            feedbacks: [{
                type: 'feedback_captured',
                options: {
                	'Key': 'Capture10'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(200, 180, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 1',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 1',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display1'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display1'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display1'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 2',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 2',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display2'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display2'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display2'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 1',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 3',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display3'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display3'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display3'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 4',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 4',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display4'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display4'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display4'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 5',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 5',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display5'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display5'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display5'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 6',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 6',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display6'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display6'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display6'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 7',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 7',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display7'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display7'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display7'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 8',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 8',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display8'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display8'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display8'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 9',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 9',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display9'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display9'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display9'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Image 10',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Disply 10',
                alignment: 'center:center',
                size: 'auto',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Display10'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Display10'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 90, 0)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Display10'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Test Image',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Test image',
                alignment: 'center:center',
                size: '18',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'DisplayTest'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'DisplayTest'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(153, 0, 153)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'DisplayTest'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Display Blackout',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Blackout',
                alignment: 'center:center',
                size: '14',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Blackout'
                }
            }],
            feedbacks: [{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Blackout'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
            category: 'Still Images',
            label: 'Freeze',
            bank: {
                bgcolor: 0,
                style: 'text',
                text: 'Freeze',
                alignment: 'center:center',
                size: '18',
                color: 16777215

            },
            actions: [{
                action: 'Display_Image',
                delay: 0,
                options: {
                	'Key': 'Freeze'
                }
            }],
            feedbacks: [{
                type: 'feedback_loaded',
                options: {
                	'Key': 'Freeze'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(0, 51, 153)
	            }
            },{
                type: 'feedback_displayed',
                options: {
                	'Key': 'Freeze'
                },
	            style: {
	                color: self.rgb(255, 255, 255),
	                bgcolor: self.rgb(255, 0, 0)
	            }
            }]
        }, {
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
        }

	]
}