import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse';
import moment from 'moment';

const checkout = catchAsync(async (req: Request, res: Response) => {
  req.body.userId = req?.user?.userId;
  const result = await paymentsService.checkout(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payments created successfully',
    data: result,
  });
});
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.confirmPayment(req?.query, res);
  res.render('paymentSuccess', {
    subscriptionDetails: {
      packageName: result?.package?.title,
      durationDay: result?.package?.durationDay,
      startDate: moment(result.createdAt).format('YYYY-MM-DD'),
      expiredAt: moment(result.subscription.expiredAt).format('YYYY-MM-DD'),
      amount: result.price,
      transactionId: result.trnId,
      receipt_url: result.receipt_url,
    },
  });
});

export const paymentsController = {
  checkout,
  confirmPayment,
};
