import dotenv from "dotenv";

dotenv.config();

type DB_ENV = {
  HOST: string;
  USER: string;
  PASSWORD: string;
  PORT: number;
  NAME: string;
};
type SERVER_ENV = {
  PORT: number;
};
const SERVER: SERVER_ENV = {
  PORT: Number(process.env.SERVER_PORT) || 8000,
};

const DB: DB_ENV = {
  HOST: process.env.DB_HOST || "",
  USER: process.env.DB_HOST || "",
  PASSWORD: process.env.DB_HOST || "",
  PORT: Number(process.env.DB_HOST) || 3306,
  NAME: process.env.DB_HOST || "",
};

export { SERVER, DB };
