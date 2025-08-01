import { Server } from 'http';
import app from './app';
import config from './app/config'; 
import { exec } from 'child_process';
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
const colors = require('colors');
let server: Server;
let currentPort: number = Number(config.port) | 5000;
let portCount = 0;

async function main() {
  server = app.listen(Number(currentPort), config?.ip as string, () => {
    console.log(
      //@ts-ignore
      '✨ Simple Server Listening on \n'.italic.brightGreen +
        //@ts-ignore
        `💫 http://${config?.ip}:${currentPort}`.bold.brightBlue,
    );

    // urlLauncher(`http://${config?.ip}:${currentPort}`);

    // urlLauncher(`http://${config?.ip}:${currentPort}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(
        //@ts-ignore
        `⚠️  Port ${currentPort} is in use. Trying next port...`.yellow,
      );
      if (portCount < 10) {
        currentPort++;
        portCount++;
        main(); // retry with next port
      } else {
        //@ts-ignore
        console.error('❌ Max retries reached. Could not start server.'.red);
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
}
const urlLauncher = (url: string) => {
  const platform = process.platform;

  let command = '';
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else { 
    command = `xdg-open ${url}`;
  }

  exec(command, err => {
    if (err) {
      console.error('🚫 Failed to open browser automatically:', err);
    }
  });
};

main();

process.on('unhandledRejection', err => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
