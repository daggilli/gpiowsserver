'use strict';
import net from 'net';
import { WebSocketServer, WebSocket, MessageEvent, AddressInfo } from 'ws';
import { ServerConfig } from './interfaces.js';
import { cloneObject } from './utilities.js';
import { IncomingMessage } from 'http';

export abstract class SocketServer {
  protected _wss: WebSocketServer;
  protected _socket: WebSocket | null = null;
  protected _config: ServerConfig;

  constructor(config: ServerConfig) {
    this._config = cloneObject(config);
    this._wss = new WebSocketServer(this._config);
    this._wss.on('connection', this.handleConnection.bind(this));
  }

  get address(): string | AddressInfo | null {
    return this._wss.address();
  }

  get addressString(): string {
    const serverAddress = this.address;
    if (!serverAddress) {
      let host = this._wss.options.host;
      const port = this._wss.options.port;
      if (host && net.isIPv6(host)) host = `[${host}]`;
      return `${host}${port ? `:${port}` : ''}`;
    }
    if (typeof serverAddress === 'string') return serverAddress;
    if (serverAddress.family === 'IPv4') return `${serverAddress.address}:${serverAddress.port}`;
    if (serverAddress.family === 'IPv6') return `[${serverAddress.address}]:${serverAddress.port}`;
    return '';
  }

  get port(): number {
    return this._config.port;
  }

  handleConnection(socket: WebSocket, _request?: IncomingMessage) {
    this._socket = socket;
    socket.on('message', this.handleMessage.bind(this, socket));
    socket.on('error', this.handleError.bind(this));
    socket.on('close', this.handleClose.bind(this));
  }

  abstract handleMessage(socket: WebSocket, data: MessageEvent): void;

  handleError(err: Error) {
    console.error(err);
  }

  handleClose(_code: number, _reason?: Buffer) {
    if (this._socket) {
      this._socket = null;
    }
  }
}
