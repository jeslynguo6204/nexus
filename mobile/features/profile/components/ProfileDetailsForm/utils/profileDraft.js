// mobile/features/profile/components/ProfileDetailsForm/utils/profileDraft.js
export function normalizeId(id) {
  if (id === null || id === undefined) return null;
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const n = parseInt(id, 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function normalizeIdArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(normalizeId)
    .filter((x) => x !== null && Number.isInteger(x) && x > 0);
}

export function splitCsvToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function arrayToCsvOrNull(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.join(', ');
}

export function extractDormIdFromAffiliations(affiliations, dorms) {
  const ids = normalizeIdArray(affiliations);
  const dormIdSet = new Set((dorms || []).map((d) => normalizeId(d.id)).filter(Boolean));
  const dormId = ids.find((id) => dormIdSet.has(id));
  return dormId || null;
}

export function stripDormIds(affiliations, dorms) {
  const ids = normalizeIdArray(affiliations);
  const dormIdSet = new Set((dorms || []).map((d) => normalizeId(d.id)).filter(Boolean));
  return ids.filter((id) => !dormIdSet.has(id));
}

export function profileToDraft(profile) {
  return {
    // About
    bio: profile?.bio ?? '',
    prompts: '',

    // Identity
    displayName: profile?.display_name ?? '',
    gender: profile?.gender ?? '',
    pronouns: profile?.pronouns ?? '',
    sexuality: profile?.sexuality ?? '',

    // Academics
    academicYear: profile?.academic_year ?? '',
    graduationYear: profile?.graduation_year ? String(profile.graduation_year) : '',
    major: profile?.major ?? '',

    // Location
    locationDescription: profile?.location_description ?? '',
    hometown: profile?.hometown ?? '',
    languages: profile?.languages ?? '',
    locationLat: profile?.location_lat ?? '',
    locationLon: profile?.location_lon ?? '',

    // Personal
    height: profile?.height ? String(profile.height) : '',
    religiousBeliefs: splitCsvToArray(profile?.religious_beliefs),
    politicalAffiliation: profile?.political_affiliation ?? '',
    ethnicity: splitCsvToArray(profile?.ethnicity),

    // Affiliations
    affiliations: normalizeIdArray(profile?.affiliations),
    dormId: null,

    // Featured
    featuredAffiliations: normalizeIdArray(profile?.featured_affiliations),
  };
}
