'use strict';
import fs from 'fs';
import { DEFAULT_SERVER_CONFIG_PATH } from './constants.js';
import { ServerConfig } from './interfaces.js';

export const cloneObject: <T>(obj: T) => T = (obj) => JSON.parse(JSON.stringify(obj));
export const loadObject: <T>(filename: string) => T = (filename: string) =>
  JSON.parse(fs.readFileSync(filename, 'utf-8'));
export const loadConfigFile = (configPath?: string): ServerConfig =>
  loadObject<ServerConfig>(configPath || DEFAULT_SERVER_CONFIG_PATH);
