import {Request,Response,NextFunction} from "express";

//로그인이 되어있는지 확인하는 미들웨어
const isAuthenticated =(req:Request, res :Response, next : NextFunction)=>{
    try{
        if(req.session && req.session.user) next();
        else throw new Error("로그인이 되어있지 않습니다")
    }catch(err){
        res.json({msg : (err as Error).message});
    }
}

const authenticateError = (err:Error, req : Request, res : Response, next : NextFunction)=>{
    res.send({msg : (err as Error).message})
}

export {isAuthenticated, authenticateError};