'use strict';
import { WebSocketServer } from 'ws';

export class AbstractTest {
  _val: string = '';
  _wss: WebSocketServer;

  constructor(val: string) {
    this._val = val;
    this._wss = new WebSocketServer({ port: 132 });
  }
}
