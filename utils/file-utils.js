import fs from "fs-extra";
import path from "path";

import logger from "./logger.js";

/**
 * Функция для безопасного получения статистики файла с установкой прав доступа.
 * Если возникла ошибка доступа, она сообщает об этом в лог.
 * @param {string} filePath - Путь к файлу
 * @returns {fs.Stats | null} - Статистика файла, если успешно
 */

function safeStatSync(filePath) {
  try {
    fs.chmodSync(filePath, 0o777);
    return fs.statSync(filePath);
  } catch (error) {
    if (error.code === "EACCES") {
      logger.log(
        `❌ Недостаточно прав для доступа к файлу: ${path.basename(filePath)}`
      );
    } else {
      throw error;
    }
    return null;
  }
}

/**
 * Функция для рекурсивного обхода директорий.
 * Возвращает массив путей всех файлов в директории.
 * @param {string} dir - Путь к директории
 * @returns {string[]} - Массив путей к файлам
 */
export function walkSync(dir) {
  let files = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = safeStatSync(fullPath);
    if (stat && stat.isDirectory()) {
      files = files.concat(walkSync(fullPath));
    } else if (stat) {
      files.push(fullPath);
    }
  });
  return files;
}
