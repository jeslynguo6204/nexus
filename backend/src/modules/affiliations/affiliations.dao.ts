import { dbQuery } from "../../db/pool";

export interface AffiliationCategory {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Affiliation {
  id: number;
  name: string;
  description: string | null;
  school_id: number | null;
  category_id: number;
  category_name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all affiliation categories
 */
export async function getAffiliationCategories(): Promise<AffiliationCategory[]> {
  const rows = await dbQuery<AffiliationCategory>(
    `
    SELECT id, name, description, created_at, updated_at
    FROM affiliation_categories
    ORDER BY name ASC
    `
  );
  return rows;
}

/**
 * Get affiliations for a specific school, optionally filtered by category
 */
export async function getAffiliationsBySchool(
  schoolId: number,
  categoryId?: number
): Promise<Affiliation[]> {
  let query = `
    SELECT 
      a.id,
      a.name,
      a.description,
      a.school_id,
      a.category_id,
      ac.name AS category_name,
      a.created_at,
      a.updated_at
    FROM affiliations a
    JOIN affiliation_categories ac ON ac.id = a.category_id
    WHERE (a.school_id = $1 OR a.school_id IS NULL)
  `;
  
  const params: (number | null)[] = [schoolId];
  
  if (categoryId !== undefined) {
    query += ` AND a.category_id = $2`;
    params.push(categoryId);
  }
  
  query += ` ORDER BY ac.name ASC, a.name ASC`;
  
  const rows = await dbQuery<Affiliation>(query, params);
  return rows;
}

/**
 * Get dorms/residential houses for a specific school
 * Assumes dorms are in affiliations table with a specific category or naming pattern
 */
export async function getDormsBySchool(schoolId: number): Promise<Affiliation[]> {
  // Assuming there's a category for dorms or we can identify them by name pattern
  // You may need to adjust this query based on your actual schema
  const rows = await dbQuery<Affiliation>(
    `
    SELECT 
      a.id,
      a.name,
      a.description,
      a.school_id,
      a.category_id,
      ac.name AS category_name,
      a.created_at,
      a.updated_at
    FROM affiliations a
    JOIN affiliation_categories ac ON ac.id = a.category_id
    WHERE (a.school_id = $1 OR a.school_id IS NULL)
      AND (LOWER(ac.name) LIKE '%dorm%' 
           OR LOWER(ac.name) LIKE '%residential%'
           OR LOWER(ac.name) LIKE '%housing%'
           OR LOWER(a.name) LIKE '%dorm%'
           OR LOWER(a.name) LIKE '%house%')
    ORDER BY a.name ASC
    `,
    [schoolId]
  );
  return rows;
}

/**
 * Get affiliations grouped by category for a school
 */
export async function getAffiliationsGroupedByCategory(
  schoolId: number
): Promise<Record<string, Affiliation[]>> {
  const affiliations = await getAffiliationsBySchool(schoolId);
  
  const grouped: Record<string, Affiliation[]> = {};
  for (const aff of affiliations) {
    const categoryName = aff.category_name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(aff);
  }
  
  return grouped;
}

