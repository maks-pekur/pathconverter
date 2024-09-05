import path from "path";

import { TaskType } from "../constants/index.js";

import logger from "../utils/logger.js";

import { addCookie } from "../utils/add-cookie.js";
import { convertToHtml } from "../utils/convert-to-html.js";
import { generateLinks } from "../utils/generate-links.js";
import { renameToSnakeCase } from "../utils/rename-to-snake-case.js";
import { replaceToAbsolutePath } from "../utils/replace-to-absolute-path.js";

export function startSetup(params, win) {
  const { projects, taskType, teamNumber } = params;

  if (!projects.length || !taskType || !teamNumber) {
    logger.log("Invalid conversion parameters.");
    return;
  }

  const basePaths = [];

  projects.forEach((project) => {
    logger.log(`\nОбрабатываю ${path.basename(project)}...`);

    const name = renameToSnakeCase(project);

    const basePath = `/${taskType}/${teamNumber}/${path.basename(name)}`;
    basePaths.push(basePath);

    if (taskType === TaskType.WEBSITES) {
      convertToHtml(name);
      addCookie(name, basePath);
    }

    replaceToAbsolutePath(name, basePath, taskType);

    logger.log(`\n👌 ${path.basename(name)} успешно обработан!`);
  });

  logger.log(`\n👉 Генерирую ссылки...\n`);

  const links = generateLinks(basePaths, taskType);
  win.webContents.send("links-generated", links);

  logger.log("\n🎉 Обработка всех проектов завершена успешно!");
}
