const { InstanceBase, Regex, runEntrypoint, TCPHelper, InstanceStatus } = require('@companion-module/base')
const { 
	numberOfPresentationSlots, 
	numberOfMediaPlayerSlots, 
	minNumberOfPresentationFolderFiles, 
	numberOfPresentationFolders, 
	numberOfImagesSlots,
	minNumberOfMediaFolderFiles, numberOfMediaFolders,
	minNumberOfTabs,
	} = require('./constants')

var actions = require('./actions')
var feedbacks = require('./feedbacks')
var states = require('./states')
var presets = require('./presets')
var utils = require('./utils')

class APSInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async configUpdated(config) {
		this.config = config

		this.apiVersionMapping = {
			// v1 deprecated and removed
			2: {commandHandler: actions.getCommandV2, receiver: MessageBufferV2},
		};
		this.apiVersion = Math.max(...Object.keys(this.apiVersionMapping).map(Number));
		this.log('info', `API version: ${this.apiVersion}`)
		

		this.generalState = {
			isAnyPresentationDisplayed: false,
			isAnyPresentationDisplayedInEditMode: false,
			activeApp: null
		}
		this.captureStates = states.generateCaptureStates()
		this.displayStates = states.generateDisplayStates()
		this.slotStates = states.generateSlotStates()
		this.presentationFolderStates = states.generatePresentationFolderStates()
		this.mediaFolderStates = states.generateMediaFolderStates()
		this.slotCaptureStates = states.generateSlotCaptureStates()
		this.folderCaptureStates = states.generateFolderCaptureStates()
		this.watchedPresentationFolderState = {
			name: null,
			filesList: [],
			filesState: {}
		}
		this.watchedMediaFolderState = {
			name: null,
			originalFilesList: [], // Will save the original here (in case numbered-only sorting used)
			filesList: [], // This will be modified if numbered-only sorting used
			filesState: {}
		}
		this.mediaPlayerState = {
			slots: states.generateMediaSlotStates(),
			playing: false,
			paused: false,
			loop_on: false,
			fade_on: false,
			hold_at_end_on: false,
		}

		this.browserState = {
			activeTabId: null,
			tabsList: [],
			seamlessOpenWebpageInProgress: false,
			seamlessFullScreenInProgress: false,
		}

		this.captureTimeoutObj = null
		this.slotCaptureTimeoutObj = null
		this.folderCaptureTimeoutObj = null

