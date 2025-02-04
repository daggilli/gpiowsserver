import { MessageEvent, WebSocket } from 'ws';
import { Ack, GpioServerConfig, PinConfig, PinState } from './interfaces.js';
import { SocketServer } from './server.js';
import { Gpio, BinaryValue, Direction, Edge } from 'onoff';
import { PinMapper } from './pinMapper.js';

const boolToBin = (val: boolean): BinaryValue => val ? 1 : 0;
const binToBool = (val: BinaryValue): boolean => val === 1;
const invertValue = (val: BinaryValue): BinaryValue => val === 0 ? 1 : 0;

const malformedMessageError = JSON.stringify(
  {
    messageType: 'error',
    data: {
      errorString: 'request message was malformed',
    }
  }
);

const ack = (pinName: string, command: string): Ack => ({
  messageType: 'ack',
  data: {
    command,
    pinName,
  },
});

const ackReply = (ackObj: Ack) => JSON.stringify(ackObj);

export class GpioSocketServer extends SocketServer {
  private _mapper: PinMapper;
  private _pins: Map<string, Gpio>;

  constructor(config: GpioServerConfig) {
    super(config);
    this._mapper = new PinMapper();
    this._pins = new Map();

    if (config.pins?.length) {
      this.registerPins(config.pins);
    }
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
      const pin = new Gpio(pinNumber, config.direction, config.edge || undefined);
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

  private interruptHandler(pinName: string, err: Error | null | undefined, edge: BinaryValue): void {
    const response = JSON.stringify({
      messageType: 'stateChange',
      data: {
        pinName,
        edge: edge ? 'rising' : 'falling',
      },
    });
    this._socket?.send(response);
    console.log(response);
  }

  // -------------------------------------------------
  // ------------------- END GPIO --------------------
  // -------------------------------------------------

  // -------------------------------------------------
  // ------------------- WEBSOCKET -------------------
  // -------------------------------------------------

  handleMessage(socket: WebSocket, data: MessageEvent): void {
    let messageStr = '';
    let reply = '';
    if (data instanceof Buffer) {
      messageStr = data.toString();
    }
    if (typeof data === 'string') {
      messageStr = data;
    }
    const message = JSON.parse(messageStr);

    if (!Object.hasOwn(message, 'command') || !message.command.length) {
      socket.send(malformedMessageError);
      return;
    }

    if (!Object.hasOwn(message, 'params')) message.params = {};

    console.log(`[server] received command ${data} ${messageStr} ${message.command}`);

    const { command, params } = message;
    const { pinName } = params;

    switch (command) {
      case 'setState': {
        this.setPinState(pinName, params.state);
        reply = ackReply(ack(pinName, command));
        break;
      }

      case 'toggleState': {
        const newState = this.togglePinState(pinName);
        const toggleAck = ack(pinName, command);
        toggleAck.data.state = newState;
        reply = ackReply(toggleAck);
        break;
      }

      case 'readState': {
        const state = this.getPinState(pinName);
        reply = JSON.stringify({
          messageType: 'state',
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
          data: {
            pinName,
            direction,
          },
        });
        break;
      }

      case 'registerPin': {
        this.registerPin(message.params);
        reply = ackReply(ack(pinName, command));
        break;
      }

      case 'getRegisteredPins': {
        const registeredPins = this.getRegisteredPins();
        reply = JSON.stringify({
          messageType: 'registeredPins',
          data: registeredPins,
        });
        break;
      }

      default: {
        reply = malformedMessageError;
        break;
      }
    }

    socket.send(reply);
  }

  sendMessage(data: string | Buffer): void {
    if (this._socket) {
      this._socket.send(data);
    }
  }
}

export default GpioSocketServer;
