import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  provider: string;
  providerId: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    email: { type: String, required: true },
    displayName: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
