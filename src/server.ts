import app from './app';
import config from './app/config';
import http from 'http';
import { initializeSocket } from './socket';

process.on('uncaughtException', (error) => {
  console.log(
    'Uncaught Exception! Shutting down the server due to uncaught exception...',
    error,
  );
  process.exit(1);
});

let server = http.createServer(app);

initializeSocket(server);

async function startServer() {
  server = app.listen(config.port, () => {
    console.log(`🎯 Server listening on port: ${config.port}`);
  });

  process.on('unhandledRejection', (error) => {
    if (server) {
      server.close(() => {
        console.log(
          'Unhandled Rejection! Shutting down the server due to unhandled rejection...',
          error,
        );
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

startServer();

process.on('SIGTERM', () => {
  if (server) {
    server.close();
  }
});
