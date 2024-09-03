import { TaskType } from '../constants/index.js'
import logger from './logger.js'

export function generateLinks(paths, taskType) {
	const generatedLinks = paths.map((path, index) => {
		const baseUrl = `https://umpaloompa.bio${path}`
		const finalUrl =
			taskType === TaskType.WEBSITES ? `${baseUrl}/index.html` : `${baseUrl}`

		return finalUrl
	})

	const formattedMessage = generatedLinks
		.map((link, index) => `${index + 1}. ${link}`)
		.join('\n')
		
	logger.log(formattedMessage)

	return generatedLinks
}
