import { Router } from "express";
import * as AuthController from "./auth.controller";
import { cognitoVerifyMiddleware } from "../../middleware/cognitoVerifyMiddleware";
import { rateLimitCleanup } from "../../middleware/rateLimitCleanup";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/check-email", AuthController.checkEmail);
router.post("/cleanup-signup", rateLimitCleanup, cognitoVerifyMiddleware, AuthController.cleanupSignup);
router.get("/status", cognitoVerifyMiddleware, AuthController.status);

export default router;
