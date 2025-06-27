import { Response, Request } from 'express';
import { IUser } from '../models/userModel';
import Message, { IMessage, IPopulatedMessage } from '../models/message';
import Chat from '../models/chatModel';
import { getSocketManager } from '../socket/socketManager';
import { Types } from 'mongoose';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}


// @desc    Send a new message
// @route   POST /api/messages
// @access  Protected
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, chatId } = req.body as { content: string; chatId: string };
    const user = req.user;

    if (!content || !chatId) {
      return res.status(400).json({ message: 'Content and chat ID are required' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Validate chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    if (!chat.users.some(u => u.toString() === user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to send messages to this chat' });
    }

    // Create new message
    const newMessage = await Message.create({
      sender: user._id,
      content,
      chat: new Types.ObjectId(chatId),
    });

    // Populate the message with sender and chat details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate<{ sender: IUser }>('sender', 'firstName lastName pic')
      .populate({
        path: 'chat',
        populate: {
          path: 'users',
          select: 'firstName lastName pic email',
        },
      })
      .lean()
      .exec() as unknown as IPopulatedMessage;

    if (!populatedMessage) {
      throw new Error('Failed to create message');
    }

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { 
      latestMessage: populatedMessage._id 
    });

    // Prepare message for socket emission - use the ID only for the chat field as per IMessage interface
    const messageForSocket: IMessage = {
      _id: populatedMessage._id,
      sender: populatedMessage.sender._id,
      content: populatedMessage.content,
      chat: populatedMessage.chat._id,
      createdAt: populatedMessage.createdAt || new Date(),
      updatedAt: populatedMessage.updatedAt || new Date()
    };

    // Emit socket event
    const socketManager = getSocketManager();
    socketManager.emitNewMessage(messageForSocket);

    return res.status(201).json(populatedMessage);
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while sending message' 
    });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Protected
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const user = req.user;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Check if user is part of the chat
    const userChat = await Chat.findOne({
      _id: chatId,
      users: user._id,
    });

    if (!userChat) {
      return res.status(403).json({ message: 'Not authorized to access these messages' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName lastName pic email')
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return res.status(200).json(messages);
  } catch (error: any) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while fetching messages' 
    });
  }
};
