import express, { Request, Response, NextFunction, Handler } from 'express';
import { authenticate, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { accessChat, fetchChats, createGroupChat } from '../controllers/chatController';

const router = express.Router();

// Type-safe async handler
const asyncHandler = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
};

// Routes with proper type handling
router.post('/', authenticate as Handler  , asyncHandler(accessChat));
router.get('/', authenticate as Handler, asyncHandler(fetchChats));
router.post('/group', authenticate as Handler, asyncHandler(createGroupChat));

export default router;
