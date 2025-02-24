'use strict';
import { MessageEvent, WebSocket } from 'ws';
import { Ack, GpioArgs, GpioServerConfig, Message, PinConfig, PinState } from './interfaces.js';
import { SocketServer } from './server.js';
import { Gpio, BinaryValue, Direction, Edge } from 'onoff';
import { v4 as uuidv4 } from 'uuid';
import { PinMapper } from './pinMapper.js';
import { validateMessage } from './validateMessage.js';
import { Logger } from 'winston';
import { makeLogger } from './makeLogger.js';
import { IncomingMessage } from 'http';
import { cloneObject } from './utilities.js';

const boolToBin = (val: boolean): BinaryValue => (val ? 1 : 0);
const binToBool = (val: BinaryValue): boolean => val === 1;
const invertValue = (val: BinaryValue): BinaryValue => (val === 0 ? 1 : 0);

const malformedMessageError = (messageId?: string | undefined) =>
  JSON.stringify({
    messageType: 'error',
    messageId,
    data: {
      errorString: 'request message was malformed',
    },
  });

const pinNotRegisteredError = (pinName: string, messageId?: string | undefined) =>
  JSON.stringify({
    messageType: 'error',
    messageId,
    data: {
      errorString: `pin ${pinName} is not registered`,
    },
  });

const ack = (pinName: string, command: string, messageId?: string | undefined): Ack => ({
  messageType: 'ack',
  messageId,
  data: {
    command,
    pinName,
  },
});

const ackReply = (ackObj: Ack) => JSON.stringify(ackObj);

export class GpioSocketServer extends SocketServer {
  private _mapper: PinMapper;
  private _pins: Map<string, Gpio>;
  private _logger: Logger | undefined;

  constructor(config: GpioServerConfig) {
    const { host, port, perMessageDeflate } = config;
    super({ host, port, perMessageDeflate });
    this._config = cloneObject(config);

    this._mapper = new PinMapper();
    this._pins = new Map();

    if (config.pins?.length) {
      this.registerPins(config.pins);
    }
    if (config.logger) this._logger = makeLogger(config.logger);
  }

  handleConnection(socket: WebSocket, request?: IncomingMessage) {
    super.handleConnection(socket, request);
    this._logger?.log({
      level: 'info',
      message: `Incoming connection from ${request?.socket.remoteAddress}:${request?.socket.remotePort}`,
    });
  }

  get logger(): Logger | undefined {
    return this._logger;
  }

  #send(response: string) {
    this._logger?.log({
      level: 'info',
      message: `Sending response ${response}`,
    });

