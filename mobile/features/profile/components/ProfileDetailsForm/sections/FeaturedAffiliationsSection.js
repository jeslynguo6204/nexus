import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '@/styles/themeNEW';
import { EditProfileSectionHeader } from '@/features/profile/components/form-editor-components';

function isDormAffiliationId(id, dorms) {
  const n = Number(id);
  return (dorms || []).some((d) => Number(d.id) === n);
}

export default function FeaturedAffiliationsSection({
  draft,
  setField,
  dorms,
  affiliationsByCategory,
}) {
  const selectedAffiliations = useMemo(() => {
    const map = new Map();
    Object.values(affiliationsByCategory || {}).forEach((list) => {
      (list || []).forEach((aff) => {
        if (!aff?.id) return;
        const id = Number(aff.id);
        if (isDormAffiliationId(id, dorms)) return;
        if (draft.affiliations.some((x) => Number(x) === id)) map.set(id, aff);
      });
    });
    const featuredIds = (draft.featuredAffiliations || []).map(Number);
    const featuredSet = new Set(featuredIds);
    const featured = featuredIds.map((id) => map.get(id)).filter(Boolean);
    const other = (draft.affiliations || [])
      .map((id) => Number(id))
      .filter((id) => !featuredSet.has(id))
      .map((id) => map.get(id))
      .filter(Boolean);
    return [...featured, ...other];
  }, [affiliationsByCategory, dorms, draft.affiliations, draft.featuredAffiliations]);

  const featuredSet = useMemo(
    () => new Set((draft.featuredAffiliations || []).map(Number)),
    [draft.featuredAffiliations]
  );

  if (!selectedAffiliations || selectedAffiliations.length === 0) return null;

  function toggleFeatured(id) {
    const curr = (draft.featuredAffiliations || []).map(Number);
    const exists = curr.some((x) => x === id);
    if (exists) {
      setField('featuredAffiliations', curr.filter((x) => x !== id));
      return;
    }
    const next = curr.length >= 2 ? [...curr.slice(1), id] : [...curr, id];
    setField('featuredAffiliations', next);
  }

  return (
    <>
      <EditProfileSectionHeader title="Key affiliations" />
      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 }}>
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textMuted,
            lineHeight: 18,
            marginBottom: 12,
          }}
        >
          Select up to 2 to feature.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -4,
          }}
        >
          {selectedAffiliations.map((aff) => {
            const id = Number(aff.id);
            const isSelected = featuredSet.has(id);
            const disabled =
              !isSelected && (draft.featuredAffiliations || []).length >= 2;
            return (
              <TouchableOpacity
                key={String(aff.id)}
                onPress={() => toggleFeatured(id)}
                disabled={disabled}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  marginRight: 8,
                  marginBottom: 8,
                  backgroundColor: isSelected
                    ? COLORS.textPrimary
                    : COLORS.backgroundSubtle,
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '400',
                    color: isSelected ? COLORS.surface : COLORS.textPrimary,
                  }}
                >
                  {aff.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}
