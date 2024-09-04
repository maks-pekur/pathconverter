import fs from 'fs-extra'
import path from 'path'

function safeStatSync(path) {
	try {
		return fs.statSync(path)
	} catch (error) {
		if (error.code === 'EACCES') {
			logger.log(`❌ Недостаточно прав для доступа к файлу: ${path}`)
		} else {
			throw error
		}
	}
}

export function walkSync(dir) {
	let files = []
	fs.readdirSync(dir).forEach(file => {
		const fullPath = path.join(dir, file)
		const stat = safeStatSync(fullPath)
		if (stat && stat.isDirectory()) {
			files = files.concat(walkSync(fullPath))
		} else if (stat) {
			files.push(fullPath)
		}
	})
	return files
}

