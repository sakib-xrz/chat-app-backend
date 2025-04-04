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

const server = http.createServer(app);

// Initialize socket.io
initializeSocket(server);

async function startServer() {
  server.listen(config.port, () => {
    console.log(`🎯 Server listening on port: ${config.port}`);
    console.log(`🔌 Socket.io server initialized`);
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
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
    });
  }
});
