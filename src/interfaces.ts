'use strict';
import { Direction, Edge } from 'onoff';
import { Logger } from 'winston';
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
  state?: boolean;
}

export interface Params {
  pinName: string;
  state?: boolean;
  direction?: Direction;
  edge?: Edge;
}

export interface Message {
  command: string;
  params?: Params;
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
