import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { USER_ROLE } from '../users/user.constants';
import auth from '@app/middleware/auth';

const router = Router();

router.post('/', auth(USER_ROLE.user), paymentsController.checkout);
router.get('/confirm-payment', paymentsController.confirmPayment);

export const paymentsRoutes = router;
