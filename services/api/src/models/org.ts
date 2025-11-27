import mongoose, { Schema, Document } from 'mongoose';

export interface IOrg extends Document {
  name: string;
  owner: string;
  members: string[];
  createdAt: Date;
}

const OrgSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  owner: { type: String, required: true },
  members: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrg>('Org', OrgSchema);
