const { combineRgb } = require('@companion-module/base')
const { 
	numberOfPresentationSlots, 
	numberOfMediaPlayerSlots, 
	minNumberOfPresentationFolderFiles, 
	numberOfPresentationFolders,
	minNumberOfMediaFolderFiles, 
	numberOfMediaFolders } = require('./constants')
exports.getPresets = function (instance) {
	var self = instance
	var presets = {}


	//Presentation Control
	presets['Navigation_PrevFS'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Previous in full screen',
		style: {
			text: "GO prev",
			size: "14",
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'Navigation_PrevFS',
						options: { 
							SlideNumber: 1, 
							Fullscreen: true,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_displayed',
				options: {},
				style: {
					color: 16777215,
					bgcolor: 26112,
				},
			},
		],
	}
	presets['Navigation_NextFS'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Next in full screen',
		style: {
			text: "GO next",
			size: "14",
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'Navigation_NextFS',
						options: {
							SlideNumber: 1,
							Fullscreen: true,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_displayed',
				options: {},
				style: {
					color: 16777215,
					bgcolor: 26112,
				},
			},
		],
	}

	presets['Navigation_CurrentFS'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Put current in fullscreen',
		style: {
			text: "Start",
			size: "14",
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'Navigation_CurrentFS',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_displayed_in_edit_mode',
				options: {},
				style: {
					color: 16777215,
					bgcolor: 26112,
				},
			},
		],
	}
	presets['Navigation_CloseOthers'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Close all except current',
		style: {
			bgcolor: 0,
			text: 'close others',
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
		},
		steps: [
			{
				down: [
					{
						actionId: 'Navigation_CloseOthers',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_displayed',
				options: {},
				style: {
					color: 16777215,
					bgcolor: combineRgb(51, 0, 0),
				},
			},
		],
	}

	presets['Exit'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Presentation Exit',
		style: {
			bgcolor: 0,
			text: 'Esc',
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
		},
		steps: [
			{
				down: [
					{
						actionId: 'PresentationExit',
						options: {
							Key: 'Key_Esc'
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_displayed',
				options: {},
				style: {
					color: 16777215,
					bgcolor: combineRgb(51, 0, 0),
				},
			},
		],
	}

	// Still Images - Capture
	for (let i = 1; i <= 10; i++) {
		presets[`Capture${i}`] = getPresetForStillImageCapture(
			`Capture Image ${i}`,
			`Captr ${i}`,
			`Capture${i}`,
			combineRgb(200, 180, 0),
		)
	}

	// Still Images - Display
	for (let i = 1; i <= 10; i++) {
		presets[`Display${i}`] = getPresetForStillImageDisplay(
			i,
			`Display Image ${i}`,
			`${i} $(${instance.label}:image_slot${i})`,
			`Display${i}`,
			combineRgb(0, 90, 0),
			combineRgb(255, 0, 0),
		)
	}
	presets['DisplayTest'] = getPresetForStillImageDisplay(
		0,
		'Display Test Image',
		'Test image',
		'DisplayTest',
		combineRgb(153, 0, 153),
		combineRgb(255, 0, 0),
		'18',
	)
	presets['Blackout'] = getPresetForStillImageDisplay(
		0,
		'Display Blackout',
		'Blackout',
		'Blackout',
		combineRgb(0, 0, 0),
		combineRgb(255, 0, 0),
		'14',
	)
	presets['Freeze'] = getPresetForStillImageDisplay(
		0,
		'Freeze',
		'Freeze',
		'Freeze',
		combineRgb(0, 51, 153),
		combineRgb(255, 0, 0),
		'18',
	)
	presets['ExitImages'] = getPresetForStillImageExit()
	// Presentation Files
	presets['PresentationFilesPrev'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Previous',
		style: {
			text: `$(${instance.label}:Presentation_previous)`,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: 0,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets['PresentationFilesCurr'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Current',
		style: {
			text: `$(${instance.label}:Presentation_current)`,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: 0,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_displayed',
				options: {},
				style: {
					color: 16777215,
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
	}
	presets['PresentationFilesNext'] = {
		type: 'button',
		category: 'Presentation file control (active presentation)',
		name: 'Next',
		style: {
			text: `$(${instance.label}:Presentation_next)`,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: 0,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_displayed',
				options: {},
				style: {
					color: 16777215,
					bgcolor: 26112,
				},
			},
		],
	}

	//Slot Presentations
	for (let i = 1; i <= numberOfPresentationSlots; i++) {
		presets[`Slot${i}`] = getPresetforSlotPresentation(
			self.label,
			`Slot ${i}`,
			`presentation_slot${i}`,
			i,
			combineRgb(0, 0, 0),
			`Slot${i}`,
			1,
			true,
		)
	}

	//Folders
	presets['PresentationFolderPrev'] = {
		type: 'button',
		category: 'Presentation Select',
		name: 'Previous',
		style: {
			text: "Set folder",
			size: "14",
			alignment: "center:top",
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 6684774,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SetSelected_PresentationFolder',
						options: {
							Key: 'Previous',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['PresentationFolderNext'] = {
		type: 'button',
		category: 'Presentation Select',
		name: 'Next',
		style: {
			text: "Set folder",
			size: "14",
			alignment: "center:top",
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 6684774,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SetSelected_PresentationFolder',
						options: {
							Key: 'Next',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['WatchedPresentationFolderStatistics'] = {
		type: 'button',
		category: 'Presentation Select',
		name: 'Selected Presentation Folder',
		style: {
			text: `$(${self.label}:watched_presentation_folder_number)/${numberOfPresentationFolders}\\n $(${self.label}:watched_presentation_folder_name)`,
			size: '14',
			alignment: "center:center",
			color: 16777215,
			bgcolor: 0,
			show_topbar: false,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}

	// Watched presentation folder select
	presets['PresentationSelectPrev'] = {
		type: 'button',
		category: 'Presentation Select',
		name: 'Previous Presentation File',
		style: {
			text: "Select file",
			size: '14',
			alignment: 'center:top',
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 204,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'Change_selected_presentation_in_watched_presentation_folder',
						options: {
							File: "-1",
						},
					},
				],
				up: [],
			},
		],
	}
	presets['PresentationSelectNext'] = {
		type: 'button',
		category: 'Presentation Select',
		name: 'Next Presentation File',
		style: {
			text: "Select file",
			size: '14',
			alignment: 'center:top',
			png64: "iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAAEDmlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPpu5syskzoPUpqaSDv41lLRsUtGE2uj+ZbNt3CyTbLRBkMns3Z1pJjPj/KRpKT4UQRDBqOCT4P9bwSchaqvtiy2itFCiBIMo+ND6R6HSFwnruTOzu5O4a73L3PnmnO9+595z7t4LkLgsW5beJQIsGq4t5dPis8fmxMQ6dMF90A190C0rjpUqlSYBG+PCv9rt7yDG3tf2t/f/Z+uuUEcBiN2F2Kw4yiLiZQD+FcWyXYAEQfvICddi+AnEO2ycIOISw7UAVxieD/Cyz5mRMohfRSwoqoz+xNuIB+cj9loEB3Pw2448NaitKSLLRck2q5pOI9O9g/t/tkXda8Tbg0+PszB9FN8DuPaXKnKW4YcQn1Xk3HSIry5ps8UQ/2W5aQnxIwBdu7yFcgrxPsRjVXu8HOh0qao30cArp9SZZxDfg3h1wTzKxu5E/LUxX5wKdX5SnAzmDx4A4OIqLbB69yMesE1pKojLjVdoNsfyiPi45hZmAn3uLWdpOtfQOaVmikEs7ovj8hFWpz7EV6mel0L9Xy23FMYlPYZenAx0yDB1/PX6dledmQjikjkXCxqMJS9WtfFCyH9XtSekEF+2dH+P4tzITduTygGfv58a5VCTH5PtXD7EFZiNyUDBhHnsFTBgE0SQIA9pfFtgo6cKGuhooeilaKH41eDs38Ip+f4At1Rq/sjr6NEwQqb/I/DQqsLvaFUjvAx+eWirddAJZnAj1DFJL0mSg/gcIpPkMBkhoyCSJ8lTZIxk0TpKDjXHliJzZPO50dR5ASNSnzeLvIvod0HG/mdkmOC0z8VKnzcQ2M/Yz2vKldduXjp9bleLu0ZWn7vWc+l0JGcaai10yNrUnXLP/8Jf59ewX+c3Wgz+B34Df+vbVrc16zTMVgp9um9bxEfzPU5kPqUtVWxhs6OiWTVW+gIfywB9uXi7CGcGW/zk98k/kmvJ95IfJn/j3uQ+4c5zn3Kfcd+AyF3gLnJfcl9xH3OfR2rUee80a+6vo7EK5mmXUdyfQlrYLTwoZIU9wsPCZEtP6BWGhAlhL3p2N6sTjRdduwbHsG9kq32sgBepc+xurLPW4T9URpYGJ3ym4+8zA05u44QjST8ZIoVtu3qE7fWmdn5LPdqvgcZz8Ww8BWJ8X3w0PhQ/wnCDGd+LvlHs8dRy6bLLDuKMaZ20tZrqisPJ5ONiCq8yKhYM5cCgKOu66Lsc0aYOtZdo5QCwezI4wm9J/v0X23mlZXOfBjj8Jzv3WrY5D+CsA9D7aMs2gGfjve8ArD6mePZSeCfEYt8CONWDw8FXTxrPqx/r9Vt4biXeANh8vV7/+/16ffMD1N8AuKD/A/8leAvFY9bLAAAAbGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAJAAAAABAAAAkAAAAAEAAqACAAQAAAABAAAASKADAAQAAAABAAAAOgAAAAB5CRxGAAAACXBIWXMAABYlAAAWJQFJUiTwAAADiklEQVR4Ae2ZTUhUURTHZzK1TxSCvqAoa+G2UsRt0aIWtYqMoqKgNtUuKAsKouiLoKVBBdWiKPpY1qKV0CIiorCCNJwg0xA0F0Jq0+8vc2Fm1Jk3vHcnX54DP+979913zz3/d+95b66JhJkpYAqYAqaAKWAKmAKmgClgCpgCpoApYAqYAqaAKWAKmAKmgClQHgWS5XHjx0s6na6k58UwD/qSyeSgH08x7BVxauEYDMEwvMmcL4thONEPGTGqoAnuwyDIRuADHIcV0XuNYY8IUQ3NcBP6QTYKn+EUrA4TVqgchPO5YZxHdG+afkahChrhAGyHGhiDFFyCZ+SoH5QlWViBukry5rexE0oxLYWFWe4k1Du4Ao8R6nfWtYKHswteLX4x7P3FPQRv8Ser6WQPvoLrs2Cya1m35h6W1Dj31kSCJTY/v+4fnY/gV0tsHRwELbFakGjf4DI8ZeZ8p5xZxkNSkm6ENugDmZL0FzgDa2aWIploCbwSGuAuDIBMr/lPcBJWzUhhXNAIUAOHoAd+QjscgeWuTRRlqBwUZAAMWHmqOkjbgG2GyCXKOcqByjtLQD81eqkfoIzUvApEADsZ7XmIKpnrVd4LexHjPaV38/2a3kcEUSdJ/dbaCv+FQG6GahY9BHfOYcmm2XMBJI6WVlnM9wxSULIUS0JfsqGMJduf6cD1G6q/IDfry9KnVWQ6175NFOZ7vBPG6NvhVzy+gp4JnmNS4XuJXUWHOpBQsTRvM4h8sRtF2uE5vOb8aBwV8iIQYujj7TqolGlv5iL1E1751O0C7Qo2j7ecZn98LTFtdy7Ki1Vfu2uh09Ujyh6Ob4PGUcd5E2+7sr2h3DgKlV5mEA67IX/3Tj8DPrrBIEYLxzfAPaSX000cN1YvJQJsAf2y/gWdsMM54rgF9J8IZw84KPp7jTb3Mjecdn35Lt3Ti9QPQajfFLRBA2jmdFOvPezNcAvmgOwJtAScPdp7LqtFLhAibCOCVlgP2R+I5zjvgJXgNvsfcXwWrnFfsRmk3UGXyH2lBlx4NII8AWMQxF7QqB46gjTOa7PfYxg5XYf58ZjTEQEsoEIzRG+wYqZ2G0HLbxOM7+9QBrEuGt1hSQ4HaTxt2iDQhrynPNWpdv+0uR4LizIH1ROxXu2FvmM0Uw7z9N/GQh0GGeUSU+J1yXeq+McQZ3Cqi1ZvCpgCpoApYAqYAqZAGRX4CySgGYnzAbC+AAAAAElFTkSuQmCC",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 204,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'Change_selected_presentation_in_watched_presentation_folder',
						options: {
							File: "1",
						},
					},
				],
				up: [],
			},
		],
	}

	presets['CurrentSelectedPresentation'] = {
		type: 'button',
		category: 'Presentation Select',
		name: 'Current selected in watched presentation folder',
		style: {
			text: `$(${self.label}:watched_presentation_folder_selected_presentation_number)/$(${self.label}:watched_presentation_folder_total_files_count)\\n$(${self.label}:watched_presentation_folder_selected_presentation_name)`,
			size: '14',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
			show_topbar: false,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}


// Presentation slot select
presets['PresentationSlotSelectPrev'] = {
	type: 'button',
	category: 'Presentation Select',
	name: 'Previous Presentation Slot',
	style: {
		text: "Select slot",
		size: '14',
		alignment: 'center:top',
		png64: "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",
		alignment: "center:top",
		pngalignment: "center:center",
		color: 16777215,
		bgcolor: 102,
	},
	feedbacks: [],
	steps: [
		{
			down: [
				{
					actionId: 'select_presentation_slot',
					options: {
						Slot: "-1",
					},
				},
			],
			up: [],
		},
	],
}
presets['PresentationSlotSelectNext'] = {
	type: 'button',
	category: 'Presentation Select',
	name: 'Next Presentation Slot',
	style: {
		text: "Select slot",
		size: '14',
		alignment: 'center:top',
		png64: "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",
		alignment: "center:top",
		pngalignment: "center:center",
		color: 16777215,
		bgcolor: 102,
	},
	feedbacks: [],
	steps: [
		{
			down: [
				{
					actionId: 'select_presentation_slot',
					options: {
						Slot: "1",
					},
				},
			],
			up: [],
		},
	],
}

presets['CurrentSelectedPresentationSlot'] = {
	type: 'button',
	category: 'Presentation Select',
	name: 'Current selected presentation slot',
	style: {
		text: `$(${self.label}:presentation_slot_selected_number)/${numberOfPresentationSlots}\\n$(${self.label}:presentation_slot_selected_filename)`,
		size: '14',
		alignment: 'center:center',
		color: 16777215,
		bgcolor: 0,
		show_topbar: false,
	},
	feedbacks: [],
	steps: [
		{
			down: [],
			up: [],
		},
	],
}


presets['StorePresentationSlot'] = {
	type: 'button',
	category: 'Presentation Select',
	name: 'Store slot',
	style: {
		text: `Store slot`,
		size: '14',
		alignment: 'center:top',
		png64: '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',
		pngalignment: "center:center",
		color: 16777215,
		bgcolor: 10066176,
	},
	feedbacks: [],
	steps: [
		{
			down: [],
			up: [
				{
					actionId: 'SetPresentationSlotPath',
					options: {
						FilePath: `$(${self.label}:watched_presentation_folder_selected_presentation_path)`,
						Key: "selected",
					},
				},
			],
			2000: {
				options: {
					runWhileHeld: true,
				},
				actions:[
					{
						actionId: "Clear",
						options: {
							Key: "SlotPresentations",
							SlotPresentations: `selected`,
						},
					}
				]
			},
		},
	],
}

	for (let i = 1; i <= numberOfPresentationFolders; i++) {
		presets[`PresentationFolder${i}`] = getPresetforPresentationFolder(
			self.label,
			`Folder ${i}`,
			`presentation_folder${i}`,
			i,
			combineRgb(0, 0, 0),
			`Folder${i}`,
		)
	}

	//Watched Presentation Folder Presentations
	for (let i = 1; i <= Math.max(minNumberOfPresentationFolderFiles, self.watchedPresentationFolderState.filesList.length); i++) {
		try{
		presets[`PresentationFile${i}`] = getPresetforWatchedPresentationFolderFilesSelect(
			`File ${i}`,
			`${i} - $(${self.label}:presentation_folder_file${i})`,
			combineRgb(0, 0, 0),
			`File${i}`,
		)
		}catch(err){
			self.log('debug', err.message)
		}
	}

	for (let i = 1; i <= Math.max(minNumberOfPresentationFolderFiles, self.watchedPresentationFolderState.filesList.length); i++) {
		try{
		presets[`OpenPresentationFile${i}`] = getPresetforWatchedPresentationFolderFilesOpen(
			`File ${i}`,
			`${i} - $(${self.label}:presentation_folder_file${i})`,
			combineRgb(0, 0, 0),
			`File${i}`,
			1,
			true,
		)
		}catch(err){
			self.log('debug', err.message)
		}
	}


	//Media Folders
	presets['MediaFolderPrev'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Previous',
		style: {
			text: "Set folder",
			size: '14',
			alignment: "center:top",
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 6684774,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SetSelected_MediaFolder',
						options: {
							Key: 'Previous',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['MediaFolderNext'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Next',
		style: {
			text: "Set folder",
			size: '14',
			alignment: "center:top",
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 6684774,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SetSelected_MediaFolder',
						options: {
							Key: 'Next',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['WatchedMediaFolderStatistics'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Selected Media Folder',
		style: {
			text: `$(${self.label}:watched_media_folder_number)/${numberOfMediaFolders}\\n $(${self.label}:watched_media_folder_name)`,
			size: '14',
			alignment: "center:center",
			color: 16777215,
			bgcolor: 0,
			show_topbar: false,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}

	// Watched media folder select
	presets['MediaSelectPrev'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Previous Media File',
		style: {
			text: "Select file",
			size: '14',
			alignment: 'center:top',
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 204,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'Change_selected_media_in_watched_media_folder',
						options: {
							File: "-1",
						},
					},
				],
				up: [],
			},
		],
	}
	presets['MediaSelectNext'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Next Media File',
		style: {
			text: "Select file",
			size: '14',
			alignment: 'center:top',
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 204,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'Change_selected_media_in_watched_media_folder',
						options: {
							File: "1",
						},
					},
				],
				up: [],
			},
		],
	}

	presets['CurrentSelectedMedia'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Current selected in watched media folder',
		style: {
			text: `$(${self.label}:watched_media_folder_selected_media_number)/$(${self.label}:watched_media_folder_total_files_count)\\n$(${self.label}:watched_media_folder_selected_media_name)`,
			size: '14',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
			show_topbar: false,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}

	// Media slot select
	presets['MediaSlotSelectPrev'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Previous Media Slot',
		style: {
			text: "Select slot",
			size: '14',
			alignment: 'center:top',
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 102,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'select_media_slot',
						options: {
							Slot: "-1",
						},
					},
				],
				up: [],
			},
		],
	}
	presets['MediaSlotSelectNext'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Next Media Slot',
		style: {
			text: "Select slot",
			size: '14',
			alignment: 'center:top',
			png64: "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",
			alignment: "center:top",
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 102,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'select_media_slot',
						options: {
							Slot: "1",
						},
					},
				],
				up: [],
			},
		],
	}

	presets['CurrentSelectedMediaSlot'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Current selected media slot',
		style: {
			text: `$(${self.label}:media_slot_selected_number)/${numberOfMediaPlayerSlots}\\n$(${self.label}:media_slot_selected_filename)`,
			size: '14',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
			show_topbar: false,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}


	presets['StoreMediaSlot'] = {
		type: 'button',
		category: 'Media Player Select',
		name: 'Store slot',
		style: {
			text: `Store slot`,
			size: '14',
			alignment: 'center:top',
			png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAAEDmlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPpu5syskzoPUpqaSDv41lLRsUtGE2uj+ZbNt3CyTbLRBkMns3Z1pJjPj/KRpKT4UQRDBqOCT4P9bwSchaqvtiy2itFCiBIMo+ND6R6HSFwnruTOzu5O4a73L3PnmnO9+595z7t4LkLgsW5beJQIsGq4t5dPis8fmxMQ6dMF90A190C0rjpUqlSYBG+PCv9rt7yDG3tf2t/f/Z+uuUEcBiN2F2Kw4yiLiZQD+FcWyXYAEQfvICddi+AnEO2ycIOISw7UAVxieD/Cyz5mRMohfRSwoqoz+xNuIB+cj9loEB3Pw2448NaitKSLLRck2q5pOI9O9g/t/tkXda8Tbg0+PszB9FN8DuPaXKnKW4YcQn1Xk3HSIry5ps8UQ/2W5aQnxIwBdu7yFcgrxPsRjVXu8HOh0qao30cArp9SZZxDfg3h1wTzKxu5E/LUxX5wKdX5SnAzmDx4A4OIqLbB69yMesE1pKojLjVdoNsfyiPi45hZmAn3uLWdpOtfQOaVmikEs7ovj8hFWpz7EV6mel0L9Xy23FMYlPYZenAx0yDB1/PX6dledmQjikjkXCxqMJS9WtfFCyH9XtSekEF+2dH+P4tzITduTygGfv58a5VCTH5PtXD7EFZiNyUDBhHnsFTBgE0SQIA9pfFtgo6cKGuhooeilaKH41eDs38Ip+f4At1Rq/sjr6NEwQqb/I/DQqsLvaFUjvAx+eWirddAJZnAj1DFJL0mSg/gcIpPkMBkhoyCSJ8lTZIxk0TpKDjXHliJzZPO50dR5ASNSnzeLvIvod0HG/mdkmOC0z8VKnzcQ2M/Yz2vKldduXjp9bleLu0ZWn7vWc+l0JGcaai10yNrUnXLP/8Jf59ewX+c3Wgz+B34Df+vbVrc16zTMVgp9um9bxEfzPU5kPqUtVWxhs6OiWTVW+gIfywB9uXi7CGcGW/zk98k/kmvJ95IfJn/j3uQ+4c5zn3Kfcd+AyF3gLnJfcl9xH3OfR2rUee80a+6vo7EK5mmXUdyfQlrYLTwoZIU9wsPCZEtP6BWGhAlhL3p2N6sTjRdduwbHsG9kq32sgBepc+xurLPW4T9URpYGJ3ym4+8zA05u44QjST8ZIoVtu3qE7fWmdn5LPdqvgcZz8Ww8BWJ8X3w0PhQ/wnCDGd+LvlHs8dRy6bLLDuKMaZ20tZrqisPJ5ONiCq8yKhYM5cCgKOu66Lsc0aYOtZdo5QCwezI4wm9J/v0X23mlZXOfBjj8Jzv3WrY5D+CsA9D7aMs2gGfjve8ArD6mePZSeCfEYt8CONWDw8FXTxrPqx/r9Vt4biXeANh8vV7/+/16ffMD1N8AuKD/A/8leAvFY9bLAAAAbGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAJAAAAABAAAAkAAAAAEAAqACAAQAAAABAAAASKADAAQAAAABAAAAOgAAAAB5CRxGAAAACXBIWXMAABYlAAAWJQFJUiTwAAAEJUlEQVR4Ae2ZS0hUURyHHa1Me5Pa0zS1t4sQLCSyQGpTW/fZpnQVLYI2IUGLjIo2bYKiWrdr4aKEgui1KCoV7f2iFNNSU/M1fT+dC1OeGaeZc0eN84fPezj3zrn/891zzj3jpKS4cAacAWfAGXAGnAFnwBlwBpwBZ8AZcAacAWfAGXAGnAFnwBlwBsYNBIPBVMiGIgjY9jLLdoN+tUfn59B2FuRDAWyEwlB5Dcd+KIHvYC2mnSBEZNK7FZAHG0Cd3wSSkguLwRSDVK6C/0MQIpbQmZWgUSAkQVJUXg7zwBTtVH6CLZAOb2E2rIa10AjWwtcRhIQ0Ms0GPdn1oA6sC5UlIwfUub9Do0EdHwUJU1yHC/AGDkAdaFpVwRGQIEm+CdbCiiBEZJCRREiApsJmkIAiUOI6Z4peKl+CRGl9GYEauA06dw0k6AlUBwKBn9yrlHItpIEkNYGEKiR/+gTJlkE9NEEPRIoOTjyHgdAFLRwrIA+2wRdQnPF6R/n4WE0w2MlxDxTAXngKimFoBZ334hGFgNfGlB9JZreXGcdB+ADvwuouU94Ky+AYDIFGwS4lzzED7oLiDuRCMRyGflB0QTPoc6YYpbINJOc8mKbs1LgiGXWoG/Q090MONIDiMYwttBy3Qy+MQC1o31IKl8ALT65Em+IXlZL/ECT+BFRCCWSBppz1SGg4klQmGWl90AK8I4TWhQ6ohNeg/co5KIZhaAWtN1qXTPfvo74dtEhrfdIao8+8gq+sQz0ckxamBP/p5ki6xQcqoB7KQdI64TPkwwIwRZBKiZBEIQnNoM+JHzAAepOlgl4oOopoefchcYhrrES0G8V0AwRd5MLqmC7+8yIJ+gbd4L2F1HlNFaFyPFGFoIZ4Pmj6jI3XfIup4Rjq9HA01YTN0JbDWtgQ5D39B2R1FBIelXH0Tv24AgWgkWktbAjyhHQxtO9by+wfG2Kqa3G3HvHOc1MiNtsytR+xDjn6pu89qIjXxXPCxggy3pek53PiKuQYL0isUm+7Q4xYq9PJlJJvgriZnupOiPQ9zJRPrHULuVAjZkYLUvLefuQkZW30EpkG2g+VQQ14LwaK/oafIyg88xtMh2fhFfGUmbbaPEpQ0iJZC2siIydchq12wtuMWvZ7BHlrxCmefhuZJNJBTbHCqL3x4aSfgiRD38sU+8YP1v5a3S1Hy8pPQdq4nYZF4I2kaLnEek7iP1puM+K9fRPEoqxv4hI0oyNZi/SMleQETfLonKAkCrK5EE+S9oTTI9T4cn+bi3Q6ex39IprIXmdCz2Os0C+sc0PXar9kLWwIehHKppxjIyRbkEaOlgr9Zq+R9B6shQ1B98imDg6Cfm/3ZajT7mTRzgVnId5/ARvbt/a0Q9NrqfEu/lfqoXSw95IkF86AM+AMOAPOgDMwZuA3HjBBIa49utIAAAAASUVORK5CYII=',
			pngalignment: "center:center",
			color: 16777215,
			bgcolor: 10066176,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [
					{
						actionId: 'SetMediaSlotPath',
						options: {
							FilePath: `$(${self.label}:watched_media_folder_selected_media_path)`,
							Key: "selected",
						},
					},
				],
				2000: {
					options: {
						runWhileHeld: true,
					},
					actions:[
						{
							actionId: "Clear",
							options: {
								Key: "Media",
								Media: `selected`,
							},
						}
					]
				},
			},
		],
	}

	// Watched media folders
	for (let i = 1; i <= numberOfMediaFolders; i++) {
		presets[`MediaFolder${i}`] = getPresetforMediaFolder(
			self.label,
			`Folder ${i}`,
			`media_folder${i}`,
			i,
			combineRgb(0, 0, 0),
			`Folder${i}`,
		)
	}

	//Watched Media Folder Media files
	for (let i = 1; i <= Math.max(minNumberOfMediaFolderFiles, self.watchedMediaFolderState.filesList.length); i++) {
		try{
		presets[`MediaFile${i}`] = getPresetforWatchedMediaFolderFiles(
			`File ${i}`,
			`${i} - $(${self.label}:media_folder_file${i})`,
			combineRgb(0, 0, 0),
			`File${i}`,
		)
		}catch(err){
			self.log('debug', err.message)
		}
	}

	// Slides
	presets['SlidePrevious'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Slide Previous',
		style: {
			text: 'Slide',
			size: 'auto',
			png64:
				'iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAEDmlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPpu5syskzoPUpqaSDv41lLRsUtGE2uj+ZbNt3CyTbLRBkMns3Z1pJjPj/KRpKT4UQRDBqOCT4P9bwSchaqvtiy2itFCiBIMo+ND6R6HSFwnruTOzu5O4a73L3PnmnO9+595z7t4LkLgsW5beJQIsGq4t5dPis8fmxMQ6dMF90A190C0rjpUqlSYBG+PCv9rt7yDG3tf2t/f/Z+uuUEcBiN2F2Kw4yiLiZQD+FcWyXYAEQfvICddi+AnEO2ycIOISw7UAVxieD/Cyz5mRMohfRSwoqoz+xNuIB+cj9loEB3Pw2448NaitKSLLRck2q5pOI9O9g/t/tkXda8Tbg0+PszB9FN8DuPaXKnKW4YcQn1Xk3HSIry5ps8UQ/2W5aQnxIwBdu7yFcgrxPsRjVXu8HOh0qao30cArp9SZZxDfg3h1wTzKxu5E/LUxX5wKdX5SnAzmDx4A4OIqLbB69yMesE1pKojLjVdoNsfyiPi45hZmAn3uLWdpOtfQOaVmikEs7ovj8hFWpz7EV6mel0L9Xy23FMYlPYZenAx0yDB1/PX6dledmQjikjkXCxqMJS9WtfFCyH9XtSekEF+2dH+P4tzITduTygGfv58a5VCTH5PtXD7EFZiNyUDBhHnsFTBgE0SQIA9pfFtgo6cKGuhooeilaKH41eDs38Ip+f4At1Rq/sjr6NEwQqb/I/DQqsLvaFUjvAx+eWirddAJZnAj1DFJL0mSg/gcIpPkMBkhoyCSJ8lTZIxk0TpKDjXHliJzZPO50dR5ASNSnzeLvIvod0HG/mdkmOC0z8VKnzcQ2M/Yz2vKldduXjp9bleLu0ZWn7vWc+l0JGcaai10yNrUnXLP/8Jf59ewX+c3Wgz+B34Df+vbVrc16zTMVgp9um9bxEfzPU5kPqUtVWxhs6OiWTVW+gIfywB9uXi7CGcGW/zk98k/kmvJ95IfJn/j3uQ+4c5zn3Kfcd+AyF3gLnJfcl9xH3OfR2rUee80a+6vo7EK5mmXUdyfQlrYLTwoZIU9wsPCZEtP6BWGhAlhL3p2N6sTjRdduwbHsG9kq32sgBepc+xurLPW4T9URpYGJ3ym4+8zA05u44QjST8ZIoVtu3qE7fWmdn5LPdqvgcZz8Ww8BWJ8X3w0PhQ/wnCDGd+LvlHs8dRy6bLLDuKMaZ20tZrqisPJ5ONiCq8yKhYM5cCgKOu66Lsc0aYOtZdo5QCwezI4wm9J/v0X23mlZXOfBjj8Jzv3WrY5D+CsA9D7aMs2gGfjve8ArD6mePZSeCfEYt8CONWDw8FXTxrPqx/r9Vt4biXeANh8vV7/+/16ffMD1N8AuKD/A/8leAvFY9bLAAAAbGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAJAAAAABAAAAkAAAAAEAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAAD6G6/pAAAACXBIWXMAABYlAAAWJQFJUiTwAAACq0lEQVR4Ae2YPWgUQRiGc0nU2GgX0OoKY6VgJ6YRa0UEQYVgoYWFjW1AUASxEERQbATbVNbapRLtlIA/zRGEEILYqIghl5/1eZE9hmV3w2Vdbif3fvBwO8POz/dkbjJzIyMOG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG7ABG8gz0Mqr7LcuSZI9tBmHbqvV2uy3fZPfH606OeTspY8r8AjOUK7cZ9U5Naa9Vg7cgi1QLMHxxkxwkBNBxDhchTVI4w8P1wY5r0aMjYQxOAs/IYzvFE41YpKDmgQCRmEaViAMraRZ+C8b/6DyqzSukodj0IEw1ik8hbFKA8TeGAFteA9hbFCYg/2x51dp/giYhHkIY5PCazhYqfPYG0sAvIQwJOcdHI49v7L56/RbGgiY4IWHcDHz4mfKM/CNd2LeexJO/1uZ3HrFUkEkrlPyXbjRa/HvocvHHLThCMQaErNMnh0krfedBA1vQnpK5rEXquv2SvE+aJtYhEtFcgrPLDTSV2sBjhY13iX1WjnzcI5VtJHNqexiKXn9L7vsCM0vJ0xRv0DkLpbCPQibq6yixzR8BvsgDHW6BjKe23H4coOflccSvCjag7ZNDkl36OA2aMNOQ3LuwRsoW4Xp+038VO5aOSvI6ex4ggjS3esJZDflj9RNwbaSdzx4LA2RMAG6TuhaEcYHCu1Y8qh1nojQafoV6F9jGLp+TNY6eCydI+IQvIXs2UjXkAOx5FHrPBGhfedTjqTn1Ons5EDECfiSI+kBddkjwXAKQ8Rp+Aph/KAwPZxGcrJGxgXQbT6N3zxcznl1eKsQch30Y/0vWICYb/f1/CGRch7uw8l6RnCvNmADNmADNmADNmADNmADNrCrDPwFdF0Se2ZFbxMAAAAASUVORK5CYII=',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlidePrevious',
						options: {
							Key: 'Key_Left',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['SlideNext'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Slide Next',
		style: {
			text: 'Slide ',
			size: '24',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlideNext',
						options: {
							Key: 'Key_Right',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['SlideGoTo'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Slide Go To',
		style: {
			text: 'Slide go to',
			size: 'auto',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'GoToSlide',
						options: {
							App: 'Generic',
							SlideNumber: 1,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['PowerpointPrevious'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Powerpoint Previous',
		style: {
			text: 'PPT ',
			size: '24',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlidePrevious',
						options: {
							Key: 'Powerpoint_Previous',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['PowerpointNext'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Powerpoint Next',
		style: {
			text: 'PPT',
			size: '24',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlideNext',
						options: {
							Key: 'Powerpoint_Next',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['PowerpointGoTo'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Powerpoint Go To',
		style: {
			text: 'PPT go to',
			size: '24',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'GoToSlide',
						options: {
							App: 'Powerpoint_Go',
							SlideNumber: 1,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['KeynotePrevious'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Keynote Previous',
		style: {
			text: 'Key',
			size: '24',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlidePrevious',
						options: {
							Key: 'Keynote_Previous',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['KeynoteNext'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Keynote Next',
		style: {
			text: 'Key ',
			size: '24',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlideNext',
						options: {
							Key: 'Keynote_Next',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['KeynoteGoTo'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Keynote Go To',
		style: {
			text: 'Key go to ',
			size: '24',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'GoToSlide',
						options: {
							App: 'Keynote_Go',
							SlideNumber: 1,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['AdobeAcrobatPrevious'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Adobe Acrobat Previous',
		style: {
			text: 'PDF  ',
			size: '24',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlidePrevious',
						options: {
							Key: 'Acrobat_Previous',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['AdobeAcrobatNext'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Adobe Acrobat Next',
		style: {
			text: 'PDF ',
			size: '24',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'SlideNext',
						options: {
							Key: 'Acrobat_Next',
						},
					},
				],
				up: [],
			},
		],
	}
	presets['AdobeAcrobatGoTo'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'Adobe Acrobat Go To',
		style: {
			text: 'PDF go to',
			size: '24',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'GoToSlide',
						options: {
							App: 'Acrobat_Go',
							SlideNumber: 1,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['SlideNumber'] = {
		type: 'button',
		category: 'Presentation slide  control',
		name: 'slide number/slides count',
		style: {
			text: `$(${self.label}:slide_number)/$(${self.label}:slides_count)`,
			size: 'auto',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}

	// Media Player

	presets['Play'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Play',
		style: {
			size: 'auto',
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [
			{
				feedbackId: 'Media_loaded',
				options: {
					Key: 'any_media_loaded',
				},
				style: {
					color: 16777215,
					bgcolor: 2829057,
				},
			},
			{
				feedbackId: 'Media_playback_state_playing',
				options: {},
				style: {
					color: 16777215,
					bgcolor: 16711680,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'Play_MediaPlayer',
					},
				],
				up: [],
			},
		],
	}

	presets['Pause'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Pause',
		style: {
			size: 'auto',
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: '0',
		},
		feedbacks: [
			{
				feedbackId: 'Media_playback_state_paused',
				style: {
					color: 16777215,
					bgcolor: 16711680,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'Pause_MediaPlayer',
					},
				],
				up: [],
			},
		],
	}

	presets['Restart'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Restart',
		style: {
			size: 'auto',
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'Restart_MediaPlayer',
					},
				],
				up: [],
			},
		],
	}

	presets['Stop'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Stop',
		style: {
			size: 'auto',
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [
			{
				feedbackId: 'Media_loaded',
				options: {
					Key: 'any_media_loaded',
				},
				style: {
					color: 16777215,
					bgcolor: 3355392,
				},
			},
			{
				feedbackId: 'Media_playback_state_playing',
				style: {
					color: 16777215,
					bgcolor: 16711680,
				},
			},
			{
				feedbackId: 'Media_playback_state_paused',
				style: {
					color: 16777215,
					bgcolor: 16711680,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'Stop_MediaPlayer',
					},
				],
				up: [],
			},
		],
	}

	presets['Previous'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Previous',
		style: {
			size: 'auto',
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'Load_MediaPlayer',
						options: {
							Key: 'Load_MediaPlayer#Previous',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['Next'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Next',
		style: {
			size: 'auto',
			png64:
				'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',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'Load_MediaPlayer',
						options: {
							Key: 'Load_MediaPlayer#Next',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['MediaPlayer_Rewind'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Rewind 10s',
		style: {
			text: '10s',
			size: '18',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'MediaPlayer_Rewind',
						options: {
							Seconds: 10,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['MediaPlayer_Forward'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Forward 10s',
		style: {
			text: '10s',
			size: '18',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'MediaPlayer_Forward',
						options: {
							Seconds: 10,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['Loop'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Loop',
		style: {
			text: 'Loop',
			size: '18',
			png64:
				'iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAEDmlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPpu5syskzoPUpqaSDv41lLRsUtGE2uj+ZbNt3CyTbLRBkMns3Z1pJjPj/KRpKT4UQRDBqOCT4P9bwSchaqvtiy2itFCiBIMo+ND6R6HSFwnruTOzu5O4a73L3PnmnO9+595z7t4LkLgsW5beJQIsGq4t5dPis8fmxMQ6dMF90A190C0rjpUqlSYBG+PCv9rt7yDG3tf2t/f/Z+uuUEcBiN2F2Kw4yiLiZQD+FcWyXYAEQfvICddi+AnEO2ycIOISw7UAVxieD/Cyz5mRMohfRSwoqoz+xNuIB+cj9loEB3Pw2448NaitKSLLRck2q5pOI9O9g/t/tkXda8Tbg0+PszB9FN8DuPaXKnKW4YcQn1Xk3HSIry5ps8UQ/2W5aQnxIwBdu7yFcgrxPsRjVXu8HOh0qao30cArp9SZZxDfg3h1wTzKxu5E/LUxX5wKdX5SnAzmDx4A4OIqLbB69yMesE1pKojLjVdoNsfyiPi45hZmAn3uLWdpOtfQOaVmikEs7ovj8hFWpz7EV6mel0L9Xy23FMYlPYZenAx0yDB1/PX6dledmQjikjkXCxqMJS9WtfFCyH9XtSekEF+2dH+P4tzITduTygGfv58a5VCTH5PtXD7EFZiNyUDBhHnsFTBgE0SQIA9pfFtgo6cKGuhooeilaKH41eDs38Ip+f4At1Rq/sjr6NEwQqb/I/DQqsLvaFUjvAx+eWirddAJZnAj1DFJL0mSg/gcIpPkMBkhoyCSJ8lTZIxk0TpKDjXHliJzZPO50dR5ASNSnzeLvIvod0HG/mdkmOC0z8VKnzcQ2M/Yz2vKldduXjp9bleLu0ZWn7vWc+l0JGcaai10yNrUnXLP/8Jf59ewX+c3Wgz+B34Df+vbVrc16zTMVgp9um9bxEfzPU5kPqUtVWxhs6OiWTVW+gIfywB9uXi7CGcGW/zk98k/kmvJ95IfJn/j3uQ+4c5zn3Kfcd+AyF3gLnJfcl9xH3OfR2rUee80a+6vo7EK5mmXUdyfQlrYLTwoZIU9wsPCZEtP6BWGhAlhL3p2N6sTjRdduwbHsG9kq32sgBepc+xurLPW4T9URpYGJ3ym4+8zA05u44QjST8ZIoVtu3qE7fWmdn5LPdqvgcZz8Ww8BWJ8X3w0PhQ/wnCDGd+LvlHs8dRy6bLLDuKMaZ20tZrqisPJ5ONiCq8yKhYM5cCgKOu66Lsc0aYOtZdo5QCwezI4wm9J/v0X23mlZXOfBjj8Jzv3WrY5D+CsA9D7aMs2gGfjve8ArD6mePZSeCfEYt8CONWDw8FXTxrPqx/r9Vt4biXeANh8vV7/+/16ffMD1N8AuKD/A/8leAvFY9bLAAAAbGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAJAAAAABAAAAkAAAAAEAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAAD6G6/pAAAACXBIWXMAABYlAAAWJQFJUiTwAAAEpElEQVR4Ae2ZTWxNQRTH+6ot2iLExwKx8LGwtWVpIUiIaqPaRCxIbFiKhQV7G2wtLIlYCGErErETKwQb8W2BILR4fv/pnGdeW817982TV++c5N8z92POnPm9mblzbzs63JyAE3ACTsAJOAEn4AScgBNwAk7ACTgBJ+AEnIATcAJOwAk4ASfgBJyAE3ACTsAJOAEn4AScQMMEyuVySVIgfGfDAf+nAAYm7ZNDijQMDn4duo7uoe26jJ+TQmvLMhBsWt2inNpeh5QMCcjcj3S+JpT2tD0kYIRphB9IwIwl5dk7ktQ5FKZIMhgKF4k1nIAZT8oDzRpJ2ZJPe03inaVS6Zed43ge5R5UtnMF/BxifiDWEeqej/V/4m2hHuT65cltF2inqkp2QGmClA/R2j60HuXYuyjGV7QKdSNZCmkASFfSHCZuaZG/Skyp4Jei26iZ9isJbtPtBef6c+LI8atW8tG0IkGNyqtoCxqLwjXVbCZoutmPZOcaarirodpJZcBojdBw17TajARH8ZWwyh9jGVfYFEtTbBmyNU3rmq1DJ8jhE7lUrYFcL2zZAEU4SmQoyUYduomOos9Ix0UXauX6Dh1EZ5FMDwKDc5gcLmgEY5UHRLirVf6QXC96jmSablobNuTKj1jb0Hcks3VHZY3a1n/1INF+9EYZR1N5pSVPObyR1+nDCKHODmQ2++BECAvowVvrBf49WhOvFV40iaEN5zMk+zbhwl8bOV0cFY6v/P6JkaQSfRpSn/jzErdIjeNtJGgUaS2q2bhfcW3qUgxmcGw/pDbqiltzAjlutOTwu9ArpNEzotj4SiesLc7V9ItzX+g0fjfSlNUIPRDjhocMx91orsVueU+yWqzDhg1vndhK+S7SZ4uNsYM1QbIOU+9vcR9xTSN3V4zb+iMpJtoT/XaST+1OPF8zICpXOk05na6Pk8DaSfcqdssbiYZphU/h2LecJ410gJgBLH4x0jpnpmm9WrHxNcOfKZfKrzLTTfVeI7kuNmt6FOvT6LVYfxw/P5ZPyXPdNnnxdN1OG8IfSS1tQltzk2hJCo7KgoPM0n3LQbu3UU/wFUifQMy0gC+P7WcZQY3mWFWf5MKIxAuOdtIywbHysZh8H+fmo3kFZPWWUPciktkXxgdVCWU4yEaZJMMLIn4bed2IuaXfalR+hbSIaioUfSejaqirOH2xrJdhPeZPMrVPk4O9OHOqMcsGSGmQmKbXQ7QWaW3QsYHI2hZxZVrXFF9Py0doE4C+kAeuZO1yuriF9aJ49Sk1NcUmbwoFJkuyU1r705bg7Ixwsn3qUHvZflV+NZti+i/DJQXH0immEaUppmmR40mj2K/RFXSmGXCImw+QgiWQRjm8qHOYOqKRpR/jODqH9MErfTxzWJcp1g+gCHgwa9uOW9aTqO1y91M2s8f8T06Ef/bl6gDx9KafbSbkymvGOEpaN+BHkZlB0vFgvB4+U3Bc5DvR7IIymRidNkgjIhLNvuXo04XWovY2IBikdCSJlT6HLGhvOrH3CaQhynrbfo2GdRkfdt5tD8pA4PvRwrYHMh0Ag6RraXm6e/2cE3ACTsAJOAEnkIPAb/pXBxq2VJ9CAAAAAElFTkSuQmCC',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [
			{
				feedbackId: 'Media_player_loop_on',
				style: {
					color: 16777215,
					bgcolor: 13421568,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'Loop_MediaPlayer',
					},
				],
				up: [],
			},
		],
	}

	presets['Fade'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Fade',
		style: {
			text: 'Fade',
			size: '18',
			png64:
				'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',
			alignment: 'center:top',
			pngalignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [
			{
				feedbackId: 'Media_player_fade_on',
				style: {
					color: 16777215,
					bgcolor: 13421568,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'Fade_MediaPlayer',
					},
				],
				up: [],
			},
		],
	}

	presets['Media_time_duration'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Media time duration',
		style: {
			text: `$(${self.label}:Media_time_duration)`,
			size: 'auto',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}

	presets['Media_time_elapsed'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Media time elapsed',
		style: {
			text: `$(${self.label}:Media_time_elapsed)`,
			size: 'auto',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}

	presets['Media_time_left'] = {
		type: 'button',
		category: 'Media Player main commands',
		name: 'Media time left',
		style: {
			text: `$(${self.label}:Media_time_left)`,
			size: 'auto',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [],
		steps: [
			{
				down: [],
				up: [],
			},
		],
	}

	//Media player slots
	for (let i = 1; i <= numberOfMediaPlayerSlots; i++) {
		presets[`Media${i}`] = getPresetforMediaPlayerSlots(self.label, i)
	}

	return presets
}

function getPresetforMediaPlayerSlots(instanceLabel, slot_num) {
	let key = `Load_MediaPlayer#${slot_num}`
	return {
		type: 'button',
		category: 'Media Player main commands',
		name: `Media ${slot_num}`,
		style: {
			text: `${slot_num} - $(${instanceLabel}:media_slot${slot_num})`,
			size: 'auto',
			alignment: 'center:center',
			color: 16777215,
			bgcolor: 0,
		},
		feedbacks: [
			{
				feedbackId: 'Media_loaded',
				options: {
					Key: key,
				},
				style: {
					color: 16777215,
					bgcolor: 10066176,
				},
			},
			{
				feedbackId: 'Media_playing',
				options: {
					Key: key,
				},
				style: {
					color: 16777215,
					bgcolor: 16711680,
				},
			},
			{
				feedbackId: 'media_slot_selected',
				options: {
					Slot: `Media${slot_num}`,
				},
				style: {
					color: 16777215,
					bgcolor: 255,
				},
			},
		],
		steps: [
			{
				down: [],
				up: [
					{
						actionId: 'Load_MediaPlayer',
						options: {
							Key: key,
						},
					},
				],
				2000: {
					options: {
						runWhileHeld: true,
					},
					actions:[
						{
							actionId: "Clear",
							options: {
								Key: "Media",
								Media: `Media${slot_num}`,
							},
						}
					]
				},
			},
		],
	}
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
			color: 16777215,
		},
		steps: [
			{
				down: [
					{
						actionId: 'Capture_Image',
						delay: 0,
						options: {
							Key: key,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'captured',
				options: {
					Key: key,
				},
				style: {
					color: 16777215,
					bgcolor: clr,
				},
			},
		],
	}
}

function getPresetForStillImageDisplay(num, lbl, txt, key, clr1, crl2, siz = 'auto') {
	let steps = [
		{
			down: [],
			up: [
				{
					actionId: 'Display_Image',
					delay: 0,
					options: {
						Key: key,
					},
				},
			],
		},
	]

	if(!['DisplayTest', 'Blackout', 'Freeze'].includes(key)){
		steps[0][2000] = 
			{
				options: {
					runWhileHeld: true,
				},
				actions:[
					{
						actionId: "Clear",
						options: {
							Key: "StillImages",
							StillImages: `Image${num}`,
						},
					}
				]
			}
		
	}

	return {
		type: 'button',
		category: 'Still Images',
		name: lbl,
		style: {
			bgcolor: 0,
			text: txt,
			alignment: 'center:center',
			size: siz,
			color: 16777215,
		},
		steps: steps,
		feedbacks: [
			{
				feedbackId: 'loaded',
				options: {
					Key: key,
				},
				style: {
					color: 16777215,
					bgcolor: clr1,
				},
			},
			{
				feedbackId: 'displayed',
				options: {
					Key: key,
				},
				style: {
					color: 16777215,
					bgcolor: crl2,
				},
			},
			{
				feedbackId: 'image_slot_selected',
				options: {
					Slot: `Image${num}`,
				},
				style: {
					color: 16777215,
					bgcolor: 255,
				},
			},
		],
	}
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
			color: 16777215,
		},
		steps: [
			{
				down: [{ actionId: 'ExitImages' }],
				up: [],
			},
		],
		feedbacks: [],
	}
}


function getPresetforSlotPresentation(instanceLabel, lbl, txt, i, cr, SlotNumber, SlideNumber, Fullscreen) {
	return {
		type: 'button',
		category: 'Presentation Slots',
		name: lbl,
		style: {
			text: `${i} $(${instanceLabel}:${txt})`,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: cr,
		},
		steps: [
			{
				down: [],
				up: [
					{
						actionId: 'OpenStart_Presentation_Slot',
						options: {
							Key: SlotNumber,
							SlideNumber: SlideNumber,
							Fullscreen: Fullscreen,
						},
					},
				],
				2000: {
					options: {
						runWhileHeld: true,
					},
					actions:[
						{
							actionId: "Clear",
							options: {
								Key: "SlotPresentations",
								SlotPresentations: SlotNumber,
							},
						}
					]
				},
			},
		],
		feedbacks: [
			{
				feedbackId: 'slot_exist',
				options: {
					Key: SlotNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13421568,
				},
			},
			{
				feedbackId: 'slot_displayed',
				options: {
					Key: SlotNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13369344,
				},
			},
			{
				feedbackId: 'presentation_slot_selected',
				options: {
					Slot: SlotNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 255,
				},
			},
		],
	}
}

function getPresetforPresentationFolder(instanceLabel, lbl, txt, i, cr, FolderNumber) {
	return {
		type: 'button',
		category: 'Presentation Select',
		name: lbl,
		style: {
			text: `${i} $(${instanceLabel}:${txt})`,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: cr,
		},
		steps: [
			{
				down: [],
				up: [
					{
						actionId: "SetSelected_PresentationFolder",
						options: {
							Key: FolderNumber
						},
					}
				],
				2000: {
					options: {
						runWhileHeld: true,
					},
					actions:[
						{
							actionId: "Clear",
							options: {
								Key: "PresentationFolders",
								PresentationFolders: FolderNumber,
							},
						}
					]
				},
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_folder_exist',
				options: {
					Key: FolderNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13421568,
				},
			},
			{
				feedbackId: 'presentation_folder_watched',
				options: {
					Key: FolderNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13369344,
				},
			},
		],
	}
}

function getPresetforWatchedPresentationFolderFilesOpen(lbl, txt, cr, FileNumber, SlideNumber, Fullscreen) {
	return {
		type: 'button',
		category: 'Presentation open from watched folder',
		name: lbl,
		style: {
			text: txt,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: cr,
		},
		steps: [
			{
				down: [
					{
						actionId: 'open_presentation_from_watched_presentation_folder',
						options: {
							FileNumber: FileNumber,
							SlideNumber: SlideNumber,
							Fullscreen: Fullscreen,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_file_exist',
				options: {
					Key: FileNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13421568,
				},
			},
			{
				feedbackId: 'presentation_file_displayed',
				options: {
					Key: FileNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13369344,
				},
			},
		],
	}
}

function getPresetforWatchedPresentationFolderFilesSelect(lbl, txt, cr, FileNumber) {
	return {
		type: 'button',
		category: 'Presentation Select',
		name: lbl,
		style: {
			text: txt,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: cr,
		},
		steps: [
			{
				down: [
					{
						actionId: "Change_selected_presentation_in_watched_presentation_folder",
						options: {
							File: FileNumber
						},
					}
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presentation_file_displayed',
				options: {
					Key: FileNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13369344,
				},
			},
			{
				feedbackId: 'presentation_file_selected',
				options: {
					Key: FileNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 255,
				},
			},
		],
	}
}



function getPresetforMediaFolder(instanceLabel, lbl, txt, i, cr, FolderNumber) {
	return {
		type: 'button',
		category: 'Media Player Select',
		name: lbl,
		style: {
			text: `${i} $(${instanceLabel}:${txt})`,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: cr,
		},
		steps: [
			{
				down: [],
				up: [
					{
						actionId: "SetSelected_MediaFolder",
						options: {
							Key: FolderNumber
						},
					}
				],
				2000: {
					options: {
						runWhileHeld: true,
					},
					actions:[
						{
							actionId: "Clear",
							options: {
								Key: "MediaFolders",
								MediaFolders: FolderNumber,
							},
						}
					]
				},
			},
		],
		feedbacks: [
			{
				feedbackId: 'media_folder_exist',
				options: {
					Key: FolderNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13421568,
				},
			},
			{
				feedbackId: 'media_folder_watched',
				options: {
					Key: FolderNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 13369344,
				},
			},
		],
	}
}

function getPresetforWatchedMediaFolderFiles(lbl, txt, cr, FileNumber) {
	return {
		type: 'button',
		category: 'Media Player Select',
		name: lbl,
		style: {
			text: txt,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: cr,
		},
		steps: [
			{
				down: [
					{
						actionId: "Change_selected_media_in_watched_media_folder",
						options: {
							File: FileNumber
						},
					}
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'media_file_selected',
				options: {
					Key: FileNumber,
				},
				style: {
					color: 16777215,
					bgcolor: 255,
				},
			},
		],
	}
}
