import catchAsync from '@app/utils/catchAsync';
import httpStatus from 'http-status';
import { safeZoneService } from './safezone.service';
import sendResponse from '@app/utils/sendResponse';

const createSafezone = catchAsync(async (req, res) => {
  req.body.userId = req.user.userId;
  const result = await safeZoneService.createSafezone(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'safezone create successfully',
    data: result,
  });
});
const getByIdSafezone = catchAsync(async (req, res) => {
  const result = await safeZoneService.getById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'safezone fetch by id successfully',
    data: result,
  });
});
const getAllSafezone = catchAsync(async (req, res) => {
  const result = await safeZoneService.getAllSafezone(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'safezone fetch successfully',
    data: result,
  });
});
const getMySafezone = catchAsync(async (req, res) => {
  req.query['userId'] = req.user.userId;
  const result = await safeZoneService.getAllSafezone(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My safezone fetch successfully',
    data: result,
  });
});
const updateSafezone = catchAsync(async (req, res) => {
  const result = await safeZoneService.updateSafezone(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'safezone update successfully',
    data: result,
  });
});
const deleteSafezone = catchAsync(async (req, res) => {
  const result = await safeZoneService.deleteSafezone(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'safezone delete successfully',
    data: result,
  });
});

export const safeZoneController = {
  createSafezone,
  getAllSafezone,
  getMySafezone,
  updateSafezone,
  deleteSafezone,
  getByIdSafezone,
};
