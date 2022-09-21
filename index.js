var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var choices = require('./choices');
var actions = require('./actions');
var feedbacks = require('./feedbacks');
var states = require('./states');
var presets = require('./presets');

var debug;
var log;

function instance(system, id, config) {
    var self = this;

    // super-constructor
    instance_skel.apply(this, arguments);

    self.actions(); // export actions

    return self;
}

instance.prototype.updateConfig = function (config) {
    var self = this;
    var resetConnection = false;

    if (self.config.host != config.host || self.config.port != config.port) {
        resetConnection = true;
    }

    self.config = config;

    if (resetConnection === true || self.socket === undefined) {
        self.initTCP();
    }
}

instance.prototype.init = function () {
    var self = this;

    debug = self.debug;
    log = self.log;

    self.captureStates = states.generateCaptureStates();
    self.displayStates = states.generateDisplayStates();
    self.slotStates = states.generateSlotStates();
    self.captureTimeoutObj = null;
    self.receiver = new MessageBuffer('$');
    
    self.initTCP();
    self.feedbacks();
    self.variables();
    self.presets();
}

instance.prototype.initTCP = function () {
    var self = this;

    if (self.socket !== undefined) {
        self.socket.destroy();
        delete self.socket;
    }

    if (self.config.host && self.config.port) {
        self.socket = new tcp(self.config.host, self.config.port);

        self.socket.on('status_change', (status, message) => {
            self.status(status, message);
        });

        self.socket.on('error', (err) => {
            debug('Network error', err);
            self.status(self.STATE_ERROR, err);
            log('error', 'Network error: ' + err.message);
        });

        self.socket.on('connect', () => {
            debug('Connected');
            self.status(self.STATE_OK);
            log('Connected');

            setTimeout(() => {
                self.socket.send('states$');
            }, 1000);
        });

        self.socket.on('data', (data) => {
            self.receiver.push(data);
            let message = self.receiver.handleData();
            if (message == null)
                return;
            // data is Buffer object
            try {
                console.log(message);
                let jsonData = JSON.parse(message);
                console.log(jsonData);
                if (jsonData.action === 'states') {
                    states.updateStates(self.displayStates, jsonData.data);
                    self.checkFeedbacks('loaded', 'displayed');
                } else if (jsonData.action === 'display') {
                    states.updateDisplayStates(self.displayStates, jsonData.data);
                    self.checkFeedbacks('displayed');
                } else if (jsonData.action === 'capture') {
                    states.uploadLoadStates(self.displayStates, jsonData.index);
                    states.updateCaptureStates(self.captureStates, jsonData.index);
                    self.checkFeedbacks('captured');
                    if (self.captureTimeoutObj !== null) {
                        clearTimeout(self.captureTimeoutObj);
                    }
                    self.captureTimeoutObj = setTimeout(() => {
                        states.updateCaptureStates(self.captureStates, 999);
                        self.checkFeedbacks('captured', 'loaded');
                        self.captureTimeoutObj = null;
                    }, 1500);
                } else if (jsonData.action === 'delete') {
                    states.updateUnloadStates(self.displayStates, jsonData.index);
                    self.checkFeedbacks('loaded');
                } else if (jsonData.action === 'files') {
                    self.setVariable('prev', jsonData.data.prev);
                    self.setVariable('curr', jsonData.data.curr);
                    self.setVariable('next', jsonData.data.next);
                } else if (jsonData.action === 'slots') {
                    self.setSlotVariables(jsonData.data);
                    states.updateSlotStates(self.slotStates, jsonData.data);
                    self.checkFeedbacks('slot_exist', 'slot_displayed');
                }
            } catch (e) {
                console.error(e);
            }
        });
    }
}

instance.prototype.config_fields = function () {
    var self = this;
    return [
        {
            type: 'text',
            id: 'info',
            width: 12,
            label: 'Information',
            value: 'This will establish a TCP connection to interact with the APS app'
        },
        {
            type: 'textinput',
            id: 'host',
            label: 'Target IP (For local: 127.0.0.1)',
            default: '127.0.0.1',
            width: 6,
            regex: self.REGEX_IP
        },
        {
            type: 'textinput',
            id: 'port',
            label: 'Target port (Default: 4777)',
            default: '4777',
            width: 6,
            regex: self.REGEX_PORT
        }
    ]
}

instance.prototype.actions = function () {
    var self = this;
    ats = actions.getActions(self);
    self.setActions(ats);
}

instance.prototype.action = function (action) {
    console.log(action);

    var self = this;
    var cmd = '';
    var terminationChar = '$';
    cmd = actions.getCommand(action);
    cmd += terminationChar;
    if (cmd !== undefined && cmd !== terminationChar) {
        if (self.socket !== undefined && self.socket.connected) {
            console.log(cmd);
            self.socket.send(cmd);
        }
    }
}

instance.prototype.feedbacks = function () {
    var self = this;
    var fdbs = feedbacks.getFeedbacks(self);
    self.setFeedbackDefinitions(fdbs);
}

instance.prototype.variables = function () {
    var self = this;
    var variables = [
        { label: 'Previous', name: 'prev' },
        { label: 'Current', name: 'curr' },
        { label: 'Next', name: 'next' }
    ];
    for (var i = 1; i <= 20; i++) {
        variables.push({
            label: `Slot ${i}`, name: `slot${i}`
        });
    }

    self.setVariableDefinitions(variables);

    self.setVariable('prev', '');
    self.setVariable('curr', '');
    self.setVariable('next', '');
    for (var i = 20; i > 0; i--) {
        self.setVariable(`slot${i}`, '-');
    }
}

instance.prototype.setSlotVariables = function (data) {
    var self = this;
    try {
        for (var i = 20; i > 0; i--) {
            self.setVariable(`slot${i}`, data.filenames[i-1]);
        }
    } catch (err) {
        console.log(err);
    }
}

instance.prototype.presets = function () {
    var self = this;
    try {
        self.setPresetDefinitions(presets.getPresets(self));
    } catch (err) {
        console.log(err);
    }
}

instance.prototype.destroy = function () {
    var self = this;

    if (self.socket !== undefined) {
        self.socket.destroy();
    }

    self.debug('destroy', self.id);
}

class MessageBuffer {
    constructor(delimiter) {
        this.delimiter = delimiter
        this.buffer = ''
    }

    isFinished() {
        if (this.buffer.length === 0 || this.buffer.indexOf(this.delimiter) === -1) {
            return true
        }
        return false
    }

    push(data) {
        this.buffer += data
    }

    getMessage() {
        const delimiterIndex = this.buffer.indexOf(this.delimiter)
        if (delimiterIndex !== -1) {
            const message = this.buffer.slice(0, delimiterIndex)
            this.buffer = this.buffer.replace(message + this.delimiter, '')
            return message
        }
        return null
    }

    handleData() {
        const message = this.getMessage()
        return message
    }
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;