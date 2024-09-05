import { app, BrowserWindow, ipcMain } from "electron";
import pkg from "electron-updater";
import path from "path";
import { fileURLToPath } from "url";
const { autoUpdater } = pkg;

import { setupIpcHandlers } from "./scripts/ipcHandlers.js";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "scripts/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
  setupIpcHandlers(win);
}

app
  .whenReady()
  .then(() => {
    if (!global.loggerInitialized) {
      logger.log("Привет 👋! Выбери тип таски и введи номер команды.");
      global.loggerInitialized = true;
    }
    createWindow();

    autoUpdater.checkForUpdatesAndNotify();
  })
  .catch((err) => {
    console.error("Failed to create window:", err);
  });

autoUpdater.on("update-downloaded", () => {
  win.webContents.send("update_available");
});

ipcMain.on("install-update", () => {
  autoUpdater.quitAndInstall();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
