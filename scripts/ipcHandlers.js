import { dialog, ipcMain } from "electron";
import path from "path";
import logger from "../utils/logger.js";
import { startSetup } from "./conversion.js";

let handlersSetup = false;

export function setupIpcHandlers(win) {
  if (handlersSetup) return;

  ipcMain.handle("dialog:openFolders", async () => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ["openDirectory", "multiSelections"],
      });

      const projects = result.filePaths.map((project) =>
        path.basename(project)
      );

      logger.log(
        `\nВыбрано проектов (${projects.length}):\n${projects
          .map((project, index) => `${index + 1}. ${project}`)
          .join("\n")}`
      );

      return result.filePaths || [];
    } catch (error) {
      logger.log(`Error opening folders: ${error.message}`);
      return [];
    }
  });

  ipcMain.on("start-setup", (event, params) => {
    startSetup(params, win);
  });

  ipcMain.on("log-message", (event, message) => {
    logger.log(message);
  });

  handlersSetup = true;
}
