import { Request, Response } from 'express';
import * as telegramService from '../services/telegram.service';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const chatId = req.body.chatId;
    const message = req.body.message;
    const sendMessage = await telegramService.sendMessage(chatId, message);
    return res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    return res.status(500).json({ message: 'Error sending message' });
  }
};

export const sendPoll = async (req: Request, res: Response) => {
  try {
    const chatId = req.body.chatId;
    const question = req.body.message;
    const options = req.body.options;
    const sendPoll = await telegramService.sendPoll(chatId, question, options);
    if (!sendPoll) {
      return res.status(500).json({ message: 'Error sending poll' });
    }
    return res.status(200).json({ message: 'Poll sent' });
  } catch (error) {
    // console.log('error', error);
    return res.status(500).json({ message: 'Error sending poll' });
  }
};
