import { NextFunction, Request, Response, Router } from "express";

const router: Router = Router();

/**@ROUTER user parts */
router.post("/login", (req: Request, res: Response, next: NextFunction) => {});
router.post("/logout", (req: Request, res: Response, next: NextFunction) => {});
router.get("/user", (req: Request, res: Response, next: NextFunction) => {});
router.get("/user", (req: Request, res: Response, next: NextFunction) => {}); // Find user details
router.post("/user", (req: Request, res: Response, next: NextFunction) => {}); // JOIN with my Platform
router.get("/logout", (req: Request, res: Response, next: NextFunction) => {});

/**@ROUTER post parts */
router.get("/post", (req: Request, res: Response, next: NextFunction) => {});
router.post("/post", (req: Request, res: Response, next: NextFunction) => {});
router.delete("/post", (req: Request, res: Response, next: NextFunction) => {
  const postId = Number(req.query.postId);
});
router.put("/post", (req: Request, res: Response, next: NextFunction) => {
  const postId = Number(req.query.postId);
});

export default router;
