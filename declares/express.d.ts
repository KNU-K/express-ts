import Express from "express";
interface UserPayload {
  uid: number;
  userid: string;
  username: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
