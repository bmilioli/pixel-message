import mongoose from 'mongoose';
import Game, { IGame } from '../models/game.model';

export const create = async (game: any) => {
  return await Game.create(game);
};

export const getOneById = async (id: string) => {
  return await Game.findOne({ _id: id });
};

export const getTheLastGame = async () => {
  return await Game.findOne().sort({ $natural: -1 }).limit(1);
};

export const update = async (game: any) => {
  return await Game.updateOne({ _id: game._id }, game);
};

export const getByIdAndPopulate = async (id: string) => {
  return await Game.findById(id).populate('user1').populate('user2');
};
