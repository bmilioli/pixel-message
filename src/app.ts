import express, { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import bodyParser from 'body-parser';
import TelegramBot from 'node-telegram-bot-api';
//import cors from 'cors';

import telegramRouter from './routes/telegram.route';

const app = express();
const port = config.port;

app.get('/', (req: any, res: Response) => {
  res.send('Hello, world!');
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cors({ origin: '*', credentials: true }));

//Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  res
    .status(err.statusCode)
    .json({ status: err.status, message: err.message, code: err?.shortCode });
});

app.use('/telegram', telegramRouter);

const token = config.telegramToken;

const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  console.log('match', match);
  console.log('msg', msg);
  const chatId = msg.chat.id;

  if (!match) return bot.sendMessage(chatId, 'No match found');
  const resp = match[1];
  // the captured "whatever"

  console.log('match', match);
  console.log('msg', msg);

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  console.log('msg', msg.text);
  const chatId = msg.chat.id;

  //Botão de opções no teclado
  const options = {
    reply_markup: {
      keyboard: [
        [{ text: 'Option 1' }, { text: 'Option 2' }],
        [{ text: 'Option 3' }, { text: 'Option 4' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };

  // const options = {
  //   reply_markup: {
  //     inline_keyboard: [
  //       [
  //         { text: 'Option 1', callback_data: 'option1' },
  //         { text: 'Option 2', callback_data: 'option2' },
  //       ],
  //     ],
  //     one_time_keyboard: true,
  //   },
  // };

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Bem vindo ao Artistic Trivia Bot!', options);
});

bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  console.log('callbackQuery', callbackQuery);
  if (!msg) return console.log('No message');

  if (data === 'option1') {
    bot.sendMessage(msg.chat.id, 'You selected Option 1');
  } else if (data === 'option2') {
    bot.sendMessage(msg.chat.id, 'You selected Option 2');
  }

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: msg.chat.id, message_id: msg.message_id }
  );

  // Important: Acknowledge the callback to avoid repeat messages
  bot.answerCallbackQuery(callbackQuery.id);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { bot };
