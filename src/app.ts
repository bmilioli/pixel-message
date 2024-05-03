import express, { NextFunction, Request, Response } from "express";
import config from "../config/config";

import whatsappRouter from "./routes/whatsapp.route";

const app = express();
const port = config.port;

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  res
    .status(err.statusCode)
    .json({ status: err.status, message: err.message, code: err?.shortCode });
});

app.use("/whatsapp", whatsappRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
