import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { walkSync } from './file-utils.js'
import logger from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function addCookie(name, basePath) {
	logger.log(`\n👉 Проверяю cookie...`)

	const assetsPath = path.join(__dirname, '../assets', 'cookie')
	const destinationPath = path.join(name, 'cookie')

	if (!fs.existsSync(destinationPath)) {
		fs.copySync(assetsPath, destinationPath)
		logger.log(`🍪 Копирую папку с cookie`)

		addCookieLinks(name, basePath)
		logger.log(`✅ Ссылки на cookie добавлены`)

		const language = extractLanguageFromHtml(
			path.join(name, 'index.html')
		).toLowerCase()
		modifyCookieSettings(destinationPath, language, './cookie.html')
	} else {
		logger.log(`👍 Папка cookie уже добавлена`)
	}
}

function extractLanguageFromHtml(indexPath) {
	try {
		const content = fs.readFileSync(indexPath, 'utf-8')
		const langMatch = content.match(/<html[^>]*\s+lang=['"]([^'"]+)['"]/i)

		if (langMatch && langMatch[1]) {
			return langMatch[1]
		} else {
			logger.log(
				'⚠️ Не удалось найти атрибут lang, используется значение по умолчанию "en"'
			)
			return 'en'
		}
	} catch (error) {
		logger.log(`❌ Ошибка при чтении файла index.html: ${error.message}`)
		return 'en'
	}
}

function addCookieLinks(name, basePath) {
	const files = walkSync(name)

	files.forEach(file => {
		if (file.endsWith('.html')) {
			let content = fs.readFileSync(file, 'utf-8')

			const cookieLinks = `
                    <!-- Cookie banner -->
                    <link rel="stylesheet" href="${basePath}/cookie/on-cookies.css" />
                    <script type="module" src="${basePath}/cookie/on-cookies.js" defer></script>
                    <!-- End cookie banner -->
              `
			content = content.replace(/<\/head>/i, `${cookieLinks}\n</head>`)
			fs.writeFileSync(file, content, 'utf-8')
		}
	})
}

function modifyCookieSettings(destinationPath, language, policy) {
	const cookieJsPath = path.join(destinationPath, 'on-cookies.js')

	if (fs.existsSync(cookieJsPath)) {
		try {
			let content = fs.readFileSync(cookieJsPath, 'utf-8')

			content = content.replace(
				/language:\s*['"]\w+['"]/,
				`language: '${language}'`
			)

			content = content.replace(/policy:\s*['"].*?['"]/, `policy: '${policy}'`)

			fs.writeFileSync(cookieJsPath, content, 'utf-8')

			logger.log(
				`✅ Настройки cookie успешно обновлены в ${path.basename(cookieJsPath)}`
			)
		} catch (error) {
			logger.log(`❌ Ошибка при изменении настроек cookie: ${error.message}`)
		}
	} else {
		logger.log(`❌ Файл on-cookies.js не найден в ${cookieJsPath}`)
	}
}
