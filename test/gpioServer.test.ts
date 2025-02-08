'use strict';
import { WebSocket } from 'ws';
import { GpioSocketServer } from '../src/gpioServer.js';
import {
  SERVER_CONFIG,
  GET_REG_PINS_EXPECTED_SEND,
  GET_REG_PINS_COMMAND,
  SET_PIN_STATE_COMMAND,
  SET_PIN_STATE_EXPECTED_SEND,
  OUTPUT_PIN,
  MALFORMED_COMMAND,
  MALFORMED_COMMAND_EXPECTED_SEND,
  TOGGLE_PIN_STATE_COMMAND,
  TOGGLE_PIN_STATE_EXPECTED_SEND,
  GET_PIN_STATE_COMMAND,
  GET_PIN_STATE_EXPECTED_SEND,
  GET_PIN_DIRECTION_COMMAND,
  GET_PIN_DIRECTION_EXPECTED_SEND,
  REGISTER_PIN_COMMAND,
  REGISTER_PIN_EXPECTED_SEND,
  MALFORMED_COMMAND_NO_PINNAME,
  MALFORMED_COMMAND_NO_STATE,
  MALFORMED_COMMAND_NO_DIRECTION,
  MALFORMED_COMMAND_UNKNOWN,
  MALFORMED_COMMAND_UNREGISTERED_PIN,
  MALFORMED_COMMAND_UNREGISTERED_PIN_EXPECTED_SEND,
} from './testConstants.js';
import { CallbackFunction } from './testInterfaces.js';

jest.mock('ws', () => ({
  WebSocketServer: jest.fn().mockImplementation(() => {
    return {
      on: (_event: string, _cb: CallbackFunction) => {},
    };
  }),
  WebSocket: jest.fn().mockImplementation(() => {
    return {
      send: (_message: string) => {},
    };
  }),
}));

class MockGpio {
  _direction: string;
  _edge: string | undefined;
  constructor(direction: string, edge?: string) {
    this._direction = direction;
    this._edge = edge;
  }
  direction(): string {
    return this._direction;
  }
  edge(): string | undefined {
    return this._edge;
  }
  watch() {}
  readSync() {
    return 1;
  }
  writeSync(_s: number) {}
}

jest.mock('onoff', () => ({
  Gpio: jest.fn().mockImplementation((pinno: number, direction: string, edge: string) => {
    return new MockGpio(direction, edge);
  }),
}));

jest.mock('../src/pinMapper.js', () => ({
  PinMapper: jest.fn().mockImplementation(() => {
    return {
      pinNumber: (_pinName: string) => Number(_pinName.slice(4)),
    };
  }),
}));

describe('GpioSocketServer', () => {
  let server: GpioSocketServer;
  let mockSocket: WebSocket;
  let sendSpy: jest.SpyInstance;

  beforeAll(() => {
    server = new GpioSocketServer(SERVER_CONFIG);
    mockSocket = new WebSocket(null);
    sendSpy = jest.spyOn(mockSocket, 'send');
  });

  beforeEach(() => {
    sendSpy.mockClear();
  });

  it('should create a GpioSocketServer', () => {
    expect(server).not.toBeNull();
    expect(server._config).not.toBeNull();
    expect(server._wss).not.toBeNull();
    expect(server._socket).toBeNull();
    expect(server._config).toStrictEqual(SERVER_CONFIG);
  });

  it('should reject a malformed message: no command field', () => {
    server.handleMessage(mockSocket, JSON.stringify(MALFORMED_COMMAND));
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(MALFORMED_COMMAND_EXPECTED_SEND);
  });

  it('should reject a malformed message: unrecognised command', () => {
    server.handleMessage(mockSocket, JSON.stringify(MALFORMED_COMMAND_UNKNOWN));
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(MALFORMED_COMMAND_EXPECTED_SEND);
  });

  it('should reject a malformed message: no params.pinName field', () => {
    server.handleMessage(mockSocket, JSON.stringify(MALFORMED_COMMAND_NO_PINNAME));
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(MALFORMED_COMMAND_EXPECTED_SEND);
  });

  it('should reject a malformed message: unregistered pin', () => {
    server.handleMessage(mockSocket, JSON.stringify(MALFORMED_COMMAND_UNREGISTERED_PIN));
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(MALFORMED_COMMAND_UNREGISTERED_PIN_EXPECTED_SEND);
  });

  it('should handle a setState message', () => {
    const setPinStateSpy = jest.spyOn(server, 'setPinState');
    server.handleMessage(mockSocket, JSON.stringify(SET_PIN_STATE_COMMAND));
    expect(setPinStateSpy).toHaveBeenCalledTimes(1);
    expect(setPinStateSpy).toHaveBeenCalledWith(OUTPUT_PIN, true);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(SET_PIN_STATE_EXPECTED_SEND);
  });

  it('should reject a malformed message: setState with no params.pinName field', () => {
    server.handleMessage(mockSocket, JSON.stringify(MALFORMED_COMMAND_NO_STATE));
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(MALFORMED_COMMAND_EXPECTED_SEND);
  });

  it('should handle a toggleState message', () => {
    const togglePinStateSpy = jest.spyOn(server, 'togglePinState');

    server.handleMessage(mockSocket, JSON.stringify(TOGGLE_PIN_STATE_COMMAND));
    expect(togglePinStateSpy).toHaveBeenCalledTimes(1);
    expect(togglePinStateSpy).toHaveBeenCalledWith(OUTPUT_PIN);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(TOGGLE_PIN_STATE_EXPECTED_SEND);
  });

  it('should handle a readState message', () => {
    const getPinStateSpy = jest.spyOn(server, 'getPinState');

    server.handleMessage(mockSocket, JSON.stringify(GET_PIN_STATE_COMMAND));
    expect(getPinStateSpy).toHaveBeenCalledTimes(1);
    expect(getPinStateSpy).toHaveBeenCalledWith(OUTPUT_PIN);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(GET_PIN_STATE_EXPECTED_SEND);
  });

  it('should handle a readDirection message', () => {
    const getPinDirectionSpy = jest.spyOn(server, 'getPinDirection');

    server.handleMessage(mockSocket, JSON.stringify(GET_PIN_DIRECTION_COMMAND));
    expect(getPinDirectionSpy).toHaveBeenCalledTimes(1);
    expect(getPinDirectionSpy).toHaveBeenCalledWith(OUTPUT_PIN);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(GET_PIN_DIRECTION_EXPECTED_SEND);
  });

  it('should handle a registerPin message', () => {
    const registerPinSpy = jest.spyOn(server, 'registerPin');

    server.handleMessage(mockSocket, JSON.stringify(REGISTER_PIN_COMMAND));
    expect(registerPinSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(REGISTER_PIN_EXPECTED_SEND);
  });

  it('should reject a malformed message: registerPin with no params.direction field', () => {
    server.handleMessage(mockSocket, JSON.stringify(MALFORMED_COMMAND_NO_DIRECTION));
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(MALFORMED_COMMAND_EXPECTED_SEND);
  });

  it('should handle a getRegisteredPins message', () => {
    const getRegisteredPinsSpy = jest.spyOn(server, 'getRegisteredPins');

    server.handleMessage(mockSocket, JSON.stringify(GET_REG_PINS_COMMAND));
    expect(getRegisteredPinsSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(GET_REG_PINS_EXPECTED_SEND);
  });
});
