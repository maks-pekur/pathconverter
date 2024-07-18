const fs = require('fs')
const path = require('path')

function toSnakeCase(str) {
	return str
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
		.replace(/[\s-]+/g, '_')
		.toLowerCase()
}

function renameToSnakeCase(directoryPath) {
	const dirName = path.basename(directoryPath)
	const parentDir = path.dirname(directoryPath)

	const snakeCaseName = toSnakeCase(dirName)
	const newDirPath = path.join(parentDir, snakeCaseName)

	if (directoryPath !== newDirPath) {
		fs.renameSync(directoryPath, newDirPath)
		console.log(`Папка "${dirName}" переименована в "${snakeCaseName}"`)
	} else {
		console.log(`Папка уже в snake_case стиле: "${snakeCaseName}"`)
	}

	return newDirPath
}

module.exports = {
	renameToSnakeCase,
	toSnakeCase,
}
