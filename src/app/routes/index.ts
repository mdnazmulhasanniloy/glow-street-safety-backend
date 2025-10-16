import { alertPostRoutes } from '@app/modules/alertPost/alertPost.route';
import { authRoutes } from '@app/modules/auth/auth.route';
import { emergencyContactRoutes } from '@app/modules/emergencyContact/emergencyContact.route';
import { otpRoutes } from '@app/modules/otp/otp.routes';
import { packageRoutes } from '@app/modules/package/package.route';
import { paymentsRoutes } from '@app/modules/payments/payments.route';
import { safeZoneRoutes } from '@app/modules/safezone/safezone.route';
import { subscriptionRoutes } from '@app/modules/subscription/subscription.route';
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
    path: '/auth',
    route: authRoutes,
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
  {
    path: '/subscription',
    route: subscriptionRoutes,
  },
  {
    path: '/payments',
    route: paymentsRoutes,
  },
  {
    path: '/alert-post',
    route: alertPostRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
