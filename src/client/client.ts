'use strict';
import WebSocket from 'ws';

const readMessage = {
  command: 'readState',
  params: {
    pinName: 'GPIO17',
  },
};

const writeMessage = {
  command: 'setState',
  params: {
    pinName: 'GPIO21',
    state: true,
  },
};
const ws = new WebSocket('ws://raspi8:9080');

ws.on('error', console.error);

ws.on('open', function open() {
  ws.send(JSON.stringify(readMessage));
});

let waiting = true;
ws.on('message', function message(data) {
  console.log('[client] received: %s', data);
  if (waiting) {
    ws.send(JSON.stringify(writeMessage));
    waiting = false;
  }
});
