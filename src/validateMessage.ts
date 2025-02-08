'use strict';
import { Message } from './interfaces.js';

type Needs = [string, string[]];

// overkill for now but extensible
const COMMANDS = [
  'setState',
  'toggleState',
  'readState',
  'readDirection',
  'registerPin',
  'getRegisteredPins',
];
const NEEDS_STATE: Needs = ['state', ['setState']];
const NEEDS_DIRECTION: Needs = ['direction', ['registerPin']];
const NEEDS = [NEEDS_STATE, NEEDS_DIRECTION];

export const validateMessage = (message: Message): boolean => {
  if (!Object.hasOwn(message, 'command') || !message.command.length) return false;

  const { command } = message;

  if (!COMMANDS.includes(command)) return false;

  if (!Object.hasOwn(message, 'params')) {
    return command === 'getRegisteredPins';
  }

  const { params } = message;

  if (!Object.hasOwn(params!, 'pinName')) return false;

  for (const needs of NEEDS) {
    if (needs[1].includes(command) && !Object.hasOwn(params!, needs[0])) {
      return false;
    }
  }

  return true;
};
