import { Document, Schema, model, Types } from "mongoose";

export interface IMongoFile extends Omit<Document, "model"> {
  user: Types.ObjectId;
  conversationId?: string;
  file_id: string;
  temp_file_id?: string;
  bytes: number;
  text?: string;
  filename: string;
  filepath: string;
  object: "file";
  embedded?: boolean;
  type: "image" | "video" | "raw" | string;
  context?: string;
  usage: number;
  source: string;
  model?: string;
  width?: number;
  height?: number;
  metadata?: {
    fileIdentifier?: string;
  };
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  mimetype: string;
  local_path?: string;
}

const fileSchema = new Schema<IMongoFile>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  conversationId: { type: String, required: false },
  file_id: { type: String, required: true },
  temp_file_id: { type: String, required: false },
  bytes: { type: Number, required: true },
  text: { type: String, required: false },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  object: { type: String, required: true },
  embedded: { type: Boolean, required: false },
  type: { type: String, required: true },
  context: { type: String, required: false },
  usage: { type: Number, required: true },
  source: { type: String, required: true },
  model: { type: String, required: false },
  width: { type: Number, required: false },
  height: { type: Number, required: false },
  metadata: { type: Object, required: false },
  expiresAt: { type: Date, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  mimetype: { type: String, required: true },
  local_path: { type: String, required: false },
});

export default model<IMongoFile>("File", fileSchema);
