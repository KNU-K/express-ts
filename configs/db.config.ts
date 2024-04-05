import mysql, { PoolOptions } from "mysql2";
import { DB } from "../constants/env.constants";
const connection_pool_opt: PoolOptions = {
  host: DB.HOST,
  user: DB.USER,
  password: DB.PASSWORD,
  port: DB.PORT,
  database: DB.NAME,
  connectionLimit: 1,
  queueLimit: 1,
};
const connection_pool = mysql.createPool(connection_pool_opt).promise();

export { connection_pool };
