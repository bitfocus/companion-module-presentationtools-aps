const { combineRgb } = require('@companion-module/base')
var choices = require('./choices')
var utils = require('./utils')
exports.getFeedbacks = function (instance) {
	var self = instance
	return {
		loaded: {
			type: 'boolean',
			name: 'Still Image exists',
			description: 'If there is a still image available, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Key',
					default: 'Display1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForDisplay()),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 90, 0),
			},
			callback: function (feedback) {
				let key = feedback.options.Key
				if(key == 'selected'){
					key = 'Display' + self.getVariableValue('image_slot_selected_number')
					self.log('debug', key)
				}
				
				return self.displayStates[key].loaded
			},
		},
		displayed: {
			type: 'boolean',
			name: 'Still image display',
			description: 'When the still image is displayed, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Key',
					default: 'Display1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForDisplay()),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				let key = feedback.options.Key
				if(key == 'selected'){
					key = 'Display' + self.getVariableValue('image_slot_selected_number')
				}
				return self.displayStates[key].displayed
			},
		},
		captured: {
			type: 'boolean',
			name: 'Still image capture',
			description: 'When taking a screenshot and storing an image, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Key',
					default: 'Capture1',
					choices: choices.getChoicesForCapture(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: function (feedback) {
				return self.captureStates[feedback.options.Key]
			},
		},
		slot_captured: {
			type: 'boolean',
			name: 'Presentation capture',
			description: 'When capturing current presentation to a slot, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getChoicesForSlot(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: function (feedback) {
				return self.slotCaptureStates[feedback.options.Key]
			},
		},
		presentation_folder_captured: {
			type: 'boolean',
			name: 'Presentation folder capture',
			description: "When capturing current presentation's folder, change the style",
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'Key',
					default: 'Folder1',
					choices: choices.getChoicesForPresentationFolder(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: function (feedback) {
				return self.folderCaptureStates[feedback.options.Key]
			},
		},
		slot_displayed: {
			type: 'boolean',
			name: 'Presentation slot is displayed',
			description: 'If the presentation from the slot is displayed, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForSlot()),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				let key = feedback.options.Key
				if(key == 'selected'){
					key = 'Slot' + self.getVariableValue('presentation_slot_selected_number')
				}
				return self.slotStates[key].opened
			},
		},
		presentation_slot_selected: {
			type: 'boolean',
			name: 'Presentation slot is selected',
			description: 'If the presentation slot is selected, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Slot',
					default: 'Slot1',
					choices: choices.getChoicesForSlot(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			callback: function (feedback) {
				return self.getVariableValue('presentation_slot_selected_number') == utils.extcractNumber(feedback.options.Slot)
			},
		},
		media_slot_selected: {
			type: 'boolean',
			name: 'Media slot is selected',
			description: 'If the media slot is selected, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Slot',
					default: 'Media1',
					choices: choices.getChoicesForMedia(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			callback: function (feedback) {
				return self.getVariableValue('media_slot_selected_number') == utils.extcractNumber(feedback.options.Slot)
			},
		},
		image_slot_selected: {
			type: 'boolean',
			name: 'Still Image slot is selected',
			description: 'If the image slot is selected, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Slot',
					default: 'Image1',
					choices: choices.getChoicesForImage(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			callback: function (feedback) {
				return self.getVariableValue('image_slot_selected_number') == utils.extcractNumber(feedback.options.Slot)
			},
		},
		presentation_file_displayed: {
			type: 'boolean',
			name: 'Presentation folder file is displayed',
			description: 'If the presentation from the folder file is displayed, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'Key',
					default: 'File1',
					choices: choices.getChoicesForPresentationFolderFiles(self.watchedPresentationFolderState.filesList),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				return self.watchedPresentationFolderState.filesState[feedback.options.Key]?.opened
			},
		},
		presentation_displayed: {
			type: 'boolean',
			name: 'Presentation is displayed',
			description: 'If any presentation is displayed, change the style',
			options: [],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (_feedback) {
				return self.generalState.isAnyPresentationDisplayed
			},
		},
		presentation_displayed_in_edit_mode: {
			type: 'boolean',
			name: 'Presentation is in edit mode',
			description: 'If any presentation is in edit mode, change the style',
			options: [],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (_feedback) {
				return self.generalState.isAnyPresentationDisplayedInEditMode
			},
		},
		slot_exist: {
			type: 'boolean',
			name: 'Presentation slot exists',
			description: 'If there is a presentation on the slot, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForSlot()),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				let key = feedback.options.Key
				if(key == 'selected'){
					key = 'Slot' + self.getVariableValue('presentation_slot_selected_number')
				}
				return self.slotStates[key].exists
			},
		},
		presentation_folder_exist: {
			type: 'boolean',
			name: 'Presentation folder exists',
			description: 'If there is a folder on the slot, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: choices.getChoicesForPresentationFolder(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.presentationFolderStates[feedback.options.Key].exists
			},
		},
		presentation_folder_watched: {
			type: 'boolean',
			name: 'Presentation folder is watched',
			description: 'If folder is watched, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: choices.getChoicesForPresentationFolder(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				return self.watchedPresentationFolderState.number == parseInt(utils.extcractNumber(feedback.options.Key))
			},
		},
		presentation_file_exist: {
			type: 'boolean',
			name: 'Presentation folder file exists',
			description: 'If there is a presentation on the folder file, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'Key',
					default: 'File1',
					choices: choices.getChoicesForPresentationFolderFiles(self.watchedPresentationFolderState.filesList),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.watchedPresentationFolderState.filesState[feedback.options.Key]?.exists
			},
		},
		presentation_file_selected: {
			type: 'boolean',
			name: 'Presentation folder file is selected',
			description: 'If the presentation from the folder file is selected, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'Key',
					default: 'File1',
					choices: choices.getChoicesForPresentationFolderFiles(self.watchedPresentationFolderState.filesList),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.getVariableValue('watched_presentation_folder_selected_presentation_number') == utils.extcractNumber(feedback.options.Key)
			},
		},

		media_folder_exist: {
			type: 'boolean',
			name: 'Media folder exists',
			description: 'If there is a folder on the slot, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: choices.getChoicesForMediaFolder(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.mediaFolderStates[feedback.options.Key].exists
			},
		},
		media_folder_watched: {
			type: 'boolean',
			name: 'Media folder is watched',
			description: 'If folder is watched, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'Key',
					default: 'Folder1',
					choices: choices.getChoicesForMediaFolder(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				return self.watchedMediaFolderState.number == parseInt(utils.extcractNumber(feedback.options.Key))
			},
		},
		media_file_selected: {
			type: 'boolean',
			name: 'Media folder file is selected',
			description: 'If the media from the folder file is selected, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'Key',
					default: 'File1',
					choices: choices.getChoicesForMediaFolderFiles(self.watchedMediaFolderState.filesList),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.getVariableValue('watched_media_folder_selected_media_number') == utils.extcractNumber(feedback.options.Key)
			},
		},

		Media_playing: {
			type: 'boolean',
			name: 'Media Player slot is playing',
			description: 'If the media from the slot is playing, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Media Slot',
					id: 'Key',
					default: 'Load_MediaPlayer#1',
					choices: choices.getItemForSelectedOption().concat(choices.getChoicesForMediaPlayer()),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				let key = feedback.options.Key
				if(key == 'selected'){
					key = 'Load_MediaPlayer#' + self.getVariableValue('media_slot_selected_number')
				}
				return self.mediaPlayerState.slots[key].playing
			},
		},

		Media_loaded: {
			type: 'boolean',
			name: 'Media Player slot is loaded',
			description: 'If the media from the slot is loaded, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Media Slot',
					id: 'Key',
					default: 'Load_MediaPlayer#1',
					choices: [{ id: `any_media_loaded`, label: `Any media loaded` }]
								.concat(choices.getItemForSelectedOption())
								.concat(choices.getChoicesForMediaPlayer()),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				let key = feedback.options.Key
				if(key == 'selected'){
					key = 'Load_MediaPlayer#' + self.getVariableValue('media_slot_selected_number')
				}
				return self.mediaPlayerState.slots[key].loaded
			},
		},

		Media_playback_state_playing: {
			type: 'boolean',
			name: 'Media Player is playing',
			description: 'If the media in playing-state, change the style',
			options: [],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (_feedback) {
				return self.mediaPlayerState.playing
			},
		},

		Media_playback_state_paused: {
			type: 'boolean',
			name: 'Media Player is paused',
			description: 'If the media-in pause-state, change the style',
			options: [],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (_feedback) {
				return self.mediaPlayerState.paused
			},
		},

		Media_player_loop_on: {
			type: 'boolean',
			name: 'Media Player loop-mode',
			description: 'If the media-player is in loop-mode, change the style',
			options: [],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (_feedback) {
				return self.mediaPlayerState.loop_on
			},
		},

		Media_player_fade_on: {
			type: 'boolean',
			name: 'Media Player fade-mode',
			description: 'If the media-player is in fade-mode, change the style',
			options: [],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (_feedback) {
				return self.mediaPlayerState.fade_on
			},
		},
	}
}
