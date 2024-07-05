import mongoose from 'mongoose';
import Question, { IQuestion } from '../models/question.model';

export const create = async (question: any) => {
  return await Question.create(question);
};

export const getOneById = async (id: string) => {
  return await Question.findOne({ _id: id });
};

export const getAll = async () => {
  return await Question.find();
};

//get 5 randon questions

export const getRandomQuestion = async () => {
  return await Question.aggregate([{ $sample: { size: 1 } }]);
};
