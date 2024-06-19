import express, { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import bodyParser from 'body-parser';
//import cors from 'cors';

import whatsappRouter from './routes/whatsapp.route';

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

app.use('/whatsapp', whatsappRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
