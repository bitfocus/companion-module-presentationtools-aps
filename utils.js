exports.getNameFromPath = function(fullPath){
    return fullPath.split(/(\\|\/)/g).pop()
}

exports.extcractNumber = function(str){
	let numberMatches = str.match(/\d+$/);
		if (numberMatches) {
			return numberMatches[0]
		}
		return null
}