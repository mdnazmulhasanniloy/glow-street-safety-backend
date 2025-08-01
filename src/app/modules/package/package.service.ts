import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Prisma } from '@prisma/index';
import prisma from '@app/shared/prisma';
import pickQuery from '@app/utils/pickQuery';
import { paginationHelper } from '@app/helpers/pagination.helpers';

const createPackage = async (payload: Prisma.PackageCreateInput) => {
  const result = await prisma.package.create({ data: payload });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create package');
  }
  return result;
};

const getAllPackage = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, ...filtersData } = filters;

  const where: Prisma.PackageWhereInput = {};

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
  const data = await prisma.package.findMany({
    where,
    skip,
    take: limit,
    orderBy,
  });

  const total = await prisma.package.count({ where });

  return {
    data,
    meta: { page, limit, total },
  };
};

const getPackageById = async (id: string) => {
  const result = await prisma.package.findUnique({ where: { id } });
  if (!result || result?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Package not found!');
  }
  return result;
};

const updatePackage = async (
  id: string,
  payload: Prisma.PackageUpdateInput,
) => {
  const result = await prisma.package.update({ where: { id }, data: payload });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Package');
  }
  return result;
};

const deletePackage = async (id: string) => {
  const result = await prisma.package.update({
    where: {
      id,
    },
    data: { isDeleted: true },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete package');
  }
  return result;
};

export const packageService = {
  createPackage,
  getAllPackage,
  getPackageById,
  updatePackage,
  deletePackage,
};