    this._socket?.send(response);
  }

  // -------------------------------------------------
  // --------------------- GPIO ----------------------
  // -------------------------------------------------

  registerPins(config: PinConfig[]) {
    for (const pin of config) {
      this.registerPin(pin);
    }
  }

  registerPin(config: PinConfig) {
    const pinNumber = this._mapper.pinNumber(config.pinName);
    if (pinNumber) {
      const args: GpioArgs[] = [pinNumber, config.direction, config.edge || undefined];
      if (
        Object.hasOwn(config, 'debounceTimeout') &&
        Number.isInteger(config.debounceTimeout) &&
        config.direction === 'in'
      ) {
        args.push({ debounceTimeout: config.debounceTimeout! });
      }
      const pin = Reflect.construct(Gpio, args);
      if (config.direction === 'in' && config.edge) {
        pin.watch(this.interruptHandler.bind(this, config.pinName));
      }
      this._pins.set(config.pinName, pin);
    }
  }

  unregisterPin(pinName: string) {
    const pin = this.getPin(pinName);
    if (pin) {
      if (pin.direction() === 'out') {
        pin.writeSync(0);
      }
      pin.unexport();
      this._pins.delete(pinName);
    }
  }

  pinIsRegistered(pinName: string): boolean {
    return this._pins.has(pinName);
  }

  unregisterPins(pinNames: string[]) {
    for (const pinName of pinNames) {
      this.unregisterPin(pinName);
    }
  }

  getPin(pinName: string): Gpio | undefined {
    return this._pins.get(pinName);
  }

  getPinDirection(pinName: string): Direction | undefined {
    const pin = this.getPin(pinName);
    if (!pin) return undefined;

    return pin.direction();
  }

  getPinEdge(pinName: string): Edge | undefined {
    const pin = this.getPin(pinName);
    if (!pin) return undefined;

    return pin.direction() == 'in' ? pin.edge() : undefined;
  }

  getPinState(pinName: string): boolean | undefined {
    let state;
    const pin = this.getPin(pinName);
    if (pin) {
      state = binToBool(pin.readSync());
    }
    return state;
  }

  setPinState(pinName: string, state: boolean): boolean | undefined {
    const pin = this.getPin(pinName);
    if (!pin) return undefined;

    if (pin) {
      pin.writeSync(boolToBin(state));
      return state;
    }
  }

  togglePinState(pinName: string): boolean | undefined {
    const pin = this.getPin(pinName);
    if (!pin) return undefined;

    const curState = pin.readSync();
    if (curState !== undefined) {
      pin.writeSync(invertValue(curState));
      return !binToBool(curState);
    }
  }

  getRegisteredPins(): PinState[] {
    const registeredPins: PinConfig[] = [];
    for (const [pinName, pin] of this._pins) {
      const direction = pin.direction();
      const config: PinState = {
        pinName,
        direction,
        edge: direction === 'in' ? pin.edge() : undefined,
        state: binToBool(pin.readSync()),
      };
      registeredPins.push(config);
    }
    return registeredPins;
  }

  shutdown() {
    for (const pin of [...this._pins.values()]) {
      if (pin.direction() === 'out') {
        pin.writeSync(0);
      }
      pin.unexport();
    }
  }

  private interruptHandler(
    pinName: string,
    err: Error | null | undefined,
    edge: BinaryValue
  ): void {
    let messageId: string | undefined;
    const cfg = this._config as GpioServerConfig;
    if (cfg.generateId) {
      messageId = uuidv4();
    }
    const response = JSON.stringify({
      messageType: 'stateChange',
      messageId,
      data: {
        pinName,
        edge: edge ? 'rising' : 'falling',
      },
    });

    this.#send(response);
  }

  // -------------------------------------------------
  // ------------------- END GPIO --------------------
  // -------------------------------------------------

  // -------------------------------------------------
  // ------------------- WEBSOCKET -------------------
  // -------------------------------------------------

  handleMessage(socket: WebSocket, data: MessageEvent | string): void {
    let messageStr = '';
    let reply = '';
    if (data instanceof Buffer) {
      messageStr = data.toString();
    }
    if (typeof data === 'string') {
      messageStr = data;
    }
    const message: Message = JSON.parse(messageStr);

    const { messageId } = message;
    if (!validateMessage(message)) {
      this.#send(malformedMessageError(messageId));
      return;
    }

    this._logger?.log({
      level: 'info',
      message: `Received command ${data}`,
    });

    let pinName: string = '';
    let state: boolean = false;

    const { command, params } = message;
    if (params) {
      pinName = params.pinName;
      state = params.state ?? false;
    }

    if (pinName && pinName.length && !this.pinIsRegistered(pinName)) {
      if (command !== 'registerPin') {
        this.#send(pinNotRegisteredError(pinName, messageId));
        return;
      }
    }

    switch (command) {
      case 'setState': {
        this.setPinState(pinName, state);
        reply = ackReply(ack(pinName, command, messageId));
        break;
      }

      case 'toggleState': {
        const newState = this.togglePinState(pinName);
        const toggleAck = ack(pinName, command, messageId);
        toggleAck.data.state = newState;
        reply = ackReply(toggleAck);
        break;
      }

      case 'readState': {
        const state = this.getPinState(pinName);
        reply = JSON.stringify({
          messageType: 'state',
          messageId,
          data: {
            pinName,
            state,
          },
        });
        break;
      }

      case 'readDirection': {
        const direction = this.getPinDirection(pinName);
        reply = JSON.stringify({
          messageType: 'direction',
          messageId,
          data: {
            pinName,
            direction,
          },
        });
        break;
      }

      case 'registerPin': {
        this.registerPin(params as PinConfig);
        reply = ackReply(ack(pinName, command, messageId));
        break;
      }

      case 'getRegisteredPins': {
        const registeredPins = this.getRegisteredPins();
        reply = JSON.stringify({
          messageType: 'registeredPins',
          messageId,
          data: registeredPins,
        });
        break;
      }

      default: {
        reply = malformedMessageError(messageId);
        break;
      }
    }

    this.#send(reply);
  }
}

export default GpioSocketServer;
