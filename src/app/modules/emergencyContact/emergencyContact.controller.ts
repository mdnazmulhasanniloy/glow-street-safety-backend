import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { emergencyContactService } from './emergencyContact.service';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '@app/utils/s3';

const createEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    req.body['userId'] = req.user.serId;
    if (req?.file) {
      req.body.profile = await uploadToS3({
        file: req.file,
        fileName: `images/contact/profile/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
    const result = await emergencyContactService.createEmergencyContact(
      req.body,
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'EmergencyContact created successfully',
      data: result,
    });
  },
);

const getAllEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    const result = await emergencyContactService.getAllEmergencyContact(
      req.query,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All emergencyContact fetched successfully',
      data: result,
    });
  },
);


const getMyEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    req.query['userId'] = req.user.userId;
    const result = await emergencyContactService.getAllEmergencyContact(
      req.query,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'my emergencyContact fetched successfully',
      data: result,
    });
  },
);

const getEmergencyContactById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await emergencyContactService.getEmergencyContactById(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'EmergencyContact fetched successfully',
      data: result,
    });
  },
);

const updateEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    if (req?.file) {
      req.body.profile = await uploadToS3({
        file: req.file,
        fileName: `images/contact/profile/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
    const result = await emergencyContactService.updateEmergencyContact(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'EmergencyContact updated successfully',
      data: result,
    });
  },
);

const deleteEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    const result = await emergencyContactService.deleteEmergencyContact(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'EmergencyContact deleted successfully',
      data: result,
    });
  },
);

export const emergencyContactController = {
  createEmergencyContact,
  getAllEmergencyContact,
  getEmergencyContactById,
  updateEmergencyContact,
  deleteEmergencyContact,
  getMyEmergencyContact,
};
