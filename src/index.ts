'use strict';
import { GpioSocketServer } from './gpioServer.js';
import { GpioServerConfig } from './interfaces.js';
import { loadConfigFile } from './utilities.js';
import { createLogger, transports } from 'winston';
const serverConfig: GpioServerConfig = loadConfigFile();
const logger = createLogger({
  transports: [new transports.Console()],
});

(async () => {
  const server = new GpioSocketServer(serverConfig, logger);

  ['SIGINT', 'SIGQUIT', 'SIGTERM'].forEach((sig) =>
    process.on(sig, () => {
      server.shutdown();
      process.exit();
    })
  );

  console.log(`GPIO WebSocket server listening on ${server.addressString}`);
})();
