import { Router } from 'express';
import { emergencyContactController } from './emergencyContact.controller';
import auth from '@app/middleware/auth';
import { USER_ROLE } from '../users/user.constants';
import multer, { memoryStorage } from 'multer';
import parseData from '@app/middleware/parseData';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  auth(USER_ROLE.user),
  upload.single('profile'),
  parseData(),
  emergencyContactController.createEmergencyContact,
);
router.patch(
  '/:id',
  auth(USER_ROLE.user),
  upload.single('profile'),
  parseData(),
  emergencyContactController.updateEmergencyContact,
);
router.delete(
  '/:id',
  auth(USER_ROLE.user),
  emergencyContactController.deleteEmergencyContact,
);
router.get(
  '/my-contact',
  auth(USER_ROLE.user),
  emergencyContactController.getMyEmergencyContact,
);

router.get(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  emergencyContactController.getEmergencyContactById,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  emergencyContactController.getAllEmergencyContact,
);

export const emergencyContactRoutes = router;
