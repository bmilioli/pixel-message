import { Request, Response } from 'express';
import * as whatsappService from '../services/whatsapp.service';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import readline from 'readline';
import makeWASocket, {
  AnyMessageContent,
  BinaryInfo,
  delay,
  DisconnectReason,
  encodeWAM,
  fetchLatestBaileysVersion,
  getAggregateVotesInPollMessage,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  PHONENUMBER_MCC,
  proto,
  useMultiFileAuthState,
  WAMessageContent,
  WAMessageKey,
} from '@whiskeysockets/baileys';
import MAIN_LOGGER from '../utils/logger';
import open from 'open';
import fs from 'fs';

export const startConnection = async (req: Request, res: Response) => {
  try {
    const socket = await whatsappService.startSock2();
    res.status(200).send('Connection started successfully!');
  } catch (error) {
    res.status(500).send('Error starting connection');
  }
};

export const sendMessageTyping = async (req: Request, res: Response) => {
  try {
    console.log('req', req);
    const { number, message } = req.body;
    const treatedNumber = `${number}@s.whatsapp.net`;
    await whatsappService.sendMessageTyping(message, treatedNumber);

    res.status(200).send('Message sent successfully!');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error sending message');
  }
};
