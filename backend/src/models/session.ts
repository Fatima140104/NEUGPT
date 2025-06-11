import { Schema, model, Document, Types } from "mongoose";

export interface ISession extends Document {
  user: Types.ObjectId;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
  },
  { timestamps: true }
);

export default model<ISession>("Session", sessionSchema);
