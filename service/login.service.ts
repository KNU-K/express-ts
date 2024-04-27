import { Request, Response, NextFunction } from "express";
import { connectionPool } from "../configs/db.config";
declare module "express-session"{
    interface SessionData{
        user ? : {
            uid : number,
            userid : string,
            username : string
        }
    }
}

type userType = {
    uid : number,
    userid : string,
    username : string,
    userpw : string
}

async function isExistUserByUserId(userId : string){
    const connection = await connectionPool.getConnection();

    const [users, fields] = await connection.query(`
        Select * from owners  
        WHERE userid = ?`,
        [userId]) as [userType[], object];

    connection.release();

    if(users.length === 0) throw new Error ("can not find user");

    return users[0]
}

function isSameUserByUserPw(userPw : string, foundUserPw :string) : boolean{
    return (userPw === foundUserPw ? true : false)
}


export {isExistUserByUserId, isSameUserByUserPw};

