'use strict';
import { DEFAULT_SERVER_CONFIG_PATH } from './constants.js';
import { ServerConfig } from './interfaces.js';
import { loadObject } from './utilities.js';

export const loadConfigFile = (configPath?: string): ServerConfig =>
  loadObject<ServerConfig>(
    configPath || process.env['SERVER_CONFIG_PATH'] || DEFAULT_SERVER_CONFIG_PATH
  );
