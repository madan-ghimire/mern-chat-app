import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChat extends Document {
  chatName: string;
  isGroupChat: boolean;
  users: mongoose.Types.ObjectId[];
  latestMessage?: mongoose.Types.ObjectId;
  groupAdmin?: mongoose.Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);
