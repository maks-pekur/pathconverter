const path = require('path')
const fs = require('fs')

// Проверка, является ли путь внешним (URL, шрифты, data:image и т.д.)
function isExternalPath(filePath) {
	return (
		filePath.startsWith('http') ||
		filePath.startsWith('//') ||
		filePath.startsWith('/') ||
		filePath.includes('fonts.googleapis.com') ||
		filePath.includes('cdnjs.cloudflare.com') ||
		filePath.startsWith('data:image') ||
		filePath.startsWith('tel:') ||
		filePath.startsWith('mailto:') ||
		filePath.startsWith('javascript:void(0)')
	)
}

// Обработка относительных путей в различных атрибутах
function replacePaths(file, projectRoot, basePath) {
	let content = fs.readFileSync(file, 'utf-8')
	const fileDir = path.dirname(file)

	// Заменяем атрибуты `href`, `src`, `xlink:href`, `action`, `data-background` и `style`
	content = content.replace(
		/(href|src|xlink:href|action|data-background)=['"](.*?)['"]/g,
		(match, attr, relativePath) => {
			if (isExternalPath(relativePath)) return match

			let absolutePath
			// Обработка пути `./` (текущая директория)
			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else if (relativePath.startsWith('#') && attr !== 'xlink:href') {
				absolutePath = path.join(fileDir, 'index.html') + relativePath
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(projectRoot, absolutePath)
			return `${attr}='${basePath}/${relativeToRoot}'`
		}
	)

	// Обработка атрибута `srcset`
	content = content.replace(/srcset=['"](.*?)['"]/g, (match, srcset) => {
		const updatedSrcset = srcset
			.split(',')
			.map(entry => {
				const [url, descriptor] = entry.trim().split(/\s+/)

				if (isExternalPath(url)) return entry.trim()

				let absolutePath
				if (url === './' || url === '.') {
					absolutePath = path.join(fileDir, 'index.html')
				} else if (url.startsWith('#')) {
					absolutePath = path.join(fileDir, 'index.html') + url
				} else {
					absolutePath = path.resolve(fileDir, url)
				}

				const relativeToRoot = path.relative(projectRoot, absolutePath)
				return `${basePath}/${relativeToRoot} ${descriptor || ''}`.trim()
			})
			.join(', ')

		return `srcset='${updatedSrcset}'`
	})

	// Обрабатываем пути в CSS (`url`)
	content = content.replace(
		/url\(['"]?(.*?)['"]?\)/g,
		(match, relativePath) => {
			if (isExternalPath(relativePath)) return match

			let absolutePath
			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(projectRoot, absolutePath)
			return `url('${basePath}/${relativeToRoot}')`
		}
	)

	// Обрабатываем пути в атрибутах `style`
	content = content.replace(/style=['"](.*?)['"]/g, (match, styleContent) => {
		const updatedStyleContent = styleContent.replace(
			/url\(['"]?(.*?)['"]?\)/g,
			(styleMatch, relativePath) => {
				if (isExternalPath(relativePath)) return styleMatch

				let absolutePath
				if (relativePath === './' || relativePath === '.') {
					absolutePath = path.join(fileDir, 'index.html')
				} else {
					absolutePath = path.resolve(fileDir, relativePath)
				}

				const relativeToRoot = path.relative(projectRoot, absolutePath)
				return `url('${basePath}/${relativeToRoot}')`
			}
		)
		return `style="${updatedStyleContent}"`
	})

	// Обрабатываем пути в window.location.href
	content = content.replace(
		/window\.location\.href\s*=\s*['"](.*?)['"]/g,
		(match, relativePath) => {
			if (isExternalPath(relativePath)) return match

			let absolutePath
			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(projectRoot, absolutePath)
			return `window.location.href='${basePath}/${relativeToRoot}'`
		}
	)

	// Запись обновленного контента обратно в файл
	fs.writeFileSync(file, content, 'utf-8')
}

module.exports = { replacePaths }
