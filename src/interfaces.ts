'use strict';
import { Direction, Edge } from 'onoff';

export interface TransportConfig {
  level: string;
}

export interface FileTransportConfig extends TransportConfig {
  logfilePath: string;
}

export interface LoggerConfig {
  useConsole?: TransportConfig;
  useFile?: FileTransportConfig;
}

export interface ServerConfig {
  host?: string;
  port: number;
  perMessageDeflate?: boolean;
}

export interface GpioServerConfig extends ServerConfig {
  pins?: PinConfig[];
  logger?: LoggerConfig;
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
