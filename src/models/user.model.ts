import mongoose, { Document, Mixed, Schema } from 'mongoose';

export interface IUser extends Document {
  chatId: number;
  firstname: string;
  lastname: string;
  languageCode: string;
  isBot: boolean;
  activeGame: string;
}

const userSchema = new Schema({
  chatId: { type: Number, required: true, unique: true, index: true },
  firstname: { type: String, required: true },
  lastname: { type: String },
  languageCode: { type: String, required: true },
  isBot: { type: Boolean, required: true },
  activeGame: { type: Schema.Types.ObjectId, ref: 'game' },
});

export default mongoose.model<IUser>('user', userSchema);
