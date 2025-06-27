import { IUser } from '../models/userModel';
import { Types } from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser & { _id: Types.ObjectId };
  }
}
