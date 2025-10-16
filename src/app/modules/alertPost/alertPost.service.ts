import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import prisma from '@app/shared/prisma';
import { Prisma } from '@prisma/index';
import pickQuery from '@app/utils/pickQuery';
import { paginationHelper } from '@app/helpers/pagination.helpers';

const createAlertPost = async (payload: Prisma.AlertPostCreateInput) => {
  const { location, ...data } = payload;

  console.log(payload);

  const result = await prisma.alertPost.create({
    data: {
      ...data,
      location: {
        create: location,
      },
    },
    include: {
      location: true,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create alertPost');
  }
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllAlertPost = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, ...filtersData } = filters;

  const where: Prisma.AlertPostWhereInput = {
    AND: {
      isDeleted: false,
    },
  };

  // Search condition
  if (searchTerm) {
    where.OR = ['id', 'description'].map(field => ({
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

  const orderBy: Prisma.AlertPostOrderByWithRelationInput[] = sort
    ? sort.split(',').map(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          return { [trimmed.slice(1)]: 'desc' };
        }
        return { [trimmed]: 'asc' };
      })
    : [];

  // Fetch data
  const data = await prisma.alertPost.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      user: true,
      location: true,
    },
  });

  const total = await prisma.alertPost.count({ where });

  return {
    data,
    meta: { page, limit, total },
  };
};

const getAlertPostById = async (id: string) => {
  const result = await prisma.alertPost.findUnique({ where: { id } });
  if (!result || result?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'AlertPost not found!');
  }
  return result;
};

const updateAlertPost = async (
  id: string,
  payload: Prisma.AlertPostUpdateInput,
) => {
  const { location, ...data } = payload;

  const result = await prisma.alertPost.update({
    where: { id },
    data: {
      ...data,
      location: {
        update: location,
      },
    },

    include: {
      location: true,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update AlertPost');
  }
  return result;
};

const deleteAlertPost = async (id: string) => {
  const result = await prisma.alertPost.update({
    where: { id },
    data: { isDeleted: true },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete alertPost');
  }
  return result;
};

export const alertPostService = {
  createAlertPost,
  getAllAlertPost,
  getAlertPostById,
  updateAlertPost,
  deleteAlertPost,
};
