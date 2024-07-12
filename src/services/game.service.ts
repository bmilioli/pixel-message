import * as questionRepo from '../repositories/question.repo';
import * as gameRepo from '../repositories/game.repo';
import * as userRepo from '../repositories/user.repo';
import * as telegramService from './telegram.service';
import { IQuestion } from '../models/question.model';
import { IGame } from '../models/game.model';

export const startGame = async (user: any) => {
  const lastGame = await gameRepo.getTheLastGame();
  if (!lastGame || lastGame?.user2 || !lastGame?.user1) {
    const newGame: any = {
      user1: user._id,
    };
    const game = await gameRepo.create(newGame);
    user.activeGame = game._id;
    await userRepo.update(user);
    const message =
      'Aguarde o próximo jogador! Ou digite /cancelar para cancelar o jogo!';
    const sent = telegramService.sendMessage(user.chatId, message);
    return sent;
  } else {
    lastGame.user2 = user._id;
    await gameRepo.update(lastGame);
    user.activeGame = lastGame._id;
    const user1 = await userRepo.getOneById(lastGame.user1);
    await userRepo.update(user);
    const message =
      'Jogo iniciado! Aguarde a pergunta! ou digite /cancelar para cancelar o jogo!';
    const sent1 = telegramService.sendMessage(user.chatId, message);
    const sent2 = telegramService.sendMessage(lastGame.user1, message);
    sendQuestion(lastGame);
  }
};

export const sendQuestion = async (game: any) => {
  const user1 = await userRepo.getOneById(game.user1);
  if (!user1) {
    throw new Error('Usuário não encontrado');
  }

  const user2 = await userRepo.getOneById(game.user2);
  if (!user2) {
    throw new Error('Usuário não encontrado');
  }

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

  game.awnswer = question[0].correct_answer;
  await gameRepo.update(game);

  const message = `Pergunta: ${question[0].question}`;

  const sent1 = telegramService.sendMessage(user1.chatId, message, options);
  const sent2 = telegramService.sendMessage(user2.chatId, message, options);

  return { sent1, sent2 };
};
