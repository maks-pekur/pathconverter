// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
	openFolders: () => ipcRenderer.invoke('dialog:openFolders'),
	startConversion: conversionParams =>
		ipcRenderer.send('start-conversion', conversionParams),
	onLinksGenerated: callback =>
		ipcRenderer.on('links-generated', (event, links) => callback(links)),
	onLogMessage: callback =>
		ipcRenderer.on('log-message', (event, message) => callback(message)),
})
