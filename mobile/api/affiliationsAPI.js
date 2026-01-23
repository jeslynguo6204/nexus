// mobile/api/affiliationsAPI.js
import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

/**
 * Get all affiliation categories
 */
export async function getAffiliationCategories(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/affiliations/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch affiliation categories");
  }

  return json;
}

/**
 * Get affiliations for a specific school, optionally filtered by category
 */
export async function getAffiliationsBySchool(token, schoolId, categoryId) {
  const API_BASE = getApiBase();
  let url = `${API_BASE}/affiliations/school/${schoolId}`;
  if (categoryId) {
    url += `?categoryId=${categoryId}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch affiliations");
  }

  return json;
}

/**
 * Get dorms for a specific school
 */
export async function getDormsBySchool(token, schoolId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/affiliations/school/${schoolId}/dorms`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch dorms");
  }

  return json;
}

/**
 * Get affiliations for the authenticated user's school, grouped by category
 */
export async function getMySchoolAffiliations(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/affiliations/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch affiliations");
  }

  return json;
}

/**
 * Get dorms for the authenticated user's school
 */
export async function getMySchoolDorms(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/affiliations/me/dorms`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch dorms");
  }

  return json;
}

