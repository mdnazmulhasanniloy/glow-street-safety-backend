import { Router } from 'express';
import { userRoutes } from '../modules/users/users.routes';
import { otpRoutes } from '../modules/otp/otp.routes';
import { safeZoneRoutes } from 'app/modules/safezone/safezone.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/safezone',
    route: safeZoneRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
