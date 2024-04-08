import { NextFunction, Request, Response, Router } from "express";
import { connectionPool } from "../../configs/db.config";

const router: Router = Router();

declare module "express-session"{
  interface SessionData{
    user ? : {
      uid : number,
      userid : string,
      username : string
    }
  }
}

/**@ROUTER user parts */
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

  if(users.length == 0) throw new Error ("can not find user");

  return users[0]
}

function isSameUserByUserPw(userPw : string, foundUserPw :string) : boolean{
  return (userPw === foundUserPw ? true : false)
}

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try{
    type loginData ={
      userid : string;
      userpw : string;
    }

    const user = req.body as loginData;

    const foundUser = await isExistUserByUserId(user.userid);

    if(!isSameUserByUserPw(user.userpw, foundUser.userpw)) throw new Error("not valid user");
    
    
    // 회원정보가 있는 회원이 로그인 시도를 하면 세션에 회원정보를 저장을 한다.
    req.session.user = {
      uid : foundUser.uid,
      userid : foundUser.userid,
      username : foundUser.username 
    }

    res.json({msg : "successfully login user!"});
  }catch(err){
    res.json({msg : (err as Error).message});
  }
});
router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
  try{
    if(!(req.session && req.session.user))
    return res.send("로그인이 안 되어 있습니다");

    req.session.destroy((err)=>{
      if(err) throw new Error("로그아웃 실패");
    })

    res.send("로그아웃 성공");
  }catch(err){
    res.json({msg : (err as Error).message});
  }
});

router.get("/user", (req: Request, res: Response, next: NextFunction) => {
  try{
    if(!(req.session && req.session.user)) throw new Error("로그인을 하십시오")
    res.json({username : req.session.user?.username});
  }catch(err){ 
    res.json({msg : (err as Error).message});
  }

});

 //TODO: Find user details
router.get("/user/:userid", async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userid;

  const connection = await connectionPool.getConnection()
  const [userDetails, fields] = await connection.query(`
    SELECT *FROM owners
    WHERE userid = ?
  `,
  [userId]) as [userType[], object]

  if(userDetails.length === 0) throw new Error("회원 정보가 없습니다")

  res.json({userDetails : userDetails[0]})
  
});

 // TODO: JOIN with my Platform
async function isExistUser(newUserId : string) {
  const connection = await connectionPool.getConnection();
  const [users, fields] = await connection.query(`
    SELECT *from owners 
    WHERE userid = ?
  `,[newUserId]) as [userType[], object]

  return (users.length === 0 ? false : true)
}

router.post("/user", async (req: Request, res: Response, next: NextFunction) => {
  try{
    type newUserType = {
      userid : string,
      userpw : string,
      username : string
    }
    const newUser = req.body as newUserType;
    
    const connection = await connectionPool.getConnection();
    const [users, fields] = await connection.query(`
      SELECT *from owners 
      WHERE userid = ?
    `,[newUser.userid]) as [userType[], object]

    if(users.length !== 0) throw new Error("이미 존재하는 회원입니다.");
    
    console.log("여기 바로 위에가 안 되는 듯")
    
    await connection.query(`
      INSERT INTO owners (userid, userpw, username) 
      VALUES (?, ?, ?)`,
      [newUser.userid, newUser.userpw, newUser.username])
    
    res.json({msg :"회원가입에 성공했습니다"});
  }catch(err){
    res.json({msg : (err as Error).message})
  }
  
});

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  try{
    if(!(req.session && req.session.user))
    return res.send("로그인이 되어있지 않습니다.");

    req.session.destroy((err)=>{
      if(err) throw new Error("로그아웃 실패");
    })

    res.send("로그아웃 성공");
  }catch(err){
    res.json({msg :(err as Error).message})
  }
  
});

/**@ROUTER post parts */

router.get("/post", async(req: Request, res: Response, next: NextFunction) => {
  try{
    if(!(req.session && req.session.user)) throw new Error("로그인을 해세요")

    type postType = {

    }

    


  }catch(err){
    res.json({msg:(err as Error).message});
  }

});
router.post("/post", (req: Request, res: Response, next: NextFunction) => {});
router.delete("/post", (req: Request, res: Response, next: NextFunction) => {
  const postId = Number(req.query.postId);
});
router.put("/post", (req: Request, res: Response, next: NextFunction) => {
  const postId = Number(req.query.postId);
});

export default router;
