import mongoose, { Document, Mixed, Schema } from 'mongoose';

export interface IQuestion extends Document {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const questionSchema = new Schema({
  type: { type: String, required: true },
  difficulty: { type: String, required: true },
  category: { type: String, required: true },
  question: { type: String, required: true },
  correct_answer: { type: String, required: true },
  incorrect_answers: { type: [String], required: true },
});

export default mongoose.model<IQuestion>('question', questionSchema);
