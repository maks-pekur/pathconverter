import fs from 'fs-extra'
import path from 'path'

export function walkSync(dir, fileList = []) {
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
