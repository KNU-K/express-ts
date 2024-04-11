import mysql, { PoolOptions } from "mysql2";
import { DB } from "../constants/env.constants";

const connection_pool_opt: PoolOptions = {
  host: DB.HOST,
  user: DB.USER,
  password: DB.PASSWORD,
  port: DB.PORT,
  database: DB.NAME,
  waitForConnections  : true,
  connectionLimit: 1,
  queueLimit: 1,
};
const connectionPool = mysql.createPool(connection_pool_opt).promise();

export { connectionPool };


// import mysql, {Connection} from "mysql2";

// const connectionPool = mysql.createPool({
//     host : "localhost",
//     port : 3306,
//     user : "root",
//     password : "R3c0mM3nd3dP@ssw0rd!",
//     database : "asdf",
//     waitForConnections : true,
//     connectionLimit : 1,
//     queueLimit : 1
// }).promise()


// export {connectionPool};