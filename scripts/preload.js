const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openFolders: async () => {
    try {
      const folders = await ipcRenderer.invoke("dialog:openFolders");
      return folders;
    } catch (error) {
      ipcRenderer.send(
        "log-message",
        `Error opening folders: ${error.message}`
      );
      return [];
    }
  },
  startSetup: (params) => {
    ipcRenderer.send("start-setup", params);
  },
  onLinksGenerated: (callback) => {
    ipcRenderer.on("links-generated", (event, links) => callback(links));
  },
  subscribeToLogs: (callback) => {
    if (typeof callback !== "function") {
      console.error("subscribeToLogs callback is not a function");
      return;
    }
    ipcRenderer.send("subscribe-to-logs");
    ipcRenderer.on("log-message", (event, message) => {
      callback(message);
    });
  },
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update_available", () => {
      callback();
    });
  },
  installUpdate: () => {
    ipcRenderer.send("install-update");
  },
});
