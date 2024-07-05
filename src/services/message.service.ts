import { bot } from '../app';
import * as telegramService from './telegram.service';
import * as userRepo from '../repositories/user.repo';
import { IUser } from '../models/user.model';

export const messageRecived = async (msg: any) => {
  console.log('msg', msg);
  const message = msg.text;
  const chatId = msg.from.id;

  const user = await userRepo.getOneByChatId(chatId);
  if (!user) {
    const newUser = {
      chatId: chatId,
      firstname: msg.from.first_name,
      lastname: msg.from.last_name,
      isBot: msg.from.is_bot,
      languageCode: msg.from.language_code,
    };
    console.log('newUser ', newUser);
    await userRepo.create(newUser);
    const options = {
      reply_markup: {
        keyboard: [[{ text: 'Jogar Trivia' }, { text: 'Gerar Imagem' }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
    telegramService.sendMessage(
      chatId,
      'Bem vindo ao Artistic Trivia Bot!',
      options
    );
  } else {
  }
};

//Botão de opções no teclado

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
