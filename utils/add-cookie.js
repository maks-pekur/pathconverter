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
		logger.log(`✅ Ссылки на cookie добавлены`)
	} else {
		logger.log(`👍 Папка cookie уже существует`)
	}
}
