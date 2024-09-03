import fs from 'fs-extra'
import path from 'path'
import { walkSync } from './file-utils.js'
import logger from './logger.js'

export function convertToHtml(projectPath) {
	logger.log(`\n👉 Проверяю расширение файлов...`)

	const files = walkSync(projectPath)
	const phpFilesFound = files.some(file => file.endsWith('.php'))

	files.forEach(file => {
		if (file.endsWith('.php')) {
			const htmlFile = file.replace(/\.php$/, '.html')
			fs.renameSync(file, htmlFile)
			logger.log(`✅ ${path.basename(file)} -> ${path.basename(htmlFile)}`)
		}
	})

	logger.log(
		phpFilesFound
			? `✅ Все файлы были переименованы в .html.`
			: `👍 Все файлы уже имеют расширение .html.`
	)
}
