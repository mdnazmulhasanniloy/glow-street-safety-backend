import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import prisma from 'app/shared/prisma';
import { Prisma } from '@prisma/index';
import pickQuery from 'app/utils/pickQuery';
import { paginationHelper } from 'app/helpers/pagination.helpers';

const createEmergencyContact = async (
  payload: Prisma.EmergencyContactCreateInput,
) => {
  try {
    const result = await prisma.emergencyContact.create({ data: payload });

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.message ?? 'Failed to create emergencyContact',
    );
  }
};

const getAllEmergencyContact = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, ...filtersData } = filters;

  const where: Prisma.EmergencyContactWhereInput = {};

  // Search condition
  if (searchTerm) {
    where.OR = ['userId', 'name', 'relation', 'phoneNumber'].map(field => ({
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

  const orderBy: Prisma.EmergencyContactOrderByWithRelationInput[] = sort
    ? sort.split(',').map(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          return { [trimmed.slice(1)]: 'desc' };
        }
        return { [trimmed]: 'asc' };
      })
    : [];

  // Fetch data
  const data = await prisma.emergencyContact.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      user: true,
    },
  });

  const total = await prisma.emergencyContact.count({ where });

  return {
    data,
    meta: { page, limit, total },
  };
};

const getEmergencyContactById = async (id: string) => {
  const result = await prisma.emergencyContact.findFirst({
    where: { id, isDeleted: false },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'EmergencyContact not found!');
  }
  return result;
};

const updateEmergencyContact = async (
  id: string,
  payload: Prisma.EmergencyContactUpdateInput,
) => {
  const result = await prisma.emergencyContact.update({
    where: { id },
    data: payload,
  });

  if (!result) {
    throw new Error('Failed to update EmergencyContact');
  }
  return result;
};

const deleteEmergencyContact = async (id: string) => {
  const result = await prisma.emergencyContact.update({
    where: { id },
    data: { isDeleted: true },
  });
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to delete emergencyContact',
    );
  }
  return result;
};

export const emergencyContactService = {
  createEmergencyContact,
  getAllEmergencyContact,
  getEmergencyContactById,
  updateEmergencyContact,
  deleteEmergencyContact,
};
