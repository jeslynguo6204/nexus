// mobile/features/profile/components/ProfileDetailsForm/sections/AffiliationsSection.js
import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';
import {
  FormSection,
  FormField,
  FormSelectRow,
} from '@/features/profile/components/form-editor-components';

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
  return (
    <FormSection title="Affiliations">
      {loading ? (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' }}>
            Loading affiliations…
          </Text>
        </View>
      ) : sortedAffiliationEntries.length === 0 ? (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' }}>
            No affiliations available for your school.
          </Text>
        </View>
      ) : (
        <>
          {sortedAffiliationEntries.map(([categoryName, categoryAffiliations]) => {
            const nonDormOptions = (categoryAffiliations || []).filter(
              (a) => !isDormAffiliationId(a?.id, dorms)
            );
            if (nonDormOptions.length === 0) return null;

            const single = categoryIsSingleSelect(categoryName);

            // selected within this category
            const selectedForCategory = single
              ? (draft.affiliations.find((id) => nonDormOptions.some((a) => Number(a.id) === Number(id))) || null)
              : draft.affiliations.filter((id) => nonDormOptions.some((a) => Number(a.id) === Number(id)));

            const displayValue = single
              ? (selectedForCategory
                  ? (nonDormOptions.find((a) => Number(a.id) === Number(selectedForCategory))?.name || '')
                  : '')
              : (Array.isArray(selectedForCategory) && selectedForCategory.length > 0
                  ? selectedForCategory
                      .map((id) => nonDormOptions.find((a) => Number(a.id) === Number(id))?.name)
                      .filter(Boolean)
                      .join(', ')
                  : '');

            return (
              <FormField key={categoryName} label={categoryName}>
                <FormSelectRow
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
                        // remove this category's ids from draft.affiliations
                        const otherIds = draft.affiliations.filter(
                          (id) => !nonDormOptions.some((a) => Number(a.id) === Number(id))
                        );

                        if (single) {
                          if (value) setField('affiliations', [...otherIds, Number(value)]);
                          else setField('affiliations', otherIds);
                        } else {
                          const nextIds = Array.isArray(value) ? value.map(Number) : (value ? [Number(value)] : []);
                          setField('affiliations', [...otherIds, ...nextIds]);
                        }
                      },
                    })
                  }
                />
              </FormField>
            );
          })}

          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', lineHeight: 18 }}>
              Remember, this isn't a resume. Select as many affiliations as you like, then choose up to two to feature.
            </Text>
          </View>
        </>
      )}
    </FormSection>
  );
}
