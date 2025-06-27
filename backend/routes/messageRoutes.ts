import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { sendMessage, getMessages } from '../controllers/messageController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate as RequestHandler);

// Helper to handle async route handlers
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  const handler = sendMessage as unknown as RequestHandler;
  return handler(req, res, next);
});

// @route   GET /api/messages/:chatId
// @desc    Get all messages for a chat
// @access  Private
router.get('/:chatId', (req: Request, res: Response, next: NextFunction) => {
  const handler = getMessages as unknown as RequestHandler;
  return handler(req, res, next);
});

export default router;