		this.initTCP()
		this.actions() // export actions
		this.feedbacks()
		this.variables()
		this.presets()
	}

	async init(config) {

		if(!config.sort){
			config.sort = 'normal'
		}

		this.configUpdated(config)
	}

	CheckAPIsVersionsCompatibility(){
		
		if(!this.socket.isConnected)
			return

		if(this.serverAPIVersion > this.apiVersion){
			this.updateStatus(InstanceStatus.UnknownWarning, 
				"APS is more recent than Companion module.\nPlease upgrade Companion to ensure maximum compatibility.")
		}
		else if(this.serverAPIVersion < this.apiVersion){
			this.updateStatus(InstanceStatus.UnknownWarning, 
				"The Connected Companion module is more recent than APS.\nPlease upgrade APS to ensure maximum compatibility.")
		}
	}

	initTCP() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
		}

		if (self.config.host && self.config.port) {
			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('status_change', (status, message) => {
				//self.log('debug', `Status ${status}, message: ${message}`)
				//self.updateStatus(status)
			})

			self.socket.on('error', (_err) => {
				self.updateStatus(InstanceStatus.UnknownError)
			})

			self.socket.on('connect', () => {
				self.serverAPIVersion = 2
				self.toBeUsedAPIversion = 2
				self.receiver = new self.apiVersionMapping[self.toBeUsedAPIversion].receiver()
				let apiVersionMesage = JSON.stringify({command: "api_version", api_version: self.apiVersion})
				actions.send(self.socket, apiVersionMesage)
				self.updateStatus(InstanceStatus.Ok)
			})

			self.socket.on('data', (data) => {
				self.receiver.push(data)
				let messages = self.receiver.getMessages()
				if (messages == null) return
				for (let i = 0; i < messages.length; i++) {
					let message = messages[i]
					try {
						let jsonData = JSON.parse(message)
						if(jsonData.action === 'api_version'){
							self.serverAPIVersion = jsonData.api_version
							self.log('info', `Server API version: ${self.serverAPIVersion}`)
							self.toBeUsedAPIversion = Math.min(self.apiVersion, self.serverAPIVersion)
							self.receiver = new self.apiVersionMapping[self.toBeUsedAPIversion].receiver()
							self.CheckAPIsVersionsCompatibility()
						}
						else if (jsonData.action === 'imagesstates') {
							states.updateStates(self.displayStates, jsonData.data)
							self.setImagesVariables(jsonData.data)
							self.checkFeedbacks('loaded', 'displayed')
						} else if (jsonData.action === 'display') {
							states.updateDisplayStates(self.displayStates, jsonData.data)
							self.checkFeedbacks('displayed')
						} else if (jsonData.action === 'capture') {
							states.uploadLoadStates(self.displayStates, jsonData.index)
							states.updateCaptureStates(self.captureStates, jsonData.index)
							self.checkFeedbacks('captured')
							if (self.captureTimeoutObj !== null) {
								clearTimeout(self.captureTimeoutObj)
							}
							self.captureTimeoutObj = setTimeout(() => {
								states.updateCaptureStates(self.captureStates, 999)
								self.checkFeedbacks('captured', 'loaded')
								self.captureTimeoutObj = null
							}, 1500)
						} else if (jsonData.action === 'slot_capture') {
							states.updateSlotCaptureStates(self.slotCaptureStates, jsonData.index)
							self.checkFeedbacks('slot_captured')
							if (self.slotCaptureTimeoutObj !== null) {
								clearTimeout(self.slotCaptureTimeoutObj)
							}
							self.slotCaptureTimeoutObj = setTimeout(() => {
								states.updateSlotCaptureStates(self.slotCaptureStates, -1)
								self.checkFeedbacks('slot_captured')
								self.slotCaptureTimeoutObj = null
							}, 1000)
						} else if (jsonData.action === 'folder_capture') {
							states.updateFolderCaptureStates(self.folderCaptureStates, jsonData.index)
							self.checkFeedbacks('folder_captured')
							if (self.folderCaptureTimeoutObj !== null) {
								clearTimeout(self.folderCaptureTimeoutObj)
							}
							self.folderCaptureTimeoutObj = setTimeout(() => {
								states.updateFolderCaptureStates(self.folderCaptureStates, -1)
								self.checkFeedbacks('folder_captured')
								self.folderCaptureTimeoutObj = null
							}, 1000)
						} else if (jsonData.action === 'delete') {
							states.updateUnloadStates(self.displayStates, jsonData.index)
							self.checkFeedbacks('loaded')
						} else if (jsonData.action === 'any_presentation_displayed') {
							self.generalState.isAnyPresentationDisplayed = jsonData.data.is_any_presentation_displayed
							self.generalState.isAnyPresentationDisplayedInEditMode = jsonData.data.in_edit_mode
							self.checkFeedbacks('presentation_displayed', 'presentation_displayed_in_edit_mode')
						} else if (jsonData.action === 'files') {
							let update_obj = {
								Presentation_previous: jsonData.data.prev,
								Presentation_current: jsonData.data.curr,
								Presentation_next: jsonData.data.next,
							}
							// For not raising exception while using old verions of APS
							update_obj['slide_number'] = jsonData.data.slide_number
							update_obj['slides_count'] = jsonData.data.slides_count
							update_obj['Slides_current_build'] = jsonData.data.current_build
							update_obj['Slides_builds_count'] = jsonData.data.builds_count

							update_obj['Powerpoint_slide_number'] = jsonData.data.powerpoint_slide_number
							update_obj['Powerpoint_slides_count'] = jsonData.data.powerpoint_slides_count
							update_obj['Powerpoint_Slides_current_build'] = jsonData.data.powerpoint_current_build
							update_obj['Powerpoint_Slides_builds_count'] = jsonData.data.powerpoint_builds_count
							
							self.setVariableValues(update_obj)
						} else if (jsonData.action === 'slots') {
							self.setSlotVariables(jsonData.data)
							states.updateSlotStates(self.slotStates, jsonData.data)
							self.checkFeedbacks('slot_exist', 'slot_displayed')
						} 
						
						// Presentation Folders
						else if (jsonData.action === 'presentation_folders') {
							self.setPresentationFolderVariables(jsonData.data)
							states.updatePresentationFolderStates(self.presentationFolderStates, jsonData.data)
							self.checkFeedbacks('presentation_folder_exist')
						} else if (jsonData.action === 'watched_presentation_folder') {
							states.updateWatchedPresentationFolderState(self.watchedPresentationFolderState, jsonData.data, self.config.sort == 'numberedonly')
							self.variables(true)
							self.actions()
							self.feedbacks()
							self.presets()
							self.setPresentationFolderFilesVariables()
							self.checkFeedbacks('presentation_file_exist', 'presentation_folder_watched', 'presentation_file_selected')
						} else if (jsonData.action === 'opened_folder_presentation') {
							if(Object.keys(self.watchedPresentationFolderState.filesState).length > 0)
								states.updatePresentationFileOpenStates(self.watchedPresentationFolderState, jsonData.data.current_opened_file_index, self.config.sort == 'numberedonly')
							self.checkFeedbacks('presentation_file_displayed')
						} 
						
						// Media Folders
						else if (jsonData.action === 'media_folders') {
							self.setMediaFolderVariables(jsonData.data)
							states.updateMediaFolderStates(self.mediaFolderStates, jsonData.data)
							self.checkFeedbacks('media_folder_exist')
						} else if (jsonData.action === 'watched_media_folder') {
							states.updateWatchedMediaFolderState(self.watchedMediaFolderState, jsonData.data)
							self.variables(true)
							self.actions()
							self.feedbacks()
							self.presets()
							self.setMediaFolderFilesVariables()
							self.checkFeedbacks('media_folder_watched', 'media_file_selected')
						} 

						else if (jsonData.action === 'MediaPlayer') {
							self.setMediaPlayerVariables(jsonData.data)
							states.updateMediaPlayerState(self.mediaPlayerState, jsonData.data)
							self.checkFeedbacks(
								'Media_playing',
								'Media_loaded',
								'Media_playback_state_playing',
								'Media_playback_state_paused',
								'Media_player_loop_on',
								'Media_player_fade_on',
								'Media_player_hold_at_end_on',
							)
						}
						else if (jsonData.action === 'webpage_displayed') {
							self.generalState.isAnyPresentationDisplayed = jsonData.data.is_any_presentation_displayed
							self.generalState.isAnyPresentationDisplayedInEditMode = jsonData.data.in_edit_mode
							self.checkFeedbacks('presentation_displayed', 'presentation_displayed_in_edit_mode')
						}
						else if (jsonData.action === 'webpage_tabs') {
							let reInit = JSON.stringify(jsonData.data.tabs) != JSON.stringify(self.browserState.tabsList)
							self.browserState.tabsList = jsonData.data.tabs
							self.browserState.activeTabId = jsonData.data.active_tab_id
							if(reInit){
								this.variables(true)
								this.actions()
								this.feedbacks()
							}
							self.setBrowserVariables()
							self.checkFeedbacks('active_tab')

							if(jsonData.data.is_foreground){
								self.setVariableValues({
									Presentation_current: jsonData.data.tabs.find(el => el.id === jsonData.data.active_tab_id)?.url
								})
							}
						}
						else if (jsonData.action === 'active_application') {
							self.generalState.activeApp = jsonData.data.application
							self.checkFeedbacks('active_app')
						}
						else if (jsonData.action === 'seamless_open_webpage_in_progress') {
							self.browserState.seamlessOpenWebpageInProgress = jsonData.data.seamless_open_webpage_in_progress
							self.checkFeedbacks('seamless_open_webpage_in_progress')
						}
						else if (jsonData.action === 'seamless_fs_in_progress') {
							self.browserState.seamlessFullScreenInProgress = jsonData.data.seamless_fs_in_progress
							self.checkFeedbacks('seamless_fs_in_progress')
						}
					} catch (e) {
						self.log('debug', message)
						console.error(e)
					}
				}
			})
		}
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This will establish a TCP connection to interact with the APS app',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP (For local: 127.0.0.1)',
				default: '127.0.0.1',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port (Default: 31600)',
				default: '31600',
				width: 6,
				regex: Regex.PORT,
			},
			{
				type: 'static-text',
				id: 'info-defaultport',
				width: 12,
				value:
					'Check that the port in APS matches the target port shown here. To change the default port in APS, go to “Settings” in the app interface. Note that for earlier versions of APS, (2.2 and below) the default port is 4778. We recommend using port 31600 for connection. If this port is not available, try something else in the same range.',
			},
			{
				type: 'dropdown',
				id: 'sort',
				label: 'Presentation watched folder: Sorting method',
				default: 'normal',
				width: 8,
				choices: [
					{id: "normal", label: "Normal"},
					{id: "numberedonly", label: "Numbered only"},
				]
			},
			{
				type: 'static-text',
				id: 'info-sort',
				width: 12,
				value:
					'<b>Normal:</b> All presentation-files in the folder are shown in alphabetical order.<br/>' +
					'<b>Numbered only:</b> Only presentation filenames starting with numbers are shown, and always put in the folder-position with the same number. Example: «4.john.pptx» will go to position 4, also when its the first presentation alphabetically in the folder.<br/><br/>' +
					'Please note: You need to restart the Companion-module after making changes to these settings.',
			},
		]
	}

	actions() {
		let ats = actions.getActions(this)
		this.setActionDefinitions(ats)
	}

	feedbacks() {
		var self = this
		var fdbs = feedbacks.getFeedbacks(self)
		self.setFeedbackDefinitions(fdbs)
	}

	variables(initOnly = false) {
		var self = this
		var variables = [
			{ name: 'Presentation: Previous in folder', variableId: 'Presentation_previous' },
			{ name: 'Presentation: Current', variableId: 'Presentation_current' },
			{ name: 'Presentation: Next in folder', variableId: 'Presentation_next' },
			{ name: 'Presentation: Selected in watched presentation folder (Name)', variableId: 'watched_presentation_folder_selected_presentation_name' },
			{ name: 'Presentation: Selected in watched presentation folder (Path)', variableId: 'watched_presentation_folder_selected_presentation_path' },
			{ name: 'Presentation: Selected in watched presentation folder (Number)', variableId: 'watched_presentation_folder_selected_presentation_number' },
			{ name: 'Presentation: Watched presentation folder total files count', variableId: 'watched_presentation_folder_total_files_count' },

			{ name: 'Presentation: Selected slot (Number)', variableId: 'presentation_slot_selected_number' },
			{ name: 'Presentation: Selected slot (Name)', variableId: 'presentation_slot_selected_filename' },

			{ name: 'Media player: Selected slot (Number)', variableId: 'media_slot_selected_number' },
			{ name: 'Media player: Selected slot (Name)', variableId: 'media_slot_selected_filename' },

			{ name: 'Still image: Selected slot (Number)', variableId: 'image_slot_selected_number' },
			{ name: 'Still image: Selected slot (Name)', variableId: 'image_slot_selected_filename' },

			{ name: 'Media Player: Selected in watched media folder (Name)', variableId: 'watched_media_folder_selected_media_name' },
			{ name: 'Media Player: Selected in watched media folder (Path)', variableId: 'watched_media_folder_selected_media_path' },
			{ name: 'Media Player: Selected in watched media folder (Number)', variableId: 'watched_media_folder_selected_media_number' },
			{ name: 'Media Player: Watched media folder total files count', variableId: 'watched_media_folder_total_files_count' },

			{ name: 'Slide: Current', variableId: 'slide_number' },
			{ name: 'Slide: Total number', variableId: 'slides_count' },
			{ name: 'Slide: Current build', variableId: 'Slides_current_build' },
			{ name: 'Slide: Builds count', variableId: 'Slides_builds_count' },
			{ name: 'Slide: Current (Powerpoint)', variableId: 'Powerpoint_slide_number' },
			{ name: 'Slide: Total number (Powerpoint)', variableId: 'Powerpoint_slides_count' },
			{ name: 'Slide: Current build (Powerpoint)', variableId: 'Powerpoint_Slides_current_build' },
			{ name: 'Slide: Builds count (Powerpoint)', variableId: 'Powerpoint_Slides_builds_count' },
			{ name: 'Media player: Playing media', variableId: 'Media_playing' },
			{ name: 'Media player: Loaded media', variableId: 'Media_loaded' },
			{ name: 'Media player: Playing media filename', variableId: 'Media_playing_filename' },
			{ name: 'Media player: Loaded media filename', variableId: 'Media_loaded_filename' },
			{ name: 'Media player: Playback state', variableId: 'Media_playback_state' },
			{ name: 'Media player: Time left', variableId: 'Media_time_left' },
			{ name: 'Media player: Time elapsed', variableId: 'Media_time_elapsed' },
			{ name: 'Media player: Time duration', variableId: 'Media_time_duration' },
		]
		for (let i = 1; i <= numberOfPresentationSlots; i++) {
			variables.push({
				name: `Presentation Slot ${i}`,
				variableId: `presentation_slot${i}`,
			})
		}
		for (let i = 1; i <= numberOfImagesSlots; i++) {
			variables.push({
				name: `Image Slot ${i}`,
				variableId: `image_slot${i}`,
			})
		}
		for (let i = 1; i <= numberOfPresentationFolders; i++) {
			variables.push({
				name: `Presentation Folder ${i}`,
				variableId: `presentation_folder${i}`,
			})
		}
		for (let i = 1; i <= numberOfMediaFolders; i++) {
			variables.push({
				name: `Media Folder ${i}`,
				variableId: `media_folder${i}`,
			})
		}

		variables.push({
			name: `Watched Presentation Folder Name`,
			variableId: `watched_presentation_folder_name`,
		})
		variables.push({
			name: `Watched Presentation Folder number`,
			variableId: `watched_presentation_folder_number`,
		})

		for (let i = 1; i <= Math.max(minNumberOfPresentationFolderFiles, self.watchedPresentationFolderState.filesList.length); i++) {
			variables.push({
				name: `Presentation Folder File ${i}`,
				variableId: `presentation_folder_file${i}`,
			})
		}

		variables.push({
			name: `Watched Media Folder Name`,
			variableId: `watched_media_folder_name`,
		})
		variables.push({
			name: `Watched Media Folder number`,
			variableId: `watched_media_folder_number`,
		})

		for (let i = 1; i <= Math.max(minNumberOfMediaFolderFiles, self.watchedMediaFolderState.filesList.length); i++) {
			variables.push({
				name: `Media Folder File ${i}`,
				variableId: `media_folder_file${i}`,
			})
		}

		for (let i = 1; i <= numberOfMediaPlayerSlots; i++) {
			variables.push({
				name: `Media ${i}`,
				variableId: `media_slot${i}`,
			})
		}


		variables.push({
			name: `tab title current`,
			variableId: `tab_title_current`,
		})
		variables.push({
			name: `tab url current`,
			variableId: `tab_url_current`,
		})
		for (let i = 1; i <= Math.max(self.browserState.tabsList.length, minNumberOfTabs); i++) {
			variables.push({
				name: `tab title ${i}`,
				variableId: `tab_title${i}`,
			})

			variables.push({
				name: `tab url ${i}`,
				variableId: `tab_url${i}`,
			})
		}

		self.setVariableDefinitions(variables)

		if(initOnly)
			return

		const values = {
			Presentation_previous: '',
			Presentation_current: '',
			Presentation_next: '',
			slide_number: '',
			slides_count: '',
			Slides_current_build: '',
			Slides_builds_count: '',
			Powerpoint_slide_number: '',
			Powerpoint_slides_count: '',
			Powerpoint_Slides_current_build: '',
			Powerpoint_Slides_builds_count: '',
			Media_playing: '',
			Media_loaded: '',
			Media_playing_filename: '',
			Media_loaded_filename: '',
			Media_playback_state: '',
			Media_time_left: '',
			Media_time_elapsed: '',
			Media_time_duration: '',
		}
		try {
			for (let i = numberOfPresentationSlots; i > 0; i--) {
				values[`presentation_slot${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}
		try {
			for (let i = numberOfImagesSlots; i > 0; i--) {
				values[`image_slot${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}

		try {
			for (let i = numberOfPresentationFolders; i > 0; i--) {
				values[`presentation_folder${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}

		try {
			for (let i = numberOfMediaFolders; i > 0; i--) {
				values[`media_folder${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}

		try {
			for (let i = numberOfMediaPlayerSlots; i > 0; i--) {
				values[`media_slot${i}`] = '-'
			}
		} catch (err) {
			self.log('debug', err)
		}

		values['presentation_slot_selected_number'] = 1
		values['media_slot_selected_number'] = 1
		values['image_slot_selected_number'] = 1

		self.setVariableValues(values)
	}

	setSlotVariables(data) {
		var self = this
		const values = {}

		try {
			for (let i = numberOfPresentationSlots; i > 0; i--) {
				values[`presentation_slot${i}`] = data.filenames[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}

		values['presentation_slot_selected_filename'] = data.filenames[parseInt(self.getVariableValue('presentation_slot_selected_number')) - 1]

		self.setVariableValues(values)
	}

	setImagesVariables(data) {
		var self = this
		const values = {}

		try {
			for (let i = numberOfImagesSlots; i > 0; i--) {
				values[`image_slot${i}`] = data.filenames[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}
		values['image_slot_selected_filename'] = data.filenames[parseInt(self.getVariableValue('image_slot_selected_number')) - 1]
		self.setVariableValues(values)
	}

	setPresentationFolderVariables(data) {
		var self = this
		const values = {}

		try {
			for (let i = numberOfPresentationFolders; i > 0; i--) {
				values[`presentation_folder${i}`] = data.names[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	setPresentationFolderFilesVariables() {
		var self = this
		const values = {}
		values[`watched_presentation_folder_name`] = self.watchedPresentationFolderState.name
		values[`watched_presentation_folder_number`] = self.watchedPresentationFolderState.number
		let filesList = self.watchedPresentationFolderState.filesList
		try {
			for (let i = Math.max(minNumberOfPresentationFolderFiles, filesList.length); i > 0; i--) {
				let text = ''
				if(i <= filesList.length)
					text = utils.getNameFromPath(filesList[i - 1])
				values[`presentation_folder_file${i}`] = text
			}
		} catch (err) {
			self.log('debug', err)
		}

		
		if(filesList.length > 0){
			if(!filesList.includes(self.getVariableValue('watched_presentation_folder_selected_presentation_path'))){
				values['watched_presentation_folder_selected_presentation_number'] = 1
				values['watched_presentation_folder_total_files_count'] = filesList.length
				values['watched_presentation_folder_selected_presentation_path'] = filesList[0]
				values['watched_presentation_folder_selected_presentation_name'] = utils.getNameFromPath(filesList[0])
			}
		}
		else{
			values['watched_presentation_folder_selected_presentation_number'] = null
			values['watched_presentation_folder_total_files_count'] = null
			values['watched_presentation_folder_selected_presentation_path'] = null
			values['watched_presentation_folder_selected_presentation_name'] = null
		}
		self.setVariableValues(values)
	}


	setMediaFolderVariables(data) {
		var self = this
		const values = {}

		try {
			for (let i = numberOfMediaFolders; i > 0; i--) {
				values[`media_folder${i}`] = data.names[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	setMediaFolderFilesVariables() {
		var self = this
		const values = {}
		values[`watched_media_folder_name`] = self.watchedMediaFolderState.name
		values[`watched_media_folder_number`] = self.watchedMediaFolderState.number
		let filesList = self.watchedMediaFolderState.filesList
		try {
			for (let i = Math.max(minNumberOfMediaFolderFiles, filesList.length); i > 0; i--) {
				let text = ''
				if(i <= filesList.length)
					text = utils.getNameFromPath(filesList[i - 1])
				values[`media_folder_file${i}`] = text
			}
		} catch (err) {
			self.log('debug', err)
		}

		
		if(filesList.length > 0){
			if(!filesList.includes(self.getVariableValue('watched_media_folder_selected_media_path'))){
				values['watched_media_folder_selected_media_number'] = 1
				values['watched_media_folder_total_files_count'] = filesList.length
				values['watched_media_folder_selected_media_path'] = filesList[0]
				values['watched_media_folder_selected_media_name'] = utils.getNameFromPath(filesList[0])
			}
		}
		else{
			values['watched_media_folder_selected_media_number'] = null
			values['watched_media_folder_total_files_count'] = null
			values['watched_media_folder_selected_media_path'] = null
			values['watched_media_folder_selected_media_name'] = null
		}
		self.setVariableValues(values)
	}

	setMediaPlayerVariables(data) {
		var self = this
		const values = {
			Media_playing: data.Media_playing,
			Media_loaded: data.Media_loaded,
			Media_playing_filename: data.Media_playing_filename,
			Media_loaded_filename: data.Media_loaded_filename,
			Media_playback_state: data.Media_playback_state,
			Media_time_left: data.Media_time_left,
			Media_time_elapsed: data.Media_time_elapsed,
			Media_time_duration: data.Media_duration,
		}

		try {
			for (let i = numberOfMediaPlayerSlots; i > 0; i--) {
				values[`media_slot${i}`] = data.filenames[i - 1]
			}
		} catch (err) {
			self.log('debug', err)
		}

		values['media_slot_selected_filename'] = data.filenames[parseInt(self.getVariableValue('media_slot_selected_number')) - 1]

		self.setVariableValues(values)
	}

	setBrowserVariables() {
		var self = this
		const values = {}
		let tabsList = self.browserState.tabsList

		let activeTab = tabsList.find(el => el.id === self.browserState.activeTabId)
		values['tab_title_current'] = activeTab?.title
		values['tab_url_current'] = activeTab?.url

		try {
			for (let i = Math.max(tabsList.length, minNumberOfTabs); i > 0; i--) {
				let title = ''
				let url = ''
				if(i <= tabsList.length){
					title = tabsList[i - 1].title
					url = tabsList[i - 1].url
				}
				values[`tab_title${i}`] = title
				values[`tab_url${i}`] = url
			}
		} catch (err) {
			self.log('debug', err)
		}

		self.setVariableValues(values)
	}

	presets() {
		var self = this
		try {
			self.setPresetDefinitions(presets.getPresets(self))
		} catch (err) {
			self.log('debug', err)
		}
	}

	async destroy() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
		}

		self.log('debug', `destroy ${self.id}`)
	}
}

class MessageBuffer {
	constructor() {
		this.delimiter = '$'
		this.buffer = ''
	}

	isFinished() {
		return this.buffer.length === 0 || this.buffer.indexOf(this.delimiter) === -1
	}

	push(data) {
		this.buffer += data
	}

	getMessages() {
		const messages = []

		while (!this.isFinished()) {
			const delimiterIndex = this.buffer.indexOf(this.delimiter)
			if (delimiterIndex !== -1) {
				const message = this.buffer.slice(0, delimiterIndex)
				this.buffer = this.buffer.replace(message + this.delimiter, '')
				messages.push(message)
			}
		}
		return messages.length > 0 ? messages : null
	}
}

class MessageBufferV2 {
	constructor() {
		this.buffer = Buffer.alloc(0); // Use a Buffer instead of string for binary data
	}

	// Check if there is enough data to parse a full message
	isFinished() {
		if (this.buffer.length < 4) return true; // Less than 4 bytes means no length prefix yet

		const messageLength = this.buffer.readUInt32BE(0); // Read the length prefix
		return this.buffer.length < 4 + messageLength; // Check if the buffer has the full message
	}

	// Append new data to the buffer
	push(data) {
		this.buffer = Buffer.concat([this.buffer, Buffer.from(data)]);
	}

	// Extract complete messages based on length prefix
	getMessages() {
		const messages = [];

		while (!this.isFinished()) {
			// Read the length prefix (4 bytes) to get message length
			const messageLength = this.buffer.readUInt32BE(0);

			// Extract the message based on the prefixed length
			const message = this.buffer.slice(4, 4 + messageLength).toString('utf-8');
			if(message.length > 1) // 1 not 0 to exclude $ api v1 backward compatibility (will cause an issue when parsing JSON)
				messages.push(message);

			// Remove the processed message and its length prefix from the buffer
			this.buffer = this.buffer.slice(4 + messageLength);
		}

		return messages.length > 0 ? messages : null;
	}
}

runEntrypoint(APSInstance, [])
