import fs from 'fs'
import path from 'path'
import { walkSync } from './file-utils.js'
import logger from './logger.js'

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
		filePath.startsWith('#form') ||
		filePath.trim() === ''
	)
}

function processAttributes(content, fileDir, basePath, project, taskType) {
	return content.replace(
		/(href|src|action|data-background)=['"](.*?)['"]/g,
		(match, attr, relativePath, offset, string) => {
			const isCanonical = string.slice(0, offset).includes('rel="canonical"')
			if (isCanonical || shouldExcludePath(relativePath)) return match

			if (taskType === 'websites') {
				relativePath = relativePath.replace(/\.php$/, '.html')
			}

			let absolutePath

			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else if (relativePath.startsWith('#')) {
				absolutePath = path.join(fileDir, 'index.html') + relativePath
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(project, absolutePath)
			return `${attr}="${basePath}/${relativeToRoot}"`
		}
	)
}

function processSrcset(content, fileDir, basePath, project, taskType) {
	return content.replace(/srcset=['"](.*?)['"]/g, (match, srcset) => {
		const updatedSrcset = srcset
			.split(',')
			.map(entry => {
				let [url, descriptor] = entry.trim().split(/\s+/)

				if (shouldExcludePath(url)) return entry.trim()

				if (taskType === 'websites') {
					url = url.replace(/\.php$/, '.html')
				}

				let absolutePath
				if (url === './' || url === '.') {
					absolutePath = path.join(fileDir, 'index.html')
				} else if (url.startsWith('#')) {
					absolutePath = path.join(fileDir, 'index.html') + url
				} else {
					absolutePath = path.resolve(fileDir, url)
				}

				const relativeToRoot = path.relative(project, absolutePath)
				return `${basePath}/${relativeToRoot} ${descriptor || ''}`.trim()
			})
			.join(', ')

		return `srcset="${updatedSrcset}"`
	})
}

function processCssUrls(content, fileDir, basePath, project, taskType) {
	return content.replace(
		/url\((['"]?)(.*?)\1\)/g,
		(match, quote, relativePath) => {
			if (shouldExcludePath(relativePath)) return match

			if (taskType === 'websites') {
				relativePath = relativePath.replace(/\.php$/, '.html')
			}

			let absolutePath
			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(project, absolutePath)
			return `url(${basePath}/${relativeToRoot})`
		}
	)
}

function processInlineStyles(content, fileDir, basePath, project, taskType) {
	return content.replace(/style=['"](.*?)['"]/g, (match, styleContent) => {
		const updatedStyleContent = styleContent.replace(
			/url\((['"]?)(.*?)\1\)/g,
			(styleMatch, quote, relativePath) => {
				if (shouldExcludePath(relativePath)) return styleMatch

				if (taskType === 'websites') {
					relativePath = relativePath.replace(/\.php$/, '.html')
				}

				let absolutePath
				if (relativePath === './' || relativePath === '.') {
					absolutePath = path.join(fileDir, 'index.html')
				} else {
					absolutePath = path.resolve(fileDir, relativePath)
				}

				const relativeToRoot = path.relative(project, absolutePath)
				return `url(${basePath}/${relativeToRoot})`
			}
		)
		return `style="${updatedStyleContent}"`
	})
}

function processJsPaths(content, fileDir, basePath, project, taskType) {
	return content.replace(
		/(window\.location\.href|location)=['"](.*?)['"]/g,
		(match, attr, relativePath) => {
			if (shouldExcludePath(relativePath)) return match

			if (taskType === 'websites') {
				relativePath = relativePath.replace(/\.php$/, '.html')
			}

			let absolutePath
			if (relativePath === './' || relativePath === '.') {
				absolutePath = path.join(fileDir, 'index.html')
			} else {
				absolutePath = path.resolve(fileDir, relativePath)
			}

			const relativeToRoot = path.relative(project, absolutePath)
			return `${attr}="${basePath}/${relativeToRoot}"`
		}
	)
}

export function replaceToAbsolutePath(project, basePath, taskType) {
	logger.log(`\n👉 Меняю пути на абсолютные...`)

	const files = walkSync(project)

	files.forEach(file => {
		if (
			file.endsWith('.html') ||
			file.endsWith('.php') ||
			file.endsWith('.css') ||
			file.endsWith('.js')
		) {
			let content = fs.readFileSync(file, 'utf-8')
			const fileDir = path.dirname(file)

			content = processAttributes(content, fileDir, basePath, project, taskType)
			content = processSrcset(content, fileDir, basePath, project, taskType)
			content = processCssUrls(content, fileDir, basePath, project, taskType)
			content = processInlineStyles(
				content,
				fileDir,
				basePath,
				project,
				taskType
			)
			content = processJsPaths(content, fileDir, basePath, project, taskType)

			fs.writeFileSync(file, content, 'utf-8')
			logger.log(`✅ ${path.basename(file)} успешно обработан.`)
		}
	})
}
