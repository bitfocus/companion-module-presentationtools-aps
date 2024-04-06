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
	}
}
