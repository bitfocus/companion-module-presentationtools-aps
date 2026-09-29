exports.getNameFromPath = function (fullPath) {
	if (fullPath == null || typeof fullPath !== 'string') {
		return ''
	}
	return fullPath.split(/(\\|\/)/g).pop()
}

exports.extcractNumber = function (str) {
	let numberMatches = str.toString().match(/\d+$/)
	if (numberMatches) {
		return numberMatches[0]
	}
	return null
}

// APS-Mac reports "macos" and APS-PC reports "windows" (APS 4.3 and later).
exports.getAPSPlatformLabel = function (platform) {
	if (platform === 'macos') return 'Mac'
	if (platform === 'windows') return 'PC'
	return typeof platform === 'string' && platform.trim() !== '' ? platform.trim() : null
}

exports.getAPSVersion = function (info) {
	const version = info?.app_version
	return typeof version === 'string' && version.trim() !== '' ? version.trim() : null
}

// For example "Macbook #1 · Mac · APS 4.5 (52)"; parts APS did not report are left out.
exports.describeAPSMachine = function (info) {
	const version = exports.getAPSVersion(info)
	return [
		exports.getAPSMachineName(info),
		exports.getAPSPlatformLabel(info?.platform),
		version ? `APS ${version}` : null,
	]
		.filter(Boolean)
		.join(' · ')
}

exports.formatPowerPointMediaTime = function (timeString) {
	if (typeof timeString !== 'string') {
		return timeString
	}

	const trimmed = timeString.trim()
	if (trimmed === '') {
		return ''
	}

	const parts = trimmed.split(':')
	if (parts.length !== 3) {
		return trimmed
	}

	const [hoursStr, minutesStr, secondsStr] = parts
	const hours = parseInt(hoursStr, 10)
	const minutes = parseInt(minutesStr, 10)
	const seconds = parseInt(secondsStr, 10)

	if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
		return trimmed
	}

	const totalMinutes = hours * 60 + minutes
	const formattedSeconds = seconds.toString().padStart(2, '0')

	return `${totalMinutes}:${formattedSeconds}`
}

exports.normalizePowerPointMediaState = function (state, duration, currentPosition) {
	if (state === undefined || state === null) {
		return state
	}

	if (state === 'not_ready') {
		return 'ready'
	}

	if (state === 'stopped') {
		const hasDuration = typeof duration === 'string' && duration.trim() !== ''
		const hasCurrentPosition = typeof currentPosition === 'string' && currentPosition.trim() !== ''

		if (hasDuration && hasCurrentPosition && duration.trim() != currentPosition.trim()) {
			return 'ready'
		}
	}

	return state
}

// PowerPoint media control is Windows-only. Hide it only once APS has confirmed a Mac,
// so unknown platforms and older APS versions keep every option.
exports.supportsPowerPointMediaControl = function (platform) {
	return platform !== 'macos'
}

// Keynote is macOS-only. Hide it only once APS has confirmed Windows.
exports.supportsKeynote = function (platform) {
	return platform !== 'windows'
}

// APS-Mac does not report PowerPoint's own slide number and count. Hide them only once APS has confirmed a Mac.
exports.supportsPowerPointSlideVariables = function (platform) {
	return platform !== 'macos'
}

// Companion stores a discovered APS machine as "address:port"; null/empty means Manual.
exports.parseBonjourTarget = function (value) {
	if (typeof value !== 'string') return null
	const separator = value.lastIndexOf(':')
	if (separator <= 0) return null
	const host = value.slice(0, separator).replace(/^\[(.*)\]$/, '$1')
	const port = Number(value.slice(separator + 1))
	if (!host || !Number.isInteger(port) || port < 1 || port > 65535) return null
	return { host, port }
}

// Human-readable name of the connected APS machine from aps_info: PC tag, then hostname.
exports.getAPSMachineName = function (info) {
	for (const value of [info?.computer_tag, info?.hostname]) {
		if (typeof value === 'string' && value.trim() !== '') return value.trim()
	}
	return null
}

exports.getLicenceStateLabel = function (status) {
	if (!status) return null
	if (status.state === 'licensed') return 'Licensed'
	if (status.state === 'trial') return 'Trial'
	return 'Unknown'
}

// Matches APS Hub: "3d 4h", "2h 5m", "12m", or "expired". Null when there is no usable deadline.
exports.getTrialTimeLeft = function (expiresAt, now = Date.now()) {
	const deadline = typeof expiresAt === 'string' ? Date.parse(expiresAt) : Number.NaN
	if (!Number.isFinite(deadline)) return null
	const remaining = deadline - now
	if (remaining <= 0) return 'expired'
	const totalMinutes = Math.ceil(remaining / 60000)
	const days = Math.floor(totalMinutes / 1440)
	const hours = Math.floor((totalMinutes % 1440) / 60)
	const minutes = totalMinutes % 60
	if (days > 0) return `${days}d ${hours}h`
	if (hours > 0) return `${hours}h ${minutes}m`
	return `${minutes}m`
}

exports.getLicenceReasonText = function (reason) {
	if (reason === 'license_invalidated') return 'APS reported that its licence became invalid.'
	if (reason === 'trial_expired') return 'APS reported that its trial expired.'
	return typeof reason === 'string' && reason !== '' ? `APS reported: ${reason.replaceAll('_', ' ')}.` : null
}
