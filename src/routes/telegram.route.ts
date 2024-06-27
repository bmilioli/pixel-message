import express from 'express';
import * as telegramController from '../controllers/telegram.controller';

const router = express.Router();

//router.get('/startConnection', whatsappController.startConnection);

router.post('/sendMessage', telegramController.sendMessage);
router.post('/sendPoll', telegramController.sendPoll);

export default router;
