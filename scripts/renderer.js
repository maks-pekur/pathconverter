// renderer.js
let selectedFolders = []

document.getElementById('select-folder').addEventListener('click', async () => {
	selectedFolders = await window.api.openFolders()
	if (selectedFolders.length > 0) {
		logToConsole(`Selected folders: ${selectedFolders.join(', ')}`)
	} else {
		logToConsole('No folders selected or selection was cancelled.')
	}
})

document.getElementById('start-conversion').addEventListener('click', () => {
	const taskType = document.getElementById('task-type').value
	const teamNumber = document.getElementById('team-number').value

	if (selectedFolders.length > 0 && taskType && teamNumber) {
		logToConsole(
			`Conversion process started for Task Type: ${taskType}, Team Number: ${teamNumber}`
		)
		logToConsole(
			`Sending conversion params: Project Paths: ${selectedFolders.join(
				', '
			)}, Task Type: ${taskType}, Team Number: ${teamNumber}`
		)

		// Передаем корректные пути в основной процесс
		window.api.startConversion({
			projectPaths: selectedFolders,
			taskType,
			teamNumber,
		})
	} else {
		logToConsole(
			'Please ensure that folders, task type and team number are provided.'
		)
	}
})

// Получение ссылки и отображение в текстовом поле
window.api.onLinksGenerated(links => {
	const resultField = document.getElementById('result-links')
	resultField.value = links.join('\n')
	logToConsole('Links generation completed. Total links: ' + links.length)
})

window.api.onLogMessage(message => {
	logToConsole(message)
})

document.getElementById('copy-links').addEventListener('click', () => {
	const resultField = document.getElementById('result-links')
	resultField.select()
	document.execCommand('copy')
	logToConsole('Links copied to clipboard.')
})

function logToConsole(message) {
	const consoleField = document.getElementById('console-output')
	const timestamp = new Date().toLocaleString()
	consoleField.value += `[${timestamp}] ${message}\n`
	consoleField.scrollTop = consoleField.scrollHeight
}
