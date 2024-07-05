import * as questionRepo from '../repositories/question.repo';
import * as telegramService from './telegram.service';
import { IQuestion } from '../models/question.model';
import { IGame } from '../models/game.model';

export const startGame = async (user: any) => {
  const question = await questionRepo.getRandomQuestion();

  const alternatives: string[] = [];
  alternatives.push(question[0].correct_answer);
  question[0].incorrect_answers.forEach((element: string) => {
    alternatives.push(element);
  });

  //randomize alternatives

  for (let i = alternatives.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [alternatives[i], alternatives[j]] = [alternatives[j], alternatives[i]];
  }

  const options = {
    reply_markup: {
      keyboard: [
        [{ text: alternatives[0] }, { text: alternatives[1] }],
        [{ text: alternatives[2] }, { text: alternatives[3] }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };

  const message = `Pergunta: ${question[0].question}`;

  const sent = telegramService.sendMessage(user.chatId, message, options);

  return sent;
};
