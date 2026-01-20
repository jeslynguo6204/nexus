import { Router } from "express";
import * as AffiliationsController from "./affiliations.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/categories", AffiliationsController.getCategories);
router.get(
  "/school/:schoolId",
  authMiddleware,
  AffiliationsController.getAffiliationsBySchool
);
router.get(
  "/school/:schoolId/dorms",
  authMiddleware,
  AffiliationsController.getDormsBySchool
);

// Authenticated routes (uses user's school)
router.get(
  "/me",
  authMiddleware,
  AffiliationsController.getMySchoolAffiliations
);
router.get("/me/dorms", authMiddleware, AffiliationsController.getMySchoolDorms);

export default router;

