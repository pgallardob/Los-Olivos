import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function readJsonFile(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[json-storage] Error leyendo ${filePath}: ${error.message}`);
    return null;
  }
}

export function writeJsonFileSafe(filePath, data) {
  const tmpPath = filePath + '.tmp';

  try {
    ensureDir(dirname(filePath));

    // 1. Escribir a archivo temporal
    writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');

    // 2. Validar que el temporal es JSON válido
    const raw = readFileSync(tmpPath, 'utf-8');
    JSON.parse(raw);

    // 3. Reemplazar el archivo original (rename atómico)
    renameSync(tmpPath, filePath);

    return true;
  } catch (error) {
    console.error(`[json-storage] Error escribiendo ${filePath}: ${error.message}`);
    // Si algo falló, el temporal puede quedar. No tocamos el original.
    return false;
  }
}
