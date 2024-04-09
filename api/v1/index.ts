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
    try{
        if(!(req.session && req.session.user)) throw new Error("로그인을 하세요")
        
        const userId = req.params.userid;
        const connection = await connectionPool.getConnection();
        const [userDetails, fields] = await connection.query(`
            SELECT *FROM owners
            WHERE userid = ?`,
            [userId ]) as [userType[], object];
        
        if(userDetails.length === 0) throw new Error("회원 정보가 없습니다");

        res.json({userDetails : userDetails[0]});
    }catch(err){
        res.json({msg:(err as Error).message});
    }
});

 // JOIN with my Platform
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
type postType = {
    userid : string,
    content : string,
    createAt : string
}

router.get("/post", async(req: Request, res: Response, next: NextFunction) => {
    try{
        if(!req.session || !req.session.user) throw new Error("로그인을 하세요")
        
        const connection = await connectionPool.getConnection();
        const [posts, fields] = await connection.query("SELECT *FROM posts") as [postType[], object];

        console.log(posts);

        if(posts.length === 0) throw new Error("조회된 게시글이 없습니다");

        res.json(posts);
    }catch(err){
        res.status(500).json({msg:(err as Error).message});
    }

});
router.post("/post/:userid", async (req: Request, res: Response, next: NextFunction) => {
    
});
//TODO: 삭제 및 업데이트는 게시글의 작성자아이디와 로그인 된 아이디 확인하기
//TODO: 일단 기능만 구현
router.delete("/post", async (req: Request, res: Response, next: NextFunction) => {
    try{
        const postId= Number(req.body.postid);

        const connection = await connectionPool.getConnection()
        const [post, fields] = await connection.query(`
            SELECT *FROM posts
            WHERE postid = ?`, [postId]) as [postType[], object];

        if(post.length === 0) throw new Error("존재하지 않은 게시글 입니다.");
        
        await connection.query(`
            DELETE FROM posts
            WHERE postid = ?`,[postId]);
        res.json({msg : "게시글을 삭제했습니다"});
    }catch(err){
        res.status(500).json({msg:(err as Error).message});
    }
    
});
router.put("/post", async (req: Request, res: Response, next: NextFunction) => {
    try{
        const updatePostInfo = req.body;
        const postId = updatePostInfo.postid;
        const newContent = updatePostInfo.content;

        const connection = await connectionPool.getConnection();
        const [posts, fields] = await connection.query(`
            SELECT *FROM posts
            WHERE postid = ?`,[postId]) as [postType[], object];

        if(posts.length === 0) throw new Error("게시글이 존재하지 않습니다");

        await connection.query(`
            UPDATE posts
            SET content = ?
            WHERE postid = ?`,[newContent, postId] ) 

        res.json({msg : "수정을 완료했습니다"})
    
    }catch(err){
        res.json({msg : (err as Error).message});
    }
});

export default router;