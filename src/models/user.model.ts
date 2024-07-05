import mongoose, { Document, Mixed, Schema } from 'mongoose';

export interface IUser extends Document {
  chatId: number;
  firstname: string;
  lastname: string;
  languageCode: string;
  isBot: boolean;
  activeInteraction: string;
}

const userSchema = new Schema({
  chatId: { type: Number, required: true, unique: true, index: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  languageCode: { type: String, required: true },
  isBot: { type: Boolean, required: true },
  activeInteraction: { type: Schema.Types.ObjectId, ref: 'active_interaction' },
});

export default mongoose.model<IUser>('user', userSchema);
