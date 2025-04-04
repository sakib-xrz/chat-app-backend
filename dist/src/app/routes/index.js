"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { AuthRoutes } from '../modules/auth/auth.routes';
// import { UserRoutes } from '../modules/user/user.routes';
const router = express_1.default.Router();
const routes = [
//   {
//     path: '/auth',
//     route: AuthRoutes,
//   },
//   {
//     path: '/users',
//     route: UserRoutes,
//   },
];
routes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
