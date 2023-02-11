const {
  InstanceBase,
  Regex,
  runEntrypoint,
  TCPHelper,
  InstanceStatus,
} = require("@companion-module/base");

var actions = require("./actions");
var feedbacks = require("./feedbacks");
var states = require("./states");
var presets = require("./presets");

class APSInstance extends InstanceBase {
  constructor(internal) {
    super(internal);
  }

  updateConfig(config) {
    this.config = config;
    var resetConnection = false;

    if (this.config.host != config.host || this.config.port != config.port) {
      resetConnection = true;
    }

    if (resetConnection === true || this.socket === undefined) {
      this.initTCP();
    }
  }

  async init(config) {
    this.config = config;
    this.captureStates = states.generateCaptureStates();
    this.displayStates = states.generateDisplayStates();
    this.slotStates = states.generateSlotStates();
    this.captureTimeoutObj = null;
    this.receiver = new MessageBuffer("$");

    this.initTCP();
    this.actions(); // export actions
    this.feedbacks();
    this.variables();
    this.presets();
  }

  initTCP() {
    var self = this;

    if (self.socket !== undefined) {
      self.socket.destroy();
      delete self.socket;
    }

    if (self.config.host && self.config.port) {
      self.socket = new TCPHelper(self.config.host, self.config.port);

      self.socket.on("status_change", (status, message) => {
        self.log("debug", `Status ${status}, message: ${message}`);
        self.updateStatus(status);
      });

      self.socket.on("error", (_err) => {
        self.updateStatus(InstanceStatus.UnknownError);
      });

      self.socket.on("connect", () => {
        self.updateStatus(InstanceStatus.Ok);
        setTimeout(() => {
          self.socket.send("states$");
        }, 1000);
      });

      self.socket.on("data", (data) => {
        self.receiver.push(data);
        let message = self.receiver.handleData();
        if (message == null) return;
        // data is Buffer object
        try {
          let jsonData = JSON.parse(message);
          if (jsonData.action === "states") {
            states.updateStates(self.displayStates, jsonData.data);
            self.checkFeedbacks("loaded", "displayed");
          } else if (jsonData.action === "display") {
            states.updateDisplayStates(self.displayStates, jsonData.data);
            self.checkFeedbacks("displayed");
          } else if (jsonData.action === "capture") {
            states.uploadLoadStates(self.displayStates, jsonData.index);
            states.updateCaptureStates(self.captureStates, jsonData.index);
            self.checkFeedbacks("captured");
            if (self.captureTimeoutObj !== null) {
              clearTimeout(self.captureTimeoutObj);
            }
            self.captureTimeoutObj = setTimeout(() => {
              states.updateCaptureStates(self.captureStates, 999);
              self.checkFeedbacks("captured", "loaded");
              self.captureTimeoutObj = null;
            }, 1500);
          } else if (jsonData.action === "delete") {
            states.updateUnloadStates(self.displayStates, jsonData.index);
            self.checkFeedbacks("loaded");
          } else if (jsonData.action === "files") {
            self.setVariableValues({
              prev: jsonData.data.prev,
              curr: jsonData.data.curr,
              next: jsonData.data.next,
            });
          } else if (jsonData.action === "slots") {
            self.setSlotVariables(jsonData.data);
            states.updateSlotStates(self.slotStates, jsonData.data);
            self.checkFeedbacks("slot_exist", "slot_displayed");
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  getConfigFields() {
    return [
      {
        type: "static-text",
        id: "info",
        width: 12,
        label: "Information",
        value:
          "This will establish a TCP connection to interact with the APS app",
      },
      {
        type: "textinput",
        id: "host",
        label: "Target IP (For local: 127.0.0.1)",
        default: "127.0.0.1",
        width: 6,
        regex: Regex.IP,
      },
      {
        type: "textinput",
        id: "port",
        label: "Target port (Default: 4777)",
        default: "4777",
        width: 6,
        regex: Regex.PORT,
      },
    ];
  }

  actions() {
    let ats = actions.getActions(this);
    this.setActionDefinitions(ats);
  }

  feedbacks() {
    var self = this;
    var fdbs = feedbacks.getFeedbacks(self);
    self.setFeedbackDefinitions(fdbs);
  }

  variables() {
    var self = this;
    var variables = [
      { name: "Previous", variableId: "prev" },
      { name: "Current", variableId: "curr" },
      { name: "Next", variableId: "next" },
    ];
    for (let i = 1; i <= 20; i++) {
      variables.push({
        name: `Slot ${i}`,
        variableId: `slot${i}`,
      });
    }

    self.setVariableDefinitions(variables);

    const values = {
      prev: "",
      curr: "",
      next: "",
    };
    try {
      for (let i = 20; i > 0; i--) {
        values[`slot${i}`] = "-";
      }
    } catch (err) {
      self.log("debug", err);
    }

    self.setVariableValues(values);
  }

  setSlotVariables(data) {
    var self = this;
    const values = {};

    try {
      for (let i = 20; i > 0; i--) {
        values[`slot${i}`] = data.filenames[i - 1];
      }
    } catch (err) {
      self.log("debug", err);
    }

    self.setVariableValues(values);
  }

  presets() {
    var self = this;
    try {
      self.setPresetDefinitions(presets.getPresets(self));
    } catch (err) {
      self.log("debug", err);
    }
  }

  async destroy() {
    var self = this;

    if (self.socket !== undefined) {
      self.socket.destroy();
    }

    self.log("debug", `destroy ${self.id}`);
  }
}

class MessageBuffer {
  constructor(delimiter) {
    this.delimiter = delimiter;
    this.buffer = "";
  }

  isFinished() {
    if (
      this.buffer.length === 0 ||
      this.buffer.indexOf(this.delimiter) === -1
    ) {
      return true;
    }
    return false;
  }

  push(data) {
    this.buffer += data;
  }

  getMessage() {
    const delimiterIndex = this.buffer.indexOf(this.delimiter);
    if (delimiterIndex !== -1) {
      const message = this.buffer.slice(0, delimiterIndex);
      this.buffer = this.buffer.replace(message + this.delimiter, "");
      return message;
    }
    return null;
  }

  handleData() {
    const message = this.getMessage();
    return message;
  }
}

runEntrypoint(APSInstance, []);
