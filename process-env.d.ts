declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      TELEGRAM_TOKEN: string;
      MONGO_URI: string;
      // add more environment variables and their types here
    }
  }
}
