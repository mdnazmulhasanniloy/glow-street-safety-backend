/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Prisma } from '@prisma/index';
import prisma from '@app/shared/prisma';
import pickQuery from '@app/utils/pickQuery';
import { paginationHelper } from '@app/helpers/pagination.helpers';

const createSubscription = async (payload: Prisma.SubscriptionCreateInput) => {
  const pkg = await prisma.package.findFirst({
    //@ts-ignore
    where: { id: payload.packageId },
  });
  if (!pkg) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Package not found!');
  }

  const isHaveSub = await prisma.subscription.findFirst({
    where: {
      //@ts-ignore
      userId: payload?.userId,
      //@ts-ignore
      packageId: payload?.packageId,
      isActivate: false,
      isPaid: false,
      isDeleted: false,
    },
  });

  if (isHaveSub) {
    return isHaveSub;
  }

  const result = await prisma.subscription.create({
    data: payload,
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create subscription');
  }
  return result;
};

const getAllSubscription = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, ...filtersData } = filters;

  const where: Prisma.SubscriptionWhereInput = {
    AND: {
      isDeleted: false,
    },
  };

  // Search condition
  if (searchTerm) {
    where.OR = ['id', 'title'].map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }));
  }

  // Filter conditions
  if (Object.keys(filtersData).length > 0) {
    const oldAnd = where.AND;
    const andArray = Array.isArray(oldAnd) ? oldAnd : oldAnd ? [oldAnd] : [];

    where.AND = [
      {
        isDeleted: false,
      },
      ...andArray,
      ...Object.entries(filtersData).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    ];
  }

  // Pagination & Sorting
  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  const orderBy: Prisma.PackageOrderByWithRelationInput[] = sort
    ? sort.split(',').map(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          return { [trimmed.slice(1)]: 'desc' };
        }
        return { [trimmed]: 'asc' };
      })
    : [];

  // Fetch data
  const data = await prisma.subscription.findMany({
    where,
    skip,
    take: limit,
    orderBy,
  });

  const total = await prisma.subscription.count({ where });

  return {
    data,
    meta: { page, limit, total },
  };
};

const getSubscriptionById = async (id: string) => {
  const result = await prisma.subscription.findFirst({ where: { id } }); 
  if (!result || result?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Subscription not found!');
  }
  return result;
};

const updateSubscription = async (
  id: string,
  payload: Prisma.SubscriptionUpdateInput,
) => {
  const result = await prisma.subscription.update({
    where: { id },
    data: payload,
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Subscription');
  }
  return result;
};

const deleteSubscription = async (id: string) => {
  const result = await prisma.subscription.update({
    where: { id },
    data: { isDeleted: true },
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete subscription');
  }
  return result;
};

export const subscriptionService = {
  createSubscription,
  getAllSubscription,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
};
