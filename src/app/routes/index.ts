import { otpRoutes } from '@app/modules/otp/otp.routes';
import { safeZoneRoutes } from '@app/modules/safezone/safezone.route';
import { userRoutes } from '@app/modules/users/users.routes';
import { Router } from 'express';

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
