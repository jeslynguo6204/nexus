import { Router } from "express";
import * as AuthController from "./auth.controller";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/check-email", AuthController.checkEmail);

export default router;