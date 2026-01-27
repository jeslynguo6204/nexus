import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';
import {
  EditProfileRow,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';

function isDormAffiliationId(id, dorms) {
  const n = Number(id);
  return (dorms || []).some((d) => Number(d.id) === n);
}

function categoryIsSingleSelect(categoryName) {
  const lower = String(categoryName || '').toLowerCase();
  return lower.includes('greek') || lower.includes('house');
}

export default function AffiliationsSection({
  draft,
  setField,
  dorms,
  loading,
  sortedAffiliationEntries,
  openSelectionSheet,
}) {
  if (loading) {
    return (
      <EditProfileRow label="Affiliations">
        <Text style={{ fontSize: 16, color: COLORS.textMuted }}>Loading…</Text>
      </EditProfileRow>
    );
  }

  if (sortedAffiliationEntries.length === 0) {
    return (
      <EditProfileRow label="Affiliations">
        <Text style={{ fontSize: 16, color: COLORS.textMuted }}>None available</Text>
      </EditProfileRow>
    );
  }

  return (
    <>
      {sortedAffiliationEntries.map(([categoryName, categoryAffiliations]) => {
        const nonDormOptions = (categoryAffiliations || []).filter(
          (a) => !isDormAffiliationId(a?.id, dorms)
        );
        if (nonDormOptions.length === 0) return null;

        const single = categoryIsSingleSelect(categoryName);
        const selectedForCategory = single
          ? (draft.affiliations.find((id) =>
              nonDormOptions.some((a) => Number(a.id) === Number(id))
            ) || null)
          : draft.affiliations.filter((id) =>
              nonDormOptions.some((a) => Number(a.id) === Number(id))
            );

        const displayValue = single
          ? (selectedForCategory
              ? (nonDormOptions.find((a) => Number(a.id) === Number(selectedForCategory))?.name ||
                '')
              : '')
          : Array.isArray(selectedForCategory) && selectedForCategory.length > 0
          ? selectedForCategory
              .map((id) =>
                nonDormOptions.find((a) => Number(a.id) === Number(id))?.name
              )
              .filter(Boolean)
              .join(', ')
          : '';

        return (
          <EditProfileRow
            key={categoryName}
            label={categoryName}
            value={displayValue}
            placeholder="Not selected"
            onPress={() =>
              openSelectionSheet({
                title: categoryName,
                options: nonDormOptions,
                selected: selectedForCategory,
                allowMultiple: !single,
                allowUnselect: true,
                onSelect: (value) => {
                  const otherIds = draft.affiliations.filter(
                    (id) => !nonDormOptions.some((a) => Number(a.id) === Number(id))
                  );
                  if (single) {
                    if (value) setField('affiliations', [...otherIds, Number(value)]);
                    else setField('affiliations', otherIds);
                  } else {
                    const nextIds = Array.isArray(value)
                      ? value.map(Number)
                      : value ? [Number(value)] : [];
                    setField('affiliations', [...otherIds, ...nextIds]);
                  }
                },
              })
            }
          />
        );
      })}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 18 }}>
          Select as many as you like, then choose up to two to feature.
        </Text>
      </View>
      <View style={editProfileStyles.rowDivider} />
    </>
  );
}
