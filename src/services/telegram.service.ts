import TelegramBot from 'node-telegram-bot-api';
import config from '../../config/config';

export const sendMessageTyping = async (req: any, res: any) => {
  try {
    const { chatId } = req.body;
    const token = config.telegramToken;
    const bot = new TelegramBot(token, { polling: true });

    bot.sendChatAction(chatId, 'typing');
    res.status(200).json({ status: 'success', message: 'Typing message sent' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
};
