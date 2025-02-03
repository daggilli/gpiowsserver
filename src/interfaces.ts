'use strict';
import { Direction, Edge } from 'onoff';

export interface ServerConfig {
  port: number;
  perMessageDeflate?: boolean;
}

export interface GpioServerConfig extends ServerConfig {
  pins?: PinConfig[];
}

export interface Pin {
  pinName: string;
}

export interface Pins {
  pinNames: string[];
}

export interface PinConfig {
  pinName: string;
  direction: Direction;
  edge?: Edge;
}

export interface PinState extends PinConfig {
  state?: boolean
}

export interface AckPayload {
  command: string;
  pinName: string;
  state?: boolean;
}

export interface Ack {
  messageType: string;
  data: AckPayload;
}
