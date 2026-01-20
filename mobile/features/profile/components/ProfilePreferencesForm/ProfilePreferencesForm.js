// // mobile/components/ProfilePreferencesForm.js

// import React, { useState } from 'react';
// import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { FontAwesome } from '@expo/vector-icons';
// import Slider from '@react-native-community/slider';
// import { COLORS } from '../../../../styles/themeNEW';

// const GENDER_OPTIONS = ['male', 'female', 'non-binary', 'everyone'];

// export default function ProfilePreferencesForm({ profile, onSave, onClose }) {
//   const insets = useSafeAreaInsets();
//   const [isDatingEnabled, setIsDatingEnabled] = useState(
//     profile.is_dating_enabled ?? true
//   );
//   const [isFriendsEnabled, setIsFriendsEnabled] = useState(
//     profile.is_friends_enabled ?? false
//   );

//   const [datingGenderPreference, setDatingGenderPreference] = useState(
//     profile.dating_gender_preference || 'everyone'
//   );
//   const [friendsGenderPreference, setFriendsGenderPreference] = useState(
//     profile.friends_gender_preference || 'everyone'
//   );

//   const [minAgePreference, setMinAgePreference] = useState(
//     profile.min_age_preference || 18
//   );
//   const [maxAgePreference, setMaxAgePreference] = useState(
//     profile.max_age_preference || 24
//   );

//   const initialDistanceMiles = profile.max_distance_km
//     ? Math.round(profile.max_distance_km / 1.60934)
//     : 5;
//   const [maxDistanceMiles, setMaxDistanceMiles] = useState(initialDistanceMiles);

//   function handleMinAgeChange(value) {
//     const newMin = Math.round(value);
//     setMinAgePreference(newMin);
//     if (newMin > maxAgePreference) setMaxAgePreference(newMin);
//   }

//   function handleMaxAgeChange(value) {
//     const newMax = Math.round(value);
//     setMaxAgePreference(newMax);
//     if (newMax < minAgePreference) setMinAgePreference(newMax);
//   }

//   function submit() {
//     // Convert miles to km and ensure it's an integer >= 1 (backend validation requirement)
//     const maxDistanceKm = Math.max(1, Math.round(maxDistanceMiles * 1.60934));
//     onSave({
//       isDatingEnabled,
//       isFriendsEnabled,
//       datingGenderPreference,
//       friendsGenderPreference,
//       minAgePreference,
//       maxAgePreference,
//       maxDistanceKm,
//     });
//   }

