import { NextFunction, Request, Response, Router } from "express";
import { connectionPool } from "../../configs/db.config";
import {isAuthenticated, authenticateError} from "../../middleware/authenticate.middleware";


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

    connection.release();

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

router.post("/logout", 
    isAuthenticated,
    (req: Request, res: Response, next: NextFunction) => {
    try{
        req.session.destroy((err)=>{
            if(err) throw new Error("로그아웃 실패");
        })

        res.send("로그아웃 성공");
    }catch(err){
        res.json({msg : (err as Error).message});
    }
});

router.get("/user", 
    isAuthenticated,
    (req: Request, res: Response, next: NextFunction) => {
    try{
        res.json({username : req.session.user?.username});
    }catch(err){ 
        
    }
});

 //TODO: Find user details
router.get("/user/:userid",
    isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
    try{
        const userId = req.params.userid;
        const connection = await connectionPool.getConnection();
        const [userDetails, fields] = await connection.query(`
            SELECT *FROM owners
            WHERE userid = ?`,
            [userId ]) as [userType[], object];
        
        if(userDetails.length === 0) throw new Error("회원 정보가 없습니다");

        res.json({userDetails : userDetails[0]});
        connection.release();
    }catch(err){
        res.json({msg:(err as Error).message});
    }
});

 // JOIN with my Platform
router.post("/user", async (req: Request, res: Response, next: NextFunction) => {
    type newUserType = {
        userid : string,
        userpw : string,
        username : string
    }

    const connection = await connectionPool.getConnection();
    await connection.beginTransaction();

    try{
        const newUser = req.body as newUserType;

        const [users, fields] = await connection.query(`
        SELECT *from owners 
            WHERE userid = ?
        `,[newUser.userid]) as [userType[], object]

        if(users.length !== 0) throw new Error("이미 존재하는 회원입니다.");
        
        await connection.query(`
            INSERT INTO owners (userid, userpw, username) 
            VALUES (?, ?, ?)`,
            [newUser.userid, newUser.userpw, newUser.username])
        connection.release();
        
        res.json({msg :"회원가입에 성공했습니다"});

        await connection.commit();
    }catch(err){
        res.json({msg : (err as Error).message})
        await connection.rollback();
    } 
});


/**@ROUTER post parts */
type postType = {
    userid : string,
    content : string,
    createAt : string
}

router.get("/post", isAuthenticated, async(req: Request, res: Response, next: NextFunction) => {
    try{
        const connection = await connectionPool.getConnection();
        const [posts, fields] = await connection.query("SELECT *FROM posts") as [postType[], object];
        connection.release();

        console.log(posts);

        if(posts.length === 0) throw new Error("조회된 게시글이 없습니다");

        res.json(posts);
    }catch(err){
        res.status(500).json({msg:(err as Error).message});
    }

});
router.post("/post/:userid", isAuthenticated ,async (req: Request, res: Response, next: NextFunction) => {
    //TODO: 게시글 작성
    try{
        const newContent = req.body.content;
        const user = req.params;

        const connection = await connectionPool.getConnection();
        connection.query(`
        INSERT INTO posts (userid, content) VALUES ("?","?")`,
        [user,newContent]);
        
        connection.release();
        
        res.send("게시글을 성공적으로 게시했습니다")
    }catch(err){
        res.send({msg : (err as Error).message});
    }
});

router.delete("/post", async (req: Request, res: Response, next: NextFunction) => {
    const connection = await connectionPool.getConnection();
    await connection.beginTransaction();

    try{
        const postId= Number(req.body.postid);

        const [post, fields] = await connection.query(`
            SELECT *FROM posts
            WHERE postid = ?`, [postId]) as [postType[], object];
        const postUserId = post[0].userid;

        if(post.length === 0) throw new Error("존재하지 않은 게시글 입니다.");
        if(!(postUserId === req.session.user?.userid)) throw new Error ("게시글의 작성자만 삭제 가능합니다.");
        
        await connection.query(`
        DELETE FROM posts
        WHERE postid = ?`,[postId]);

        connection.release();

        res.json({msg : "게시글을 삭제했습니다"});
        await connection.commit();
    }catch(err){
        res.status(500).json({msg:(err as Error).message});
        await connection.rollback();
    }
});
router.put("/post", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try{
        const updatePostInfo = req.body;
        const postId = updatePostInfo.postid;
        const newContent = updatePostInfo.content;

        const connection = await connectionPool.getConnection();
        const [posts, fields] = await connection.query(`
            SELECT *FROM posts
            WHERE postid = ?`,[postId]) as [postType[], object];
        const postUserId = posts[0].userid;

        if(posts.length === 0) throw new Error("게시글이 존재하지 않습니다");
        if(!(postUserId === req.session.user?.userid)) throw new Error("게시글의 작성자만 수정을 할 수 있습니다.");

        await connection.query(`
            UPDATE posts
            SET content = ?
            WHERE postid = ?`,[newContent, postId] ) 
        
            connection.release();

        res.json({msg : "수정을 완료했습니다"})
    }catch(err){
        res.json({msg : (err as Error).message});
    }
});

export default router;