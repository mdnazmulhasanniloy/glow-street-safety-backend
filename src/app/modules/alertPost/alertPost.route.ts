import { Router } from 'express';
import { alertPostController } from './alertPost.controller';
import validateRequest from '@app/middleware/validateRequest';
import alertValidator from './alertPost.utils';
import auth from '@app/middleware/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '@app/middleware/parseData';
import { USER_ROLE } from '../users/user.constants';

const router = Router();
const storage = memoryStorage();
const uploads = multer({ storage });

router.post(
  '/',
  auth(USER_ROLE.user),
  uploads.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  validateRequest(alertValidator.createAlertSchema),
  alertPostController.createAlertPost,
);


router.patch(
  '/:id',
  auth(USER_ROLE.user),
  uploads.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  validateRequest(alertValidator.updateAlertSchema),
  alertPostController.updateAlertPost,
);
router.delete('/:id', alertPostController.deleteAlertPost);
router.get('/my-posts', auth(USER_ROLE.user), alertPostController.getMyPosts);
router.get('/:id', alertPostController.getAlertPostById);
router.get('/', alertPostController.getAllAlertPost);

export const alertPostRoutes = router;
