'use strict';
import 'dotenv/config';
import { GpioSocketServer } from './gpioServer.js';
import { GpioServerConfig } from './interfaces.js';
import { loadConfigFile } from './configLoader.js';
const serverConfig: GpioServerConfig = loadConfigFile();

(async () => {
  const server = new GpioSocketServer(serverConfig);

  ['SIGINT', 'SIGQUIT', 'SIGTERM'].forEach((sig) =>
    process.on(sig, () => {
      server.shutdown();
      process.exit();
    })
  );

  server.logger?.log({
    level: 'info',
    message: `GPIO WebSocket server listening on ${server.addressString}`,
  });
})();
