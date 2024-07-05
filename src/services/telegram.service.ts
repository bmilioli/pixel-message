import TelegramBot from 'node-telegram-bot-api';

import { bot } from '../app';

export const sendMessage = async (chatId: any, message: any, options?: any) => {
  try {
    const messageSent = await bot.sendMessage(chatId, message, options);
    return messageSent;
  } catch (error) {
    return error;
  }
};

export const sendPoll = async (chatId: any, question: any, options: any) => {
  try {
    const poll = await bot.sendPoll(chatId, question, options);
    console.log('poll', poll);
    return poll;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};
