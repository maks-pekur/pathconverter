import fs from 'fs-extra'
import path from 'path'

import logger from './logger.js'

function toSnakeCase(str) {
	return str
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
		.replace(/[\s-]+/g, '_')
		.toLowerCase()
}

export function renameToSnakeCase(directoryPath) {
	logger.log(`\n👉 Проверяю название...`)

	const dirName = path.basename(directoryPath)
	const parentDir = path.dirname(directoryPath)

	const snakeCaseName = toSnakeCase(dirName)

	const newDirPath = path.join(parentDir, snakeCaseName)

	if (directoryPath !== newDirPath) {
		fs.renameSync(directoryPath, newDirPath)
		logger.log(`✅ Папка "${dirName}" переименована в "${snakeCaseName}"`)
	} else {
		logger.log(`👍 Папка уже в snake_case стиле: "${snakeCaseName}"`)
	}

	return newDirPath
}
