const path = require('path')
const fs = require('fs')

function shouldExcludePath(filePath) {
	return (
		filePath.startsWith('http') ||
		filePath.startsWith('//') ||
		filePath.startsWith('/') ||
		filePath.includes('fonts.googleapis.com') ||
		filePath.includes('cdnjs.cloudflare.com') ||
		filePath.startsWith('data:image') ||
		filePath.startsWith('tel:') ||
		filePath.startsWith('mailto:') ||
		filePath.startsWith('javascript:void(0)') ||
		filePath.startsWith('#form')
	)
}

function replacePaths(file, projectRoot, basePath) {
	let content = fs.readFileSync(file, 'utf-8')
	const fileDir = path.dirname(file)

	// Обработка атрибутов href, src, action, data-background
	content = content.replace(
		/(href|src|action|data-background)=['"](.*?)['"]/g,
		(match, attr, relativePath) => {
			if (shouldExcludePath(relativePath)) return match

			let absolutePath

			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else if (relativePath.startsWith('#')) {
				absolutePath = path.join(fileDir, 'index.html') + relativePath
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(projectRoot, absolutePath)
			return `${attr}="${basePath}/${relativeToRoot}"`
		}
	)

	// Обработка атрибута srcset
	content = content.replace(/srcset=['"](.*?)['"]/g, (match, srcset) => {
		const updatedSrcset = srcset
			.split(',')
			.map(entry => {
				const [url, descriptor] = entry.trim().split(/\s+/)

				if (shouldExcludePath(url)) return entry.trim()

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

		return `srcset="${updatedSrcset}"`
	})

	// Обработка путей в CSS (url)
	content = content.replace(
		/url\((['"]?)(.*?)\1\)/g,
		(match, quote, relativePath) => {
			if (shouldExcludePath(relativePath)) return match

			let absolutePath
			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(projectRoot, absolutePath)
			return `url(${basePath}/${relativeToRoot})`
		}
	)

	// Обработка путей в атрибутах style
	content = content.replace(/style=['"](.*?)['"]/g, (match, styleContent) => {
		const updatedStyleContent = styleContent.replace(
			/url\((['"]?)(.*?)\1\)/g,
			(styleMatch, quote, relativePath) => {
				if (shouldExcludePath(relativePath)) return styleMatch

				let absolutePath
				if (relativePath === './' || relativePath === '.') {
					absolutePath = path.join(fileDir, 'index.html')
				} else {
					absolutePath = path.resolve(fileDir, relativePath)
				}

				const relativeToRoot = path.relative(projectRoot, absolutePath)
				return `url(${basePath}/${relativeToRoot})`
			}
		)
		return `style="${updatedStyleContent}"`
	})

	// Обработка путей в JavaScript коде, например в location.href или location=
	content = content.replace(
		/(window\.location\.href|location)=['"](.*?)['"]/g,
		(match, attr, relativePath) => {
			if (shouldExcludePath(relativePath)) return match

			let absolutePath
			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(projectRoot, absolutePath)
			return `${attr}="${basePath}/${relativeToRoot}"`
		}
	)

	fs.writeFileSync(file, content, 'utf-8')
}

module.exports = { replacePaths }