//   return (
//     <View style={[localStyles.container, { paddingTop: insets.top }]}>
//       {/* Minimal header */}
//       <View style={localStyles.header}>
//         <TouchableOpacity
//           onPress={onClose}
//           style={localStyles.headerButton}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <FontAwesome name="times" size={18} color={COLORS.textPrimary} />
//         </TouchableOpacity>
//         <View style={{ flex: 1 }} />
//         <TouchableOpacity
//           onPress={submit}
//           style={localStyles.saveButton}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Text style={localStyles.saveButtonText}>Save</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={localStyles.scrollView}
//         contentContainerStyle={localStyles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Modes */}
//         <View style={[localStyles.section, { marginTop: 24 }]}>
//           <Text style={localStyles.sectionTitle}>Modes</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <View style={localStyles.switchRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={localStyles.switchLabel}>Dating mode</Text>
//                 <Text style={localStyles.switchSubtext}>
//                   See and be seen by people looking to date
//                 </Text>
//               </View>
//               <Switch
//                 value={isDatingEnabled}
//                 onValueChange={setIsDatingEnabled}
//                 trackColor={{ false: COLORS.divider, true: COLORS.accentSoft }}
//                 thumbColor={isDatingEnabled ? COLORS.accent : COLORS.surface}
//               />
//             </View>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <View style={localStyles.switchRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={localStyles.switchLabel}>Friends mode</Text>
//                 <Text style={localStyles.switchSubtext}>
//                   See and be seen by people looking for friends
//                 </Text>
//               </View>
//               <Switch
//                 value={isFriendsEnabled}
//                 onValueChange={setIsFriendsEnabled}
//                 trackColor={{ false: COLORS.divider, true: COLORS.accentSoft }}
//                 thumbColor={isFriendsEnabled ? COLORS.accent : COLORS.surface}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Who you want to see */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Who you want to see</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Dating</Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={localStyles.chipRow}
//               contentContainerStyle={localStyles.chipRowContent}
//             >
//               {GENDER_OPTIONS.map((opt) => {
//                 const selected = datingGenderPreference === opt;
//                 return (
//                   <TouchableOpacity
//                     key={opt}
//                     onPress={() => setDatingGenderPreference(opt)}
//                     style={[localStyles.chip, selected && localStyles.chipSelected]}
//                   >
//                     <Text
//                       style={selected ? localStyles.chipTextSelected : localStyles.chipText}
//                     >
//                       {opt}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Friends</Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={localStyles.chipRow}
//               contentContainerStyle={localStyles.chipRowContent}
//             >
//               {GENDER_OPTIONS.map((opt) => {
//                 const selected = friendsGenderPreference === opt;
//                 return (
//                   <TouchableOpacity
//                     key={opt}
//                     onPress={() => setFriendsGenderPreference(opt)}
//                     style={[localStyles.chip, selected && localStyles.chipSelected]}
//                   >
//                     <Text
//                       style={selected ? localStyles.chipTextSelected : localStyles.chipText}
//                     >
//                       {opt}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>
//         </View>

//         {/* Age range */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Age range</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <View style={localStyles.sliderHeader}>
//               <Text style={localStyles.label}>Preferred ages</Text>
//               <Text style={localStyles.sliderValue}>
//                 {minAgePreference} – {maxAgePreference}
//               </Text>
//             </View>
//             <Text style={[localStyles.label, { marginTop: 16 }]}>Minimum age</Text>
//             <View style={localStyles.sliderContainer}>
//               <Slider
//                 minimumValue={18}
//                 maximumValue={40}
//                 step={1}
//                 value={minAgePreference}
//                 onValueChange={handleMinAgeChange}
//                 minimumTrackTintColor={COLORS.accent}
//                 maximumTrackTintColor={COLORS.accentSoft}
//                 thumbTintColor={COLORS.accent}
//               />
//             </View>
//             <Text style={[localStyles.label, { marginTop: 16 }]}>Maximum age</Text>
//             <View style={localStyles.sliderContainer}>
//               <Slider
//                 minimumValue={18}
//                 maximumValue={40}
//                 step={1}
//                 value={maxAgePreference}
//                 onValueChange={handleMaxAgeChange}
//                 minimumTrackTintColor={COLORS.accent}
//                 maximumTrackTintColor={COLORS.accentSoft}
//                 thumbTintColor={COLORS.accent}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Maximum distance */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Maximum distance</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <View style={localStyles.sliderHeader}>
//               <Text style={localStyles.label}>Show people within</Text>
//               <Text style={localStyles.sliderValue}>
//                 {maxDistanceMiles < 1 ? '< 1 mile' : `${maxDistanceMiles} miles`}
//               </Text>
//             </View>
//             <View style={localStyles.sliderContainer}>
//               <Slider
//                 minimumValue={0.5}
//                 maximumValue={50}
//                 step={0.5}
//                 value={maxDistanceMiles}
//                 onValueChange={(v) => setMaxDistanceMiles(Number(v.toFixed(1)))}
//                 minimumTrackTintColor={COLORS.accent}
//                 maximumTrackTintColor={COLORS.accentSoft}
//                 thumbTintColor={COLORS.accent}
//               />
//             </View>
//           </View>
//         </View>

