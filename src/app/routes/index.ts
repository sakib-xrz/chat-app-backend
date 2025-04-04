import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
// import { UserRoutes } from '../modules/user/user.routes';

const router = express.Router();

type Route = {
  path: string;
  route: express.Router;
};

const routes: Route[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  //   {
  //     path: '/users',
  //     route: UserRoutes,
  //   },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
