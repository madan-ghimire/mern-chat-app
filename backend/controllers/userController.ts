import { User } from "@/models/user";
import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// search user
export const allUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ error: "Unauthorized. No user found." });
      return;
    }

    const keyword = req.query.search
      ? {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    res.status(200).json(users);
  } catch (err) {
    next(err); // Let your errorHandler handle it
  }
};
