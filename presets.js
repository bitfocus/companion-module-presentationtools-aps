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
	presets['Navigation_PrevFS'] = getPresetForPresentationControl(
		'Previous in full screen',
		'Prev',
		'Navigation_PrevFS',
		{ SlideNumber: 1, Fullscreen: true },
	)
	presets['Navigation_NextFS'] = getPresetForPresentationControl('Next in full screen', 'Next', 'Navigation_NextFS', {
		SlideNumber: 1,
		Fullscreen: true,
	})
	presets['Navigation_CurrentFS'] = getPresetForPresentationControl(
		'Put current in fullscreen',
		'currnt',
		'Navigation_CurrentFS',
	)
	presets['Navigation_CloseOthers'] = getPresetForPresentationControl(
		'Close all except current',
		'close others',
		'Navigation_CloseOthers',
	)
	presets['Exit'] = getPresetForPresentationControl('Presentation Exit', 'Esc', 'PresentationExit', { Key: 'Key_Esc' })

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
	presets['PresentationFilesPrev'] = getPresetForPresentationFiles(
		self.label,
		'Previous',
		'Presentation_previous',
		combineRgb(0, 0, 0),
	)
	presets['PresentationFilesCurr'] = getPresetForPresentationFiles(
		self.label,
		'Current',
		'Presentation_current',
		combineRgb(255, 0, 0),
	)
	presets['PresentationFilesNext'] = getPresetForPresentationFiles(
		self.label,
		'Next',
		'Presentation_next',
		combineRgb(0, 153, 0),
	)

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
		category: 'Presentation Folders',
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
		category: 'Presentation Folders',
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

	// Watched presentation folder select
	presets['PresentationSelect +1'] = {
		type: 'button',
		category: 'Select From Watched Presentation Folder',
		name: 'Select +1',
		style: {
			text: '+1',
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
	presets['PresentationSelect -1'] = {
		type: 'button',
		category: 'Select From Watched Presentation Folder',
		name: 'Select -1',
		style: {
			text: '-1',
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

	presets['CurrentSelectedPresentation'] = {
		type: 'button',
		category: 'Select From Watched Presentation Folder',
		name: 'Current selected in watched presentation folder',
		style: {
			text: `$(${self.label}:watched_presentation_folder_selected_presentation_name)`,
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
						actionId: 'OpenStart_Presentation',
						options: {
							Filename: `$(${self.label}:watched_presentation_folder_selected_presentation_path)`,
							SlideNumber: 1,
							Fullscreen: 1,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['CurrentSelectedPresentationNumber'] = {
		type: 'button',
		category: 'Select From Watched Presentation Folder',
		name: 'Current selected in watched presentation folder (Number/Total)',
		style: {
			text: `$(${self.label}:watched_presentation_folder_selected_presentation_number)/$(${self.label}:watched_presentation_folder_total_files_count)`,
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

	//Watched Presentation Folder Presentations
	for (let i = 1; i <= Math.max(minNumberOfPresentationFolderFiles, self.watchedPresentationFolderState.filesList.length); i++) {
		try{
		presets[`PresentationFile${i}`] = getPresetforWatchedPresentationFolderFiles(
			`File ${i}`,
			`${i} - $(${self.label}:presentation_folder_file${i})`,
			i,
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
		category: 'Media Folders',
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
		category: 'Media Folders',
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

	// Watched media folder select
	presets['MediaSelect +1'] = {
		type: 'button',
		category: 'Select From Watched Media Folder',
		name: 'Select +1',
		style: {
			text: '+1',
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
	presets['MediaSelect -1'] = {
		type: 'button',
		category: 'Select From Watched Media Folder',
		name: 'Select -1',
		style: {
			text: '-1',
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

	presets['CurrentSelectedMedia'] = {
		type: 'button',
		category: 'Select From Watched Media Folder',
		name: 'Current selected in watched media folder',
		style: {
			text: `$(${self.label}:watched_media_folder_selected_media_name)`,
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

	presets['CurrentSelectedMediaNumber'] = {
		type: 'button',
		category: 'Select From Watched Media Folder',
		name: 'Current selected in watched media folder (Number/Total)',
		style: {
			text: `$(${self.label}:watched_media_folder_selected_media_number)/$(${self.label}:watched_media_folder_total_files_count)`,
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

	//Watched Media Folder Media files
	for (let i = 1; i <= Math.max(minNumberOfMediaFolderFiles, self.watchedMediaFolderState.filesList.length); i++) {
		try{
		presets[`MediaFile${i}`] = getPresetforWatchedMediaFolderFiles(
			`File ${i}`,
			`${i} - $(${self.label}:media_folder_file${i})`,
			i,
			combineRgb(0, 0, 0),
			`File${i}`,
			1,
			true,
		)
		}catch(err){
			self.log('debug', err.message)
		}
	}

	// Slides
	presets['SlidePrevious'] = {
		type: 'button',
		category: 'Slide control',
		name: 'Slide Previous',
		style: {
			text: 'Slide',
			size: 'auto',
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
		category: 'Slide control',
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
		category: 'Slide control',
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
		category: 'Slide control',
		name: 'Powerpoint Previous',
		style: {
			text: 'PPT ',
			size: '24',
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
						actionId: 'Powerpoint_Previous',
					},
				],
				up: [],
			},
		],
	}
	presets['PowerpointNext'] = {
		type: 'button',
		category: 'Slide control',
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
						actionId: 'Powerpoint_Next',
					},
				],
				up: [],
			},
		],
	}
	presets['PowerpointGoTo'] = {
		type: 'button',
		category: 'Slide control',
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
		category: 'Slide control',
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
						actionId: 'Keynote_Previous',
					},
				],
				up: [],
			},
		],
	}
	presets['KeynoteNext'] = {
		type: 'button',
		category: 'Slide control',
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
						actionId: 'Keynote_Next',
					},
				],
				up: [],
			},
		],
	}
	presets['KeynoteGoTo'] = {
		type: 'button',
		category: 'Slide control',
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
		category: 'Slide control',
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
						actionId: 'Acrobat_Previous',
					},
				],
				up: [],
			},
		],
	}
	presets['AdobeAcrobatNext'] = {
		type: 'button',
		category: 'Slide control',
		name: 'Adobe Acrobat Next',
		style: {
			text: 'PDF ',
			size: '24',
			png64:
				'iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAEDmlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPpu5syskzoPUpqaSDv41lLRsUtGE2uj+ZbNt3CyTbLRBkMns3Z1pJjPj/KRpKT4UQRDBqOCT4P9bwSchaqvtiy2itFCiBIMo+ND6R6HSFwnruTOzu5O4a73L3PnmnO9+595z7t4LkLgsW5beJQIsGq4t5dPis8fmxMQ6dMF90A190C0rjpUqlSYBG+PCv9rt7yDG3tf2t/f/Z+uuUEcBiN2F2Kw4yiLiZQD+FcWyXYAEQfvICddi+AnEO2ycIOISw7UAVxieD/Cyz5mRMohfRSwoqoz+xNuIB+cj9loEB3Pw2448NaitKSLLRck2q5pOI9O9g/t/tkXda8Tbg0+PszB9FN8DuPaXKnKW4YcQn1Xk3HSIry5ps8UQ/2W5aQnxIwBdu7yFcgrxPsRjVXu8HOh0qao30cArp9SZZxDfg3h1wTzKxu5E/LUxX5wKdX5SnAzmDx4A4OIqLbB69yMesE1pKojLjVdoNsfyiPi45hZmAn3uLWdpOtfQOaVmikEs7ovj8hFWpz7EV6mel0L9Xy23FMYlPYZenAx0yDB1/PX6dledmQjikjkXCxqMJS9WtfFCyH9XtSekEF+2dH+P4tzITduTygGfv58a5VCTH5PtXD7EFZiNyUDBhHnsFTBgE0SQIA9pfFtgo6cKGuhooeilaKH41eDs38Ip+f4At1Rq/sjr6NEwQqb/I/DQqsLvaFUjvAx+eWirddAJZnAj1DFJL0mSg/gcIpPkMBkhoyCSJ8lTZIxk0TpKDjXHliJzZPO50dR5ASNSnzeLvIvod0HG/mdkmOC0z8VKnzcQ2M/Yz2vKldduXjp9bleLu0ZWn7vWc+l0JGcaai10yNrUnXLP/8Jf59ewX+c3Wgz+B34Df+vbVrc16zTMVgp9um9bxEfzPU5kPqUtVWxhs6OiWTVW+gIfywB9uXi7CGcGW/zk98k/kmvJ95IfJn/j3uQ+4c5zn3Kfcd+AyF3gLnJfcl9xH3OfR2rUee80a+6vo7EK5mmXUdyfQlrYLTwoZIU9wsPCZEtP6BWGhAlhL3p2N6sTjRdduwbHsG9kq32sgBepc+xurLPW4T9URpYGJ3ym4+8zA05u44QjST8ZIoVtu3qE7fWmdn5LPdqvgcZz8Ww8BWJ8X3w0PhQ/wnCDGd+LvlHs8dRy6bLLDuKMaZ20tZrqisPJ5ONiCq8yKhYM5cCgKOu66Lsc0aYOtZdo5QCwezI4wm9J/v0X23mlZXOfBjj8Jzv3WrY5D+CsA9D7aMs2gGfjve8ArD6mePZSeCfEYt8CONWDw8FXTxrPqx/r9Vt4biXeANh8vV7/+/16ffMD1N8AuKD/A/8leAvFY9bLAAAAbGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAJAAAAABAAAAkAAAAAEAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAAD6G6/pAAAACXBIWXMAABYlAAAWJQFJUiTwAAACq0lEQVR4Ae2Yv2sUQQBGs4lRYyCIMQgSgiIoimIhEbuAaKOBlDZJI9haKKjY2CUBbbUwpQYs/AH+AWphF7CUoKAWkkY0kqhJNLq+z9sJy2X3DnIId7vfB4/Z2dtZbt7Nze5MW5tjAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzZgAzawAQPRBto0bZM4jjv4cvvhLLyDp1EUrVI6yIlgDzyDr/AeLtpMYgAZnXAalkH5Ax9g1JIwgIgOOAafIOQ3B7NwxpIqknqQcR1WIGSVg1dwwpIqknqRMRnsJKUkzcBhS6pI2oWMu4mcUGhUaQIfKL0kJOiJNgBPIJ0fVB5BryXFcTsiDsALSGeByhRss6TKk+0IMjT/pDNPZRw21ZNU9wJuso+b9EFc72ZN+rnerh+A3rB7ku+4nfICfIFbybnMouZSAzljtBoH3bCVox+3G9qrOjFH/QrLkemq82vVXEHI2cpVM1DkR6PWaS9hGEnfKdel2mj1BUWfyDRAuiB3oOQKwugyDe+AyiIkaw5dpGP36eu3vA7mmlMD/mabKQZhp6rQilEfD8E1CJO0+iEpt+EGglZ0Iis1BakBkjTKckda1k2b6Jz61w9TcBJCf5c41sR8GTkLlOUMP+5ueAi/IETbIY9Bry7lDQJ2gNZjPyFEx89hb3nN0HMEaNtjArK2PY5yPvzVyueJznfDJViCEG2cvYEhaNX5tPEfk853wRhoTzpEW68fYQS07Chn6LxW7wfhLaTzmcp56CynmaTXEgCnIP3E0ki6CnqfK3eQoE0y7f+8BmURbsKWRswUajZHhkbKcTgHs3Cv0RfBQglCiB7xmoj/7XPVWkLoWscGbMAGbMAGbMAGbMAGbOB/GfgLbqswpSVx4roAAAAASUVORK5CYII=',
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
						actionId: 'Acrobat_Next',
					},
				],
				up: [],
			},
		],
	}
	presets['AdobeAcrobatGoTo'] = {
		type: 'button',
		category: 'Slide control',
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
		category: 'Slide control',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
		name: 'Loop',
		style: {
			text: 'Loop',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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
		category: 'Media Player',
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

function getPresetForPresentationControl(lbl, txt, act, opt = null) {
	return {
		type: 'button',
		category: 'Presentation File control',
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
						actionId: act,
						options: opt,
					},
				],
				up: [],
			},
		],
		feedbacks: [],
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

function getPresetForPresentationFiles(instanceLabel, lbl, txt, cr) {
	return {
		type: 'button',
		category: 'Presentation File control',
		name: lbl,
		style: {
			text: `$(${instanceLabel}:${txt})`,
			alignment: 'center:center',
			size: 'auto',
			color: 16777215,
			bgcolor: cr,
		},
		steps: [
			{
				down: [],
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
		],
	}
}

function getPresetforPresentationFolder(instanceLabel, lbl, txt, i, cr, FolderNumber) {
	return {
		type: 'button',
		category: 'Presentation Folders',
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
				up: [],
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

function getPresetforWatchedPresentationFolderFiles(lbl, txt, i, cr, FileNumber, SlideNumber, Fullscreen) {
	return {
		type: 'button',
		category: 'Watched Presentation Folder',
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
		category: 'Media Folders',
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
				up: [],
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

function getPresetforWatchedMediaFolderFiles(lbl, txt, i, cr, FileNumber, SlideNumber, Fullscreen) {
	return {
		type: 'button',
		category: 'Watched Media Folder',
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
				down: [],
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
