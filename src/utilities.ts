'use strict';
import fs from 'fs';

export const cloneObject: <T>(obj: T) => T = (obj) => JSON.parse(JSON.stringify(obj));
export const loadObject: <T>(filename: string) => T = (filename: string) =>
  JSON.parse(fs.readFileSync(filename, 'utf-8'));
