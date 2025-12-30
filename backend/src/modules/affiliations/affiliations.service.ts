import * as AffiliationsDao from "./affiliations.dao";

export async function getCategories() {
  return await AffiliationsDao.getAffiliationCategories();
}

export async function getAffiliationsForSchool(
  schoolId: number,
  categoryId?: number
) {
  return await AffiliationsDao.getAffiliationsBySchool(schoolId, categoryId);
}

export async function getDormsForSchool(schoolId: number) {
  return await AffiliationsDao.getDormsBySchool(schoolId);
}

export async function getAffiliationsGroupedForSchool(schoolId: number) {
  return await AffiliationsDao.getAffiliationsGroupedByCategory(schoolId);
}

