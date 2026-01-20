// mobile/features/profile/components/ProfileDetailsForm/utils/affiliations.js
export function sortAffiliationCategories(categoriesObj) {
  const categories = categoriesObj || {};

  const categoryOrder = [
    'House',
    'School',
    'Academic Programs',
    'Greek Life',
    'Pre-Professional Greek Life',
    'Varsity Athletics',
    'Club Sports',
    'Senior Society',
    'Publications',
    'Student Government',
    'Consulting Clubs',
    'Business Clubs',
    'Engineering Clubs',
  ];

  const orderMap = new Map();
  categoryOrder.forEach((cat, index) => orderMap.set(cat.toLowerCase(), index));

  return Object.entries(categories).sort(([a], [b]) => {
    const oa = orderMap.get(String(a).toLowerCase());
    const ob = orderMap.get(String(b).toLowerCase());

    if (oa !== undefined && ob !== undefined) return oa - ob;
    if (oa !== undefined) return -1;
    if (ob !== undefined) return 1;
    return String(a).localeCompare(String(b));
  });
}
