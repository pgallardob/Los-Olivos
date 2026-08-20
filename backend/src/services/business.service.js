import { readJsonFile } from '../utils/json-storage.js';
import { join } from 'path';
import { config } from '../config/config.js';

const NEGOCIO_PATH = join(config.paths.data, 'negocio.json');

let cached = null;

export function getBusinessInfo() {
  if (!cached) {
    cached = readJsonFile(NEGOCIO_PATH);
  }
  return cached;
}

export function reloadBusinessInfo() {
  cached = readJsonFile(NEGOCIO_PATH);
  return cached;
}
