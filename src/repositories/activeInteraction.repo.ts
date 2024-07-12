import mongoose from 'mongoose';
import ActiveInteraction, {
  IActiveInteraction,
} from '../models/activeInteraction.model';

export const create = async (activeInteraction: any) => {
  return await ActiveInteraction.create(activeInteraction);
};
