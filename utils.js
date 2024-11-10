exports.getNameFromPath = function(fullPath){
    return fullPath.split(/(\\|\/)/g).pop()
}