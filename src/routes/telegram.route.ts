import express from 'express';
import * as telegramController from '../controllers/telegram.controller';

const router = express.Router();

//router.get('/startConnection', whatsappController.startConnection);

router.post('/sendMessageTyping', telegramController.sendMessageTyping);
export default router;
