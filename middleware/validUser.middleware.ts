import {Request, Response, NextFunction} from "express";
import { isExistUserByUserId, isSameUserByUserPw } from "../service/login.service";


const isValidUser = async(req : Request, res:Response, next : NextFunction)=>{
    try{
        type loginData ={
            userid : string;
            userpw : string;
            }
    
        const user = req.body as loginData;
        const foundUser = await isExistUserByUserId(user.userid);
    
        if(!isSameUserByUserPw(user.userpw, foundUser.userpw)) throw new Error("not valid user");
        
        req.session.user = {
            uid : foundUser.uid,
            userid : foundUser.userid,
            username : foundUser.username 
        }
        next();
    }catch(err){
        res.json((err as Error).message);
    }
    
}

export {isValidUser};
