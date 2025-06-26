import { Schema, model, Document, Types } from "mongoose";

export interface IChat extends Document {
  session: Types.ObjectId;
  user: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const chatSchema = new Schema<IChat>({
  session: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

export default model<IChat>("Chat", chatSchema);
