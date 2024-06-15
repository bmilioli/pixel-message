import express from 'express';
import * as whatsappController from '../controllers/whatsapp.controller';

const router = express.Router();

router.get('/startConnection', whatsappController.startConnection);

router.post('/sendMessageTyping', whatsappController.sendMessageTyping);
export default router;
