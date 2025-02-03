'use strict';
import WebSocket from 'ws';

const message = {
  command: 'setState',
  params: {
    pinName: 'GPIO21',
    state: true,
  },
};

const ws = new WebSocket('ws://raspi8:9080');

ws.on('error', console.error);

ws.on('open', function open() {
  setInterval(() => {
    ws.send(JSON.stringify(message));
    message.params.state = !message.params.state;
  }, 20000);
});

ws.on('message', function message(data) {
  console.log('[client] received: %s', data);
});
