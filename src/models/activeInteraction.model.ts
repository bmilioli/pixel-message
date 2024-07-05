import mongoose, { Document, Schema } from 'mongoose';

export interface IActiveInteraction extends Document {
  user: string;
  interactionType: string;
  game: string;
  conversationStage: string;
}

const activeInteractionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  interactionType: { type: String, required: true },
  game: { type: Schema.Types.ObjectId, ref: 'game', required: true },
  conversationStage: { type: String, required: true },
});

export default mongoose.model<IActiveInteraction>(
  'active_interaction',
  activeInteractionSchema
);
