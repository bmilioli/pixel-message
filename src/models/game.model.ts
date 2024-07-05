import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  user1: string;
  points1: number;
  user2: string;
  points2: number;
  questions: string[];
}

const gameSchema = new Schema({
  user1: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  points1: { type: Number, required: true },
  user2: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  points2: { type: Number, required: true },
  questions: { type: [Schema.Types.ObjectId], ref: 'question', required: true },
});

export default mongoose.model<IGame>('game', gameSchema);
