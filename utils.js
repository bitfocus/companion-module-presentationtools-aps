exports.getNameFromPath = function(fullPath){
    return fullPath.split(/(\\|\/)/g).pop()
}

exports.extcractNumber = function(str){
	let numberMatches = str.toString().match(/\d+$/);
		if (numberMatches) {
			return numberMatches[0]
		}
		return null
}

exports.formatPowerPointMediaTime = function(timeString) {
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