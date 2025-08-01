import AppError from '@app/error/AppError';
import { paginationHelper } from '@app/helpers/pagination.helpers';
import prisma from '@app/shared/prisma';
import pickQuery from '@app/utils/pickQuery';
import { Prisma } from '@prisma/index';
import httpStatus from 'http-status';

const createSafezone = async (payload: Prisma.SafeZoneCreateInput) => {
  try {
    const result = await prisma.safeZone.create({
      data: payload,
      include: {
        endLocation: true,
        startLocation: true,
      },
    });
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'safezone creation failed!');
    }

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.message ?? 'safezone creation failed!',
    );
  }
};

const updateSafezone = async (
  id: string,
  payload: Prisma.SafeZoneUpdateInput,
) => {
  try {
    const result = await prisma.safeZone.update({
      where: {
        id: id,
      },
      data: payload,
      include: {
        endLocation: true,
        startLocation: true,
      },
    });

    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'safezone update failed!');
    }
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.message ?? 'safezone update failed!',
    );
  }
};

const getById = async (id: string) => {
  try {
    const result = await prisma.safeZone.findUnique({
      where: { id },
      include: { startLocation: true, endLocation: true },
    });
    if (!result || result.isDeleted)
      throw new AppError(httpStatus.BAD_REQUEST, 'safezone ');
    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.message ?? 'safezone update failed!',
    );
  }
};

const getAllSafezone = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, ...filtersData } = filters;

  const where: Prisma.SafeZoneWhereInput = {};

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
      ...andArray,
      ...Object.entries(filtersData).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    ];
  }

  // Pagination & Sorting
  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  const orderBy: Prisma.SafeZoneOrderByWithRelationInput[] = sort
    ? sort.split(',').map(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          return { [trimmed.slice(1)]: 'desc' };
        }
        return { [trimmed]: 'asc' };
      })
    : [];

  // Fetch data
  const data = await prisma.safeZone.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      startLocation: true,
      endLocation: true,
    },
  });

  const total = await prisma.safeZone.count({ where });

  return {
    data,
    meta: { page, limit, total },
  };
};

const deleteSafezone = async (id: string) => {
  try {
    const result = await prisma.safeZone.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.message ?? 'safezone delete failed',
    );
  }
};

export const safeZoneService = {
  createSafezone,
  updateSafezone,
  getAllSafezone,
  getById,
  deleteSafezone,
};
