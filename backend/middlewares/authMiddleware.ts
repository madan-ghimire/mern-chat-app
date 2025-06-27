import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import User, { IUser } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Convert to plain object to avoid Mongoose document issues
    const userObject = user.toObject();
    (req as AuthenticatedRequest).user = userObject as IUser;
    next();
  } catch (err) {
    next(err);
  }
};
