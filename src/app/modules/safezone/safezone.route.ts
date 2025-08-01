import { Router } from 'express';
import auth from '../../middleware/auth';
import { safeZoneController } from './safezone.controller';
import { USER_ROLE } from '../users/user.constants';
import validateRequest from 'app/middleware/validateRequest';
import { safeZoneValidator } from './safezone.validator';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(safeZoneValidator.createSchema),
  safeZoneController.createSafezone,
);

router.patch(
  '/:id',
  auth(USER_ROLE.user),
  validateRequest(safeZoneValidator.updateSchema),
  safeZoneController.updateSafezone,
);

router.delete(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  safeZoneController.deleteSafezone,
);

router.get('/:id', safeZoneController.getByIdSafezone);

router.get(
  '/',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  safeZoneController.getMySafezone,
);

export const safeZoneRoutes = router;
