var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
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

    self.initTCP();
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
            debug("Network error", err);
            self.status(self.STATE_ERROR, err);
            log('error', "Network error: " + err.message);
        });

        self.socket.on('connect', () => {
            debug("Connected");
            self.status(self.STATE_OK);
            log("Connected");
        });

        self.socket.on('data', (data) => { });
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

    actions = {
        'Navigation_NextFS': { label: 'Next in fullscreen' },
        'Navigation_PrevFS': { label: 'Prev in fullscreen' },
        'Navigation_NextNoFS': { label: 'Next without putting to fullscreen' },
        'Navigation_CurrentFS': { label: 'Put current in fullscreen' },
        'Navigation_CloseOthers': { label: 'Close all except current' },

        'Keystroke': {
            label: 'Simulate keystroke',
            options: [
                {
                    type: 'dropdown',
                    label: 'Key',
                    id: 'Key',
                    default: 'Key_Left',
                    choices: [
                        { id: 'Key_Right', label: 'Right Arrow' },
                        { id: 'Key_Left', label: 'Left Arrow' },
                        { id: 'Key_Esc', label: 'Escape' },
                        { id: 'Key_B', label: 'B' }
                    ]
                }
            ]
        }
    };

    self.setActions(actions);
}

instance.prototype.action = function (action) {
    var self = this;
    var cmd = '';
    var terminationChar = '$';
    switch (action.action) {
        case 'Navigation_NextFS':
        case 'Navigation_PrevFS':
        case 'Navigation_NextNoFS':
        case 'Navigation_CurrentFS':
        case 'Navigation_CloseOthers':
            cmd = action.action
            break;
        case 'Keystroke':
            cmd = action.options.Key
            break;
    };
    cmd += terminationChar;
    if (cmd !== undefined && cmd != terminationChar) {
        if (self.socket !== undefined && self.socket.connected) {
            self.socket.send(cmd);
        }
    }
}

instance.prototype.destroy = function () {
    var self = this;

    if (self.socket !== undefined) {
        self.socket.destroy();
    }

    self.debug("destroy", self.id);;
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;