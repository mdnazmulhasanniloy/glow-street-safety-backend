/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Prisma } from '@prisma/index';
import prisma from '@app/shared/prisma';
import StripeService from '@app/core/StripeService';
import config from '@app/config';
import moment from 'moment';
import { Response } from 'express';

const checkout = async (payload: Prisma.PaymentsCreateInput) => {
  let paymentData;
  let customerId: string;

  const subscription = await prisma.subscription.findFirst({
    //@ts-ignore
    where: { id: payload.subscriptionId },
    include: { package: true, user: true },
  });

  if (!subscription) {
    throw new AppError(httpStatus.BAD_REQUEST, 'subscription not found!');
  }

  const isPaymentExists = await prisma.payments.findFirst({
    where: {
      subscriptionId: subscription?.id,
      userId: subscription?.userId,
      isPaid: false,
      isDeleted: false,
    },
  });

  if (isPaymentExists) {
    paymentData = isPaymentExists;
  } else {
    // const createdPayment = await prisma.payments.create({
    //   data: {
    //     price: Number(subscription?.package?.price),
    //     subscriptionId: subscription?.id,
    //     userId: subscription?.userId,
    //   },
    // });
    const createdPayment = await prisma.payments.create({
      data: {
        price: subscription!.package.price,
        subscription: { connect: { id: subscription!.id } },
        user: { connect: { id: subscription!.userId } },
      },
    });
    if (!createdPayment) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create payment',
      );
    }

    paymentData = createdPayment;
  }
  if (!paymentData)
    throw new AppError(httpStatus.BAD_REQUEST, 'payment not found');
  if (subscription?.user.customerId) {
    customerId = subscription?.user.customerId;
  } else {
    const customer = await StripeService.createCustomer(
      subscription?.user?.email as string,
      subscription?.user?.name || 'Jon Do',
    );
    await prisma.user.update({
      where: { id: subscription?.userId },
      data: {
        customerId: customer?.id,
      },
    });

    customerId = customer?.id;
  }

  const success_url = `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${paymentData?.id}`;

  const cancel_url = `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${paymentData?.id}`;
  const product = {
    amount: paymentData?.price,

    name: subscription?.package?.title ?? 'Subscription Payments',
    quantity: 1,
  };

  const checkoutSession = await StripeService.getCheckoutSession(
    product,
    success_url,
    cancel_url,
    customerId,
  );
  return checkoutSession?.url;
};

export const confirmPayment = async (
  query: Record<string, any>,
  res: Response,
) => {
  const { sessionId, paymentId } = query;

  const result = await prisma.$transaction(async tx => {
    // 🔹 1. Retrieve Stripe session and PaymentIntent
    const PaymentSession = await StripeService.getPaymentSession(sessionId);
    const paymentIntentId = PaymentSession.payment_intent as string;

    const paymentIntent =
      await StripeService.getStripe().paymentIntents.retrieve(paymentIntentId);

    // 🔹 2. Ensure payment success
    const isPaymentSuccess = await StripeService.isPaymentSuccess(sessionId);
    if (!isPaymentSuccess) {
      throw res.render('paymentError', {
        message: 'Payment session is not completed',
      });
    }

    // 🔹 3. Find Payment
    const payment = await tx.payments.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        subscription: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    if (payment.isPaid) {
      throw res.render('paymentError', {
        message: 'This payment is already confirmed.',
      });
    }

    // 🔹 4. Retrieve charge info from Stripe
    const charge = await StripeService.getStripe().charges.retrieve(
      paymentIntent.latest_charge as string,
    );

    if (charge?.refunded) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment has been refunded');
    }

    const paymentDate = moment.unix(charge.created).format('YYYY-MM-DD HH:mm');

    const chargeDetails = {
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      paymentMethod: charge.payment_method,
      paymentMethodDetails: charge.payment_method_details?.card,
      transactionId: charge.balance_transaction,
      cardLast4: charge.payment_method_details?.card?.last4,
      paymentDate,
      receipt_url: charge.receipt_url,
    };

    // 🔹 5. Handle subscription expiration logic
    const oldSubscription = await tx.subscription.findFirst({
      where: {
        userId: payment.userId,
        isPaid: true,
        isActivate: true,
        isDeleted: false,
      },
    });

    let expiredAt = moment();

    if (
      oldSubscription?.expiredAt &&
      moment(oldSubscription.expiredAt).isAfter(moment())
    ) {
      expiredAt = moment(oldSubscription.expiredAt);
      console.log("🚀 ~ confirmPayment ~ expiredAt:", expiredAt)
    }

    if (payment?.subscription?.package?.durationDay) {
      expiredAt = expiredAt.add(
        payment.subscription.package.durationDay,
        'days',
      );
      console.log("🚀 ~ confirmPayment ~ expiredAt:", expiredAt)
    }

    // 🔹 6. Update Payment and Subscription
    const updatedPayment = await tx.payments.update({
      where: { id: paymentId },
      data: {
        isPaid: true,
        trnId: (chargeDetails.transactionId as string) ?? null,
        receipt_url: chargeDetails.receipt_url ?? null,
        updatedAt: new Date(),
        subscription: {
          update: {
            isPaid: true,
            isActivate: true,
            expiredAt: expiredAt.toDate(),
          },
        },
      },
      include: {
        subscription: {
          include: { package: true },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            profile: true,
          },
        },
      },
    });

    // 🔹 7. Deactivate old subscription if exists
    if (oldSubscription?.id) {
      await tx.subscription.update({
        where: { id: oldSubscription.id },
        data: { isActivate: false },
      });
    }

    // 🔹 8. Notifications (optional)
    /*
    const admin = await tx.user.findFirst({
      where: { role: 'admin' },
    });

    if (admin) {
      await notificationServices.insertNotificationIntoDb({
        receiver: admin.id,
        message: 'New Subscription Payment',
        description: `User ${updatedPayment.user.name} completed payment. Transaction ID: ${chargeDetails.transactionId}`,
        refference: updatedPayment.id,
        model_type: modeType.Payments,
      });
    }

    await notificationServices.insertNotificationIntoDb({
      receiver: updatedPayment.user.id,
      message: 'Payment Successful',
      description: `You have successfully activated your subscription.`,
      refference: updatedPayment.id,
      model_type: modeType.Payments,
    });
    */

    // 🔹 9. Return structured response
    return {
      ...updatedPayment,
      chargeDetails,
      package: payment.subscription.package,
    };
  });

  return result;
};

// export const confirmPayment = async (
//   query: Record<string, any>,
//   res: Response,
// ) => {
//   const { sessionId, paymentId } = query;

//   const session = await prisma.$transaction(async tx => {
//     // 🔹 1. Get Stripe session and intent
//     const PaymentSession = await StripeService.getPaymentSession(sessionId);
//     const paymentIntentId = PaymentSession.payment_intent as string;

//     const paymentIntent =
//       await StripeService.getStripe().paymentIntents.retrieve(paymentIntentId);

//     // 🔹 2. Check if payment success
//     const isPaymentSuccess = await StripeService.isPaymentSuccess(sessionId);
//     if (!isPaymentSuccess) {
//       throw res.render('paymentError', {
//         message: 'Payment session is not completed',
//       });
//     }

//     // 🔹 3. Find Payment from DB
//     const payment = await tx.payments.findUnique({
//       where: { id: paymentId },
//       include: {
//         user: true,
//         subscription: {
//           include: {
//             package: true,
//           },
//         },
//       },
//     });

//     if (!payment) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
//     }

//     if (payment.isPaid) {
//       throw res.render('paymentError', {
//         message: 'This payment is already confirmed.',
//       });
//     }

//     // 🔹 4. Retrieve charge from Stripe
//     const charge = await StripeService.getStripe().charges.retrieve(
//       paymentIntent.latest_charge as string,
//     );

//     if (charge?.refunded) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Payment has been refunded');
//     }

//     const paymentDate = moment.unix(charge.created).format('YYYY-MM-DD HH:mm');

//     const chargeDetails = {
//       amount: charge.amount,
//       currency: charge.currency,
//       status: charge.status,
//       paymentMethod: charge.payment_method,
//       paymentMethodDetails: charge.payment_method_details?.card,
//       transactionId: charge.balance_transaction,
//       cardLast4: charge.payment_method_details?.card?.last4,
//       paymentDate,
//       receipt_url: charge.receipt_url,
//     };

//     const oldSubscription = await tx.subscription.findFirst({
//       where: {
//         user: payment?.user,
//         isPaid: true,
//         isActivate: true,
//         isDeleted: false,
//       },
//     });
//     let expiredAt;

//     if (
//       oldSubscription?.expiredAt &&
//       moment(oldSubscription.expiredAt).isAfter(moment())
//     ) {
//       // Calculate remaining time from the old expiration date
//       const remainingTime = moment(oldSubscription.expiredAt).diff(moment());
//       expiredAt = moment().add(remainingTime, 'milliseconds');
//     } else {
//       expiredAt = moment();
//     }

//     if (payment?.subscription.package.durationDay) {
//       expiredAt = expiredAt.add(
//         payment?.subscription.package.durationDay,
//         'days',
//       );
//     }

//     expiredAt = expiredAt.toDate();

//     // 🔹 5. Update payment record
//     const updatedPayment = await tx.payments.update({
//       where: { id: paymentId },
//       data: {
//         isPaid: true,
//         trnId: chargeDetails.transactionId as string,
//         receipt_url: chargeDetails?.receipt_url,
//         updatedAt: new Date(),
//         subscription: {
//           update: {
//             isPaid: true,
//             expiredAt: expiredAt,
//             isActivate: true,
//           },
//         },
//       },
//       include: {
//         subscription: true,
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             phoneNumber: true,
//             profile: true,
//           },
//         },
//       },
//     });

//     if (!updatedPayment) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Payment update failed');
//     }
//     await tx.subscription.update({
//       where: {
//         id: oldSubscription?.id,
//       },
//       data: {
//         isActivate: false,
//       },
//     });

//     // 🔹 6. Send notifications
//     // const admin = await tx.user.findFirst({
//     //   where: { role: 'admin' },
//     // });

//     // if (admin) {
//     //   await notificationServices.insertNotificationIntoDb({
//     //     receiver: admin.id,
//     //     message: 'New Subscription Payment',
//     //     description: `A user has successfully completed a payment. Transaction ID: ${chargeDetails.transactionId}`,
//     //     refference: updatedPayment.id,
//     //     model_type: modeType.Payments,
//     //   });
//     // }

//     // await notificationServices.insertNotificationIntoDb({
//     //   receiver: updatedPayment.user.id,
//     //   message: 'Payment Successful',
//     //   description: `Your payment was successful. Transaction ID: ${chargeDetails.transactionId}`,
//     //   refference: updatedPayment.id,
//     //   model_type: modeType.Payments,
//     // });

//     // Return the final result
//     return {
//       ...updatedPayment,
//       chargeDetails,
//       package: payment.subscription.package,
//     };
//   });

//   return session;
// };

export const paymentsService = {
  checkout,
  confirmPayment,
};
