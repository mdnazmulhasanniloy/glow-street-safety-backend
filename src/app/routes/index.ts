import { emergencyContactRoutes } from '@app/modules/emergencyContact/emergencyContact.route';
import { otpRoutes } from '@app/modules/otp/otp.routes';
import { packageRoutes } from '@app/modules/package/package.route';
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
  {
    path: '/emergency-contacts',
    route: emergencyContactRoutes,
  },
  {
    path: '/packages',
    route: packageRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
