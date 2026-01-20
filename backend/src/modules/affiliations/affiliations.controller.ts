import { Request, Response, NextFunction } from "express";
import * as AffiliationsService from "./affiliations.service";
import { AuthedRequest } from "../../middleware/authMiddleware";

/**
 * GET /affiliations/categories
 * Get all affiliation categories
 */
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await AffiliationsService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /affiliations/school/:schoolId
 * Get affiliations for a specific school, optionally filtered by category
 * Query params: ?categoryId=123
 */
export async function getAffiliationsBySchool(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const schoolId = parseInt(req.params.schoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "Invalid school ID" });
    }

    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string, 10)
      : undefined;

    const affiliations = await AffiliationsService.getAffiliationsForSchool(
      schoolId,
      categoryId
    );
    res.json(affiliations);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /affiliations/school/:schoolId/dorms
 * Get dorms/residential houses for a specific school
 */
export async function getDormsBySchool(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const schoolId = parseInt(req.params.schoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "Invalid school ID" });
    }

    const dorms = await AffiliationsService.getDormsForSchool(schoolId);
    res.json(dorms);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /affiliations/me
 * Get affiliations for the authenticated user's school, grouped by category
 */
export async function getMySchoolAffiliations(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user's school_id from users table
    const { dbQuery } = await import("../../db/pool");
    const userRows = await dbQuery<{ school_id: number | null }>(
      `SELECT school_id FROM users WHERE id = $1`,
      [userId]
    );

    if (!userRows[0] || !userRows[0].school_id) {
      return res.status(400).json({ error: "User has no school assigned" });
    }

    const schoolId = userRows[0].school_id;
    const grouped = await AffiliationsService.getAffiliationsGroupedForSchool(
      schoolId
    );
    res.json(grouped);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /affiliations/me/dorms
 * Get dorms for the authenticated user's school
 */
export async function getMySchoolDorms(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user's school_id from users table
    const { dbQuery } = await import("../../db/pool");
    const userRows = await dbQuery<{ school_id: number | null }>(
      `SELECT school_id FROM users WHERE id = $1`,
      [userId]
    );

    if (!userRows[0] || !userRows[0].school_id) {
      return res.status(400).json({ error: "User has no school assigned" });
    }

    const schoolId = userRows[0].school_id;
    const dorms = await AffiliationsService.getDormsForSchool(schoolId);
    res.json(dorms);
  } catch (error) {
    next(error);
  }
}

