document.addEventListener("DOMContentLoaded", () => {
  let projects = [];

  const consoleField = document.getElementById("console-output");
  const selectFolderBtn = document.getElementById("select-folder");
  const startSetupBtn = document.getElementById("start-setup");

  if (!window.isSubscribed) {
    window.api.subscribeToLogs((message) => {
      if (consoleField) {
        consoleField.value += `${message}\n`;
        consoleField.scrollTop = consoleField.scrollHeight;
      }
    });

    window.isSubscribed = true;
  }

  selectFolderBtn.addEventListener("click", async () => {
    projects = await window.api.openFolders();
  });

  startSetupBtn.addEventListener("click", () => {
    const taskType = document.getElementById("task-type").value;
    const teamNumber = document.getElementById("team-number").value;

    if (projects.length > 0 && taskType && teamNumber) {
      window.api.startSetup({
        projects,
        taskType,
        teamNumber,
      });
    } else {
      window.api.subscribeToLogs(
        "Please ensure that folders, task type, and team number are provided."
      );
    }
  });

  window.api.onUpdateAvailable(() => {
    const userConfirmed = confirm(
      "Доступно новое обновление. Установить сейчас?"
    );
    if (userConfirmed) {
      window.api.installUpdate();
    }
  });
});
