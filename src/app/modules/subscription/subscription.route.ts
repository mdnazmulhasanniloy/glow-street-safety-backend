import { Router } from 'express';
import { subscriptionController } from './subscription.controller';
import auth from '@app/middleware/auth';
import { USER_ROLE } from '../users/user.constants';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  subscriptionController.createSubscription,
);
router.patch(
  '/:id',
  auth(USER_ROLE.user),
  subscriptionController.updateSubscription,
);
router.delete(
  '/:id',
  auth(USER_ROLE.user),
  subscriptionController.deleteSubscription,
);
router.get(
  '/:id',
  auth(USER_ROLE.user),
  subscriptionController.getSubscriptionById,
);
router.get(
  '/',
  auth(USER_ROLE.user),
  subscriptionController.getAllSubscription,
);

export const subscriptionRoutes = router;
