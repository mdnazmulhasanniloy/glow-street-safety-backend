/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { alertPostService } from './alertPost.service';
import sendResponse from '../../utils/sendResponse';
import { uploadManyToS3 } from '@app/utils/s3';

const createAlertPost = catchAsync(async (req: Request, res: Response) => {
  req.body.userId = req.user.userId;
  if (req.files) {
    const { images } = req.files as any;
    if (images?.length) {
      const imgsArray: { file: any; path: string; key?: string }[] = [];

      images?.map(async (image: any) => {
        imgsArray.push({
          file: image,
          path: `images/alertpost`,
        });
      });

      req.body['images'] = (await uploadManyToS3(imgsArray)).map(
        img => img.url,
      );
    }
  }

  const result = await alertPostService.createAlertPost(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'AlertPost created successfully',
    data: result,
  });
});

const getAllAlertPost = catchAsync(async (req: Request, res: Response) => {
  const result = await alertPostService.getAllAlertPost(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All alertPost fetched successfully',
    data: result,
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  req.query['userId'] = req.user.userId;
  const result = await alertPostService.getAllAlertPost(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All alertPost fetched successfully',
    data: result,
  });
});

const getAlertPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await alertPostService.getAlertPostById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AlertPost fetched successfully',
    data: result,
  });
});

const updateAlertPost = catchAsync(async (req: Request, res: Response) => {
  if (req.files) {
    const { images } = req.files as any;
    if (images?.length) {
      const imgsArray: { file: any; path: string; key?: string }[] = [];

      images?.map(async (image: any) => {
        imgsArray.push({
          file: image,
          path: `images/alertpost`,
        });
      });

      req.body['images'] = (await uploadManyToS3(imgsArray)).map(
        img => img.url,
      );
    }
  }
  const result = await alertPostService.updateAlertPost(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AlertPost updated successfully',
    data: result,
  });
});

const deleteAlertPost = catchAsync(async (req: Request, res: Response) => {
  const result = await alertPostService.deleteAlertPost(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AlertPost deleted successfully',
    data: result,
  });
});

export const alertPostController = {
  createAlertPost,
  getAllAlertPost,
  getAlertPostById,
  updateAlertPost,
  deleteAlertPost,
  getMyPosts,
};
