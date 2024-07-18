const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { replacePaths } = require('./scripts/replacer')
const { renameToSnakeCase } = require('./utils/renameToSnakeCase')

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, './scripts/preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	})

	mainWindow.loadFile('index.html')
}

function logToRenderer(message) {
	if (mainWindow && mainWindow.webContents) {
		mainWindow.webContents.send('log-message', message)
	}
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

ipcMain.handle('dialog:openFolders', async () => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory', 'multiSelections'],
	})
	logToRenderer(`Selected folders: ${result.filePaths}`)
	return result.filePaths || []
})

ipcMain.on('start-conversion', (event, conversionParams) => {
	const { projectPaths, taskType, teamNumber } = conversionParams

	if (!projectPaths.length || !taskType || !teamNumber) {
		logToRenderer('Invalid conversion parameters.')
		return
	}

	logToRenderer(
		`Starting conversion with parameters: Project Paths: ${projectPaths}, Task Type: ${taskType}, Team Number: ${teamNumber}`
	)

	const links = []

	projectPaths.forEach(projectPath => {
		const renamedProjectPath = renameToSnakeCase(projectPath) // Переименование папки
		const projectName = path.basename(renamedProjectPath)
		const basePath = `/${taskType}/${teamNumber}/${projectName}`
		logToRenderer(`Starting conversion with base path: ${basePath}`)
		convertPaths(renamedProjectPath, basePath, taskType, links)
	})

	mainWindow.webContents.send('links-generated', links)
})

function walkSync(dir, fileList = []) {
	const files = fs.readdirSync(dir)

	files.forEach(file => {
		const filePath = path.join(dir, file)
		if (fs.statSync(filePath).isDirectory()) {
			fileList = walkSync(filePath, fileList)
		} else {
			fileList.push(filePath)
		}
	})

	return fileList
}

function convertPaths(projectPath, basePath, taskType, links) {
	logToRenderer(`Processing paths in project folder: ${projectPath}`)

	// Получаем список всех файлов
	const files = walkSync(projectPath)

	// Заменяем пути в файлах .html, .php и .css
	files.forEach(file => {
		if (
			file.endsWith('.html') ||
			file.endsWith('.php') ||
			file.endsWith('.css')
		) {
			logToRenderer(`Replacing paths in file: ${file}`)
			replacePaths(file, projectPath, basePath)
		}
	})

	// Формирование конечного URL
	const baseUrl = `https://umpaloompa.bio${basePath}`
	const finalUrl =
		taskType === 'websites' ? `${baseUrl}/index.html` : `${baseUrl}/`
	links.push(finalUrl)

	logToRenderer('Paths replaced successfully.')
}
