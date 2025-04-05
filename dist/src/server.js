"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
// process.on('uncaughtException', (error) => {
//   console.log(
//     'Uncaught Exception! Shutting down the server due to uncaught exception...',
//     error,
//   );
//   process.exit(1);
// });
const server = http_1.default.createServer(app_1.default);
// Initialize socket.io
(0, socket_1.initializeSocket)(server);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        server.listen(config_1.default.port, () => {
            console.log(`🎯 Server listening on port: ${config_1.default.port}`);
            console.log(`🔌 Socket.io server initialized`);
        });
        process.on('unhandledRejection', (error) => {
            if (server) {
                server.close(() => {
                    console.log('Unhandled Rejection! Shutting down the server due to unhandled rejection...', error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    });
}
startServer();
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received. Shutting down gracefully...');
//   if (server) {
//     server.close(() => {
//       console.log('Server closed');
//     });
//   }
// });
