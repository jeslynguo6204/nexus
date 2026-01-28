// mobile/features/profile/components/ProfileDetailsForm/utils/profilePayload.js
import { arrayToCsvOrNull, normalizeId, normalizeIdArray } from './profileDraft';

function trimOrNull(s) {
  const t = (s ?? '').trim();
  return t === '' ? null : t;
}

function parseGradYearOrNull(s) {
  const t = (s ?? '').trim();
  if (t === '') return null;
  const n = Number(t);
  if (!Number.isInteger(n) || n < 2020 || n > 2040) return null;
  return n;
}

function parseHeightOrNull(s) {
  const t = (s ?? '').trim();
  if (t === '') return null;
  const n = parseFloat(t);
  if (Number.isNaN(n) || n < 0 || n > 300) return null;
  return n;
}

function uniqueInts(arr) {
  const out = [];
  const seen = new Set();
  for (const v of normalizeIdArray(arr)) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function cleanTags(arr) {
  const list = Array.isArray(arr) ? arr : [];
  const cleaned = list
    .map((s) => String(s || '').trim())
    .filter((s) => s.length > 0);
  // de-duplicate preserving order
  const out = [];
  const seen = new Set();
  for (const s of cleaned) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out.slice(0, 3);
}

function arraysEqual(a, b) {
  const aa = Array.isArray(a) ? a : [];
  const bb = Array.isArray(b) ? b : [];
  if (aa.length !== bb.length) return false;
  for (let i = 0; i < aa.length; i++) {
    if (String(aa[i]) !== String(bb[i])) return false;
  }
  return true;
}

export function buildProfileUpdatePayload(profile, draft) {
  const payload = {};

  const nextDisplayName = trimOrNull(draft.displayName);
  if ((profile?.display_name ?? null) !== nextDisplayName) payload.displayName = nextDisplayName;

  const nextBio = trimOrNull(draft.bio);
  if ((profile?.bio ?? null) !== nextBio) payload.bio = nextBio;

  const nextMajor = trimOrNull(draft.major);
  if ((profile?.major ?? null) !== nextMajor) payload.major = nextMajor;

  const nextGradYear = parseGradYearOrNull(draft.graduationYear);
  if ((profile?.graduation_year ?? null) !== nextGradYear) payload.graduationYear = nextGradYear;

  const nextAcademicYear = trimOrNull(draft.academicYear);
  if ((profile?.academic_year ?? null) !== nextAcademicYear) payload.academicYear = nextAcademicYear;

  const nextGender = trimOrNull(draft.gender);
  if ((profile?.gender ?? null) !== nextGender) payload.gender = nextGender;

  const nextPronouns = trimOrNull(draft.pronouns);
  if ((profile?.pronouns ?? null) !== nextPronouns) payload.pronouns = nextPronouns;

  const nextSexuality = trimOrNull(draft.sexuality);
  if ((profile?.sexuality ?? null) !== nextSexuality) payload.sexuality = nextSexuality;

  const nextLocationDesc = trimOrNull(draft.locationDescription);
  if ((profile?.location_description ?? null) !== nextLocationDesc) payload.locationDescription = nextLocationDesc;

  const nextLat = trimOrNull(draft.locationLat);
  if ((profile?.location_lat ?? null) !== nextLat) payload.locationLat = nextLat;

  const nextLon = trimOrNull(draft.locationLon);
  if ((profile?.location_lon ?? null) !== nextLon) payload.locationLon = nextLon;

  const nextHometown = trimOrNull(draft.hometown);
  if ((profile?.hometown ?? null) !== nextHometown) payload.hometown = nextHometown;

  const nextLanguages = trimOrNull(draft.languages);
  if ((profile?.languages ?? null) !== nextLanguages) payload.languages = nextLanguages;

  const nextHeight = parseHeightOrNull(draft.height);
  if ((profile?.height ?? null) !== nextHeight) payload.height = nextHeight;

  const nextReligious = arrayToCsvOrNull(draft.religiousBeliefs);
  if ((profile?.religious_beliefs ?? null) !== nextReligious) payload.religiousBeliefs = nextReligious;

  const nextEthnicity = arrayToCsvOrNull(draft.ethnicity);
  if ((profile?.ethnicity ?? null) !== nextEthnicity) payload.ethnicity = nextEthnicity;

  const nextPolitical = trimOrNull(draft.politicalAffiliation);
  if ((profile?.political_affiliation ?? null) !== nextPolitical) payload.politicalAffiliation = nextPolitical;

  // affiliations: combine non-dorm + dormId
  const combinedAffiliations = uniqueInts([
    ...normalizeIdArray(draft.affiliations),
    normalizeId(draft.dormId),
  ].filter(Boolean));

  const originalAff = normalizeIdArray(profile?.affiliations).slice().sort((a, b) => a - b);
  const nextAff = combinedAffiliations.slice().sort((a, b) => a - b);
  if (JSON.stringify(originalAff) !== JSON.stringify(nextAff)) {
    payload.affiliations = combinedAffiliations; // send [] to clear
  }

  // featured affiliations (preserve order)
  const cleanedFeatured = normalizeIdArray(draft.featuredAffiliations);
  const originalFeatured = normalizeIdArray(profile?.featured_affiliations);
  if (JSON.stringify(originalFeatured) !== JSON.stringify(cleanedFeatured)) {
    payload.featuredAffiliations = cleanedFeatured.length > 0 ? cleanedFeatured : null;
  }

  // likes / dislikes (up to 3, trimmed, non-empty)
  const nextLikes = cleanTags(draft.likes);
  if (!arraysEqual(profile?.likes, nextLikes)) {
    payload.likes = nextLikes.length > 0 ? nextLikes : null;
  }

  const nextDislikes = cleanTags(draft.dislikes);
  if (!arraysEqual(profile?.dislikes, nextDislikes)) {
    payload.dislikes = nextDislikes.length > 0 ? nextDislikes : null;
  }

  return payload;
}
