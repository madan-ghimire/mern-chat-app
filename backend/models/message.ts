import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Base message interface (without mongoose document methods)
export interface IMessage {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  chat: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for populated message
export interface IPopulatedMessage {
  _id: Types.ObjectId;
  sender: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    pic?: string;
  };
  content: string;
  chat: {
    _id: Types.ObjectId;
    users: Types.ObjectId[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Document interface (includes mongoose document methods)
export interface IMessageDocument extends Omit<IMessage, '_id'>, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const messageSchema = new Schema<IMessageDocument>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const Message = mongoose.model<IMessageDocument>("Message", messageSchema);

export default Message;
