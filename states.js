var choices = require('./choices');
exports.generateCaptureStates = function () {
	var cchoices = choices.getChoicesForCapture();
	var states = new Object();
	for (var i = cchoices.length - 1; i >= 0; i--) {
		var ci = cchoices[i].id;
		states[ci] = false;
	}
	return states;
}
exports.generateDisplayStates = function () {
	var dchoices = choices.getChoicesForDisplay();
	var states = new Object();
	for (var i = dchoices.length - 1; i >= 0; i--) {
		var di = dchoices[i].id;
		states[di] = new Object();
		states[di].loaded = false;
		states[di].displayed = false;
	}
	return states;
}
exports.generateSlotStates = function () {
	var schoices = choices.getChoicesForSlot();
	var states = new Object();
	for (var i = 20-1; i >= 0; i--) {
		const si = schoices[i].id;
		states[si] = new Object();
		states[si].loaded = false;
		states[si].exists = false;
		states[si].opened = false;
	}
	return states;
}
function doUpdateDisplayStates(states, data) {
	const key = "Display" + (data.displayIndex+1);
	for (const k in states) {
		states[k].displayed = false;
		if (key === k) {
			states[key].displayed = true;
		}
	}
	states.DisplayTest.displayed = data.displayTest;
	states.Freeze.displayed = data.displayFreeze;
	states.Blackout.displayed = data.displayBlack;
}
exports.updateStates = function (states, data) {
	// DisplayTest
	states.DisplayTest.loaded = true;
	// Freeze
	states.Freeze.loaded = true;
	// Blackout
	states.Blackout.loaded = true;

	for (var i = data.isLoaded.length; i > 0; i--) {
		var key = "Display" + i;
		states[key].loaded = data.isLoaded[i-1];
	}

	doUpdateDisplayStates(states, data);
}
exports.updateDisplayStates = function(states, data) {
	doUpdateDisplayStates(states, data);
}
exports.updateCaptureStates = function(states, index) {
	const key = "Capture" + (index+1);
	for (const k in states) {
		if (key === k) {
			states[k] = true;
		} else {
			states[k] = false;
		}
	}
}
exports.uploadLoadStates = function(states, index) {
	const key = "Display" + (index+1);
	for (const k in states) {
		if (key === k) {
			states[key].loaded = true;
		}
	}
}
exports.updateUnloadStates = function(states, index) {
	const key = "Display" + (index+1);
	for (const k in states) {
		if (key === k) {
			states[key].loaded = false;
		}
	}
}
exports.updateSlotStates = function(states, data) {
	for (var i = 20; i > 0; i--) {
		const si = 'Slot' + i;
		states[si].loaded = data.loaded[i-1];
		states[si].exists = data.exists[i-1];
		states[si].opened = data.opened[i-1];
	}
}
