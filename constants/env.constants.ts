import dotenv from "dotenv";

dotenv.config();

type SERVER_ENV = {
  PORT: number;
};
const SERVER: SERVER_ENV = {
  PORT: Number(process.env.SERVER_PORT) || 8000,
};

type DB_ENV = {
  HOST: string;
  USER: string;
  PASSWORD: string;
  PORT: number;
  NAME: string;
};
const DB: DB_ENV = {
  HOST: process.env.DB_HOST || "",
  PORT: Number(process.env.DB_PORT) || 3306,
  USER: process.env.DB_USER || "",
  PASSWORD: process.env.DB_PASSWORD || "",
  NAME: process.env.DB_NAME || "",
};

export { SERVER, DB };
