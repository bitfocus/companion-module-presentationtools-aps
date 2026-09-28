## PresentationTools APS

Controls APS by [PresentationTools](https://presentationtools.com/).

### Requirements

- PC: APS v. 1.0.0.5 and above
- Mac: APS v.2 (0) and above
- Download latest version of APS from this website: [www.presentationtools.com/aps](https://presentationtools.com/aps)
- _Note: Still-images requires APS v.2 and above_

### Configuration

- IP address of the computer running APS for local use 127.0.0.1.
- Port, the default is 4777.

### Available actions:

#### Navigation & tabs:

- Open next presentation with fullscreen and slide number.
- Open the previous presentation with fullscreen and slide number.
- Open the next presentation without putting it in fullscreen. (deprecated)
- Put current presentation in fullscreen
- Close all except current.

#### Capture Image:

- Take screenshot of the main presenter-screen and store this in the image-banks.
- Choose between 10 destinations.

#### Display Image:

- Display image on the main presenter screen. Choose between image-bank 1-10 or test-image, blackout or freeze screen. (Note: In APS preferences you can choose if this command is a toggle-button or not)

#### Exit Images:

- Exit APS-image from the main presenter screen

#### Open/Start Presentation:

- Open presentation specified in file name with full screen and slide number

#### Generic - Go to slide:

- Go to the slide specified in the command
- Go to the first slide of a selected, previous, or next PowerPoint section.

#### Settings

APS 4.2 or later on macOS can change these settings over LAN:

- Settings: Main presenter screen
- Settings: Presentation file handling
- Settings: Seamless switching
- Settings: Toggle images on/off with one button
- Settings: PowerPoint hide presenter (mac)
- Settings: Google Slides use presenter view
- Settings: PDF controlled program
- Settings: Automatically check for updates

The PDF controlled program choices follow the platform APS reports: Skim or Adobe Acrobat on macOS; Adobe Acrobat, Adobe Reader, Okular, or Speedf on Windows. Before APS has identified its platform, all programs are listed with a platform label. Once APS reports which applications are installed, only the installed PDF programs are listed; if none is detected, all programs for the platform are listed.

Boolean settings can be enabled, disabled, or toggled. Presenter-screen choices are populated from the displays reported by APS. Network port, run at system startup, detected applications, and effective-display information remain read-only over LAN.

#### Commands to control specific presentation software:

- Powerpoint: Go to slide
- Powerpoint: Previous slide
- Powerpoint: Next slide

- Adobe Acrobat DC: Go to slide
- Adobe Acrobat DC: Previous slide
- Adobe Acrobat DC: Next slide

Mac only:

- Keynote: Go to slide
- Keynote: Previous slide
- Keynote: Next slide

The Keynote choices in the slide actions, the Keynote presets, and the Keynote choice in the active application feedback are labelled (Mac). They are hidden once APS reports that it runs on Windows, and reappear when APS on macOS connects. Existing buttons keep their Keynote settings while hidden.

Windows only:

- Presentation: PowerPoint Media Control
- Presentation: PowerPoint Media Seek

These actions, the PowerPoint media state feedback, the PowerPoint media control presets, and the `PowerPoint_media_*` variables are hidden once APS reports that it runs on macOS. They stay hidden after a Mac disconnects, and reappear when APS on Windows connects. Before any APS has connected, and with APS versions older than 4.3, all options are shown. Existing buttons keep these actions while they are hidden.

#### Filenames on Companion buttons

- Display the filenames of the presentation file currently displayed, and the files that will be used with the previous and next commands.

#### Network Commands for 20 presentation from slot

- Open/Start presentation from slot

#### Variables

On confirmed APS-Mac connections, `Slides_builds_count` and `Powerpoint_Slides_builds_count` keep the previous numeric total for up to one second if a slide change temporarily reports an unavailable total. A new count, including zero, appears immediately. Current build position and slide number are never delayed. If the total remains unavailable, the hold expires; repeated messages do not extend it. Presentation changes and connection resets cancel pending holds.

This is display smoothing: during the hold, the total can belong to the preceding slide and must not be treated as a confirmed count for automation. It requires APS to identify its platform as `macos` in `aps_info`. Windows, unknown platforms, and older versions without platform identification retain immediate updates. The APS network API is unchanged.

- Presentation_current: Currently opened presentation
- Presentation_previous: Prevously opened presentation
- Presentation_next: Next presentation to be opened
- Presentation_notes: Presenter notes for the current slide
- slide_number: Slide Number
- slides_count: Slides Count
- Slides_builds_count: Builds Count
- Powerpoint_sections_available: Whether section information is available for the active PowerPoint slideshow
- Powerpoint_sections_current_index: Current section number
- Powerpoint_sections_current_id: Current section ID
- Powerpoint_sections_current_name: Current section name
- Powerpoint_sections_current_slide_in_section: Current slide number within the section
- Powerpoint_sections_count: Total number of sections
- Powerpoint_section&lt;n&gt;_id: Section ID for section &lt;n&gt;
- Powerpoint_section&lt;n&gt;_name: Section name for section &lt;n&gt;
- Powerpoint_section&lt;n&gt;_first_slide_index: First presentation slide number for section &lt;n&gt;
- Powerpoint_section&lt;n&gt;_slides_count: Number of slides in section &lt;n&gt;
- settings_main_presenter_screen_selection: Configured presenter-screen selection mode
- settings_main_presenter_screen_configured_display_id: Configured display ID, or `Auto` when automatic selection is active (APS may report `null` or `0`)
- settings_main_presenter_screen_effective_display_id: Display ID currently resolved by APS
- settings_main_presenter_screen_effective_display_name: Display name currently resolved by APS
- settings_presentation_file_handling: Presentation file handling mode
- settings_seamless_switching: Whether Seamless Switching is enabled
- settings_run_at_system_startup_enabled: Whether the macOS login item is enabled
- settings_toggle_images_on_off_with_one_button: Whether one still-image action toggles an image on and off
- settings_powerpoint_hide_presenter: Whether APS suppresses PowerPoint Presenter View (mac)
- settings_google_slides_use_presenter_view: Whether APS uses Google Slides Presenter View
- settings_pdf_controlled_program: PDF application controlled by APS
- settings_automatically_check_for_updates: Whether APS automatically checks for updates
- settings_installed_presentation_apps: Detected presentation applications, separated by commas

The `settings_` variables require APS 4.2 or later on macOS. They remain blank when the connected APS version or platform does not provide settings feedback.

#### Feedbacks

- Settings: Seamless switching is on
- Settings: Run at system startup is on
- Settings: Toggle images on/off with one button is on
- Settings: PowerPoint hide presenter is on (mac)
- Settings: Google Slides use presenter view is on
- Settings: Automatically check for updates is on
- loaded: is enabled when a still image is loaded in the image-banks
- displayed: is enabled when a still image is displayed
- captured: is enabled when screen is captured for saving as a still image.
- slot_displayed: is enabled when the presentation in slot-bank is opened
- slot_exist: is enabled when a presentation exists for a slot.
- PowerPoint_section_exists: is enabled when the active PowerPoint presentation contains the selected section number.
- PowerPoint section is displayed: is enabled when the current slide is within the selected PowerPoint section.
