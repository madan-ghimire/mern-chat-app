import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Chat from '../models/chatModel';
import User from '../models/userModel';
import { Types } from 'mongoose';

interface IAuthenticatedUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  pic: string;
  isAdmin: boolean;
}

// Helper function to ensure user is defined
const ensureUser = (req: AuthenticatedRequest): IAuthenticatedUser => {
  const user = req.user as IAuthenticatedUser | undefined;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
};

// @desc    Create or fetch one-to-one chat
// @route   POST /api/chat
// @access  Protected
export const accessChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const user = ensureUser(req);

    if (!userId) {
      return res.status(400).json({ message: 'UserId param not sent with request' });
    }

    // Check if chat already exists between the two users
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: user._id } } },
        { users: { $elemMatch: { $eq: new Types.ObjectId(userId) } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    if (isChat.length > 0) {
      isChat = await Chat.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email',
      });
    }

    if (Array.isArray(isChat) && isChat.length > 0) {
      return res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [user._id, new Types.ObjectId(userId)],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate('users', '-password');
      
      return res.status(200).json(fullChat);
    }
  } catch (error: any) {
    console.error('Error in accessChat:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while accessing chat' 
    });
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Protected
export const fetchChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = ensureUser(req);
    const results = await Chat.find({ users: { $elemMatch: { $eq: user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: 'latestMessage.sender',
      select: 'name pic email',
    });

    return res.status(200).send(populatedResults);
  } catch (error: any) {
    console.error('Error in fetchChats:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while fetching chats' 
    });
  }
};

// @desc    Create new group chat
// @route   POST /api/chat/group
// @access  Protected
export const createGroupChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    const user = ensureUser(req);
    const users = Array.isArray(req.body.users) 
      ? req.body.users 
      : JSON.parse(req.body.users);

    if (users.length < 2) {
      return res.status(400).json({ 
        message: 'More than 2 users are required to form a group chat' 
      });
    }

    // Ensure all user IDs are valid ObjectIds
    const userIds = [
      user._id,
      ...users.map((id: string) => new Types.ObjectId(id))
    ];

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: userIds,
      isGroupChat: true,
      groupAdmin: user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    return res.status(200).json(fullGroupChat);
  } catch (error: any) {
    console.error('Error in createGroupChat:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while creating group chat' 
    });
  }
};
