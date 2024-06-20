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
  console.log('msg', msg);
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Bem vindo ao Artistic Trivia Bot!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