//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const localStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.surface,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     backgroundColor: COLORS.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.divider,
//   },
//   headerButton: {
//     width: 32,
//     height: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   saveButton: {
//     paddingHorizontal: 4,
//     paddingVertical: 4,
//   },
//   saveButtonText: {
//     fontSize: 16,
//     fontWeight: '400',
//     color: COLORS.textPrimary,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingTop: 0,
//     paddingBottom: 40,
//   },
//   section: {
//     marginTop: 32,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: COLORS.textPrimary,
//     letterSpacing: -0.3,
//   },
//   fieldGroup: {
//     marginTop: 16,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '400',
//     color: COLORS.textMuted,
//     marginBottom: 8,
//     letterSpacing: 0,
//   },
//   switchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: COLORS.backgroundSubtle,
//     borderRadius: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//   },
//   switchLabel: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     fontWeight: '400',
//     marginBottom: 4,
//   },
//   switchSubtext: {
//     fontSize: 13,
//     color: COLORS.textMuted,
//     fontWeight: '400',
//     lineHeight: 18,
//   },
//   chipRow: {
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   chipRowContent: {
//     paddingRight: 20,
//   },
//   chip: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     borderWidth: 0,
//     backgroundColor: COLORS.backgroundSubtle,
//     marginRight: 8,
//   },
//   chipSelected: {
//     backgroundColor: COLORS.textPrimary,
//   },
//   chipText: {
//     fontSize: 15,
//     color: COLORS.textBody,
//     fontWeight: '400',
//   },
//   chipTextSelected: {
//     fontSize: 15,
//     fontWeight: '400',
//     color: COLORS.surface,
//   },
//   sliderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   sliderValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.textPrimary,
//   },
//   sliderContainer: {
//     backgroundColor: COLORS.backgroundSubtle,
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     marginTop: 8,
//   },
// });

// mobile/features/profile/components/ProfilePreferencesForm/ProfilePreferencesForm.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import { COLORS } from '@/styles/themeNEW';
import SelectionSheet from '@/features/profile/components/SelectionSheet';

import ModesSection from './sections/ModesSection';
import GenderPreferenceSection from './sections/GenderPreferenceSection';
import AgeRangeSection from './sections/AgeRangeSection';
import DistanceSection from './sections/DistanceSection';

import { preferencesFromProfile } from './utils/preferencesDraft';
import { buildPreferencesUpdatePayload } from './utils/preferencesPayload';

export default function ProfilePreferencesForm({ profile, onSave, onClose }) {
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState(() => preferencesFromProfile(profile));
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  // Optional: keep draft in sync if profile changes while mounted
  useEffect(() => {
    setDraft(preferencesFromProfile(profile));
  }, [profile]);

  // Selection sheet state (optional – only needed if you later switch some rows to use sheet)
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(null);

  const openSelectionSheet = (config) => {
    setSheetConfig(config);
    setSheetVisible(true);
  };

  const closeSelectionSheet = () => {
    setSheetVisible(false);
    setSheetConfig(null);
  };

  const headerRightDisabled = useMemo(() => false, []);

  function submit() {
    const payload = buildPreferencesUpdatePayload(profile, draft);
    onSave(payload);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface, paddingTop: insets.top }}>
      {/* Header (match ProfileDetailsForm) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
        >
          <FontAwesome name="times" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={submit}
          disabled={headerRightDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ paddingHorizontal: 4, paddingVertical: 4, opacity: headerRightDisabled ? 0.5 : 1 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '400', color: COLORS.textPrimary }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ModesSection draft={draft} setField={setField} />

        <GenderPreferenceSection draft={draft} setField={setField} />

        <AgeRangeSection draft={draft} setField={setField} />

        <DistanceSection draft={draft} setField={setField} />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Optional SelectionSheet (kept to mirror ProfileDetailsForm pattern) */}
      {sheetConfig && (
        <SelectionSheet
          visible={sheetVisible}
          title={sheetConfig.title}
          options={sheetConfig.options}
          selected={sheetConfig.selected}
          allowMultiple={sheetConfig.allowMultiple}
          allowUnselect={sheetConfig.allowUnselect}
          onSelect={sheetConfig.onSelect}
          onClose={closeSelectionSheet}
        />
      )}
    </View>
  );
}
