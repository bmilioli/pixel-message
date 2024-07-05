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
