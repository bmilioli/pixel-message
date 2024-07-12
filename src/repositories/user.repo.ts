import User, { IUser } from '../models/user.model';
import mongoose from 'mongoose';

export const create = async (user: any) => {
  const data: IUser = new User({
    ...user,
  });
  console.log(data);
  return await data.save();
};

export const getOneByChatId = async (chatId: number) => {
  return await User.findOne({ chatId });
};

export const update = async (user: any) => {
  return await User.updateOne({ _id: user._id }, user);
};

export const getOneById = async (id: string) => {
  return await User.findOne({ _id: id });
};

export const cancelGame = async (user: any) => {
  return await User.updateOne({ _id: user._id }, { activeGame: null });
};
