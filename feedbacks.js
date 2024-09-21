const { combineRgb } = require('@companion-module/base')
var choices = require('./choices')
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
					choices: choices.getChoicesForDisplay(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: function (feedback) {
				return self.displayStates[feedback.options.Key].loaded
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
					choices: choices.getChoicesForDisplay(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				return self.displayStates[feedback.options.Key].displayed
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
		folder_captured: {
			type: 'boolean',
			name: 'Folder capture',
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
			name: 'Slot presentation is displayed',
			description: 'If the presentation from the slot is displayed, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getChoicesForSlot(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				return self.slotStates[feedback.options.Key].opened
			},
		},
		file_displayed: {
			type: 'boolean',
			name: 'Folder file presentation is displayed',
			description: 'If the presentation from the folder file is displayed, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'Key',
					default: 'File1',
					choices: choices.getChoicesForFolderFiles(self.presentationFolderState.filesList),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: function (feedback) {
				return self.presentationFolderState.filesState[feedback.options.Key]?.opened
			},
		},
		slot_exist: {
			type: 'boolean',
			name: 'Slot presentation exists',
			description: 'If there is a presentation on the slot, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'Key',
					default: 'Slot1',
					choices: choices.getChoicesForSlot(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.slotStates[feedback.options.Key].exists
			},
		},
		file_exist: {
			type: 'boolean',
			name: 'Folder file presentation exists',
			description: 'If there is a presentation on the folder file, change the style',
			options: [
				{
					type: 'dropdown',
					label: 'File',
					id: 'Key',
					default: 'File1',
					choices: choices.getChoicesForFolderFiles(self.presentationFolderState.filesList),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.presentationFolderState.filesState[feedback.options.Key]?.exists
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
					choices: choices.getChoicesForMediaPlayer(),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.mediaPlayerState.slots[feedback.options.Key].playing
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
					choices: [{ id: `any_media_loaded`, label: `Any media loaded` }].concat(choices.getChoicesForMediaPlayer()),
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 204, 0),
			},
			callback: function (feedback) {
				return self.mediaPlayerState.slots[feedback.options.Key].loaded
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
