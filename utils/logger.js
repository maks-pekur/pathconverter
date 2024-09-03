import { ipcMain } from 'electron'

class Logger {
	constructor() {
		this.subscribers = []
		this.logBuffer = []
	}

	log(message) {
		this.logBuffer.push(message)
		this.notifySubscribers(message)
	}

	subscribe(callback) {
		this.logBuffer.forEach(message => callback(message))
		this.subscribers.push(callback)
	}

	notifySubscribers(message) {
		this.subscribers.forEach(callback => callback(message))
	}
}

const logger = new Logger()

ipcMain.on('subscribe-to-logs', event => {
	logger.subscribe(message => {
		event.sender.send('log-message', message)
	})
})

export default logger
