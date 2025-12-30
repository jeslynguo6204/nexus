// mobile/components/ProfileDetailsForm.js

/**
 * ProfileDetailsForm is a reusable form component for editing a user's basic profile 
 * information, such as their display name, bio, major, and graduation year.
 * 
 * It is used within the ProfileScreen to allow users to edit their own profile 
 * details. When the form is submitted, it calls the onSave prop with the updated
 * profile fields, which the ProfileScreen handles by making an API call to update 
 * the user's profile on the server.
 * 
 * The form is pre-populated with the user's current profile details, which are 
 * passed in as the profile prop. It uses reusable input components and styles from 
 * the ProfileFormStyles module to maintain a consistent look and feel with other 
 * forms in the app.
 * 
 * Overall, this component plays a crucial role in allowing users to personalize 
 * their profiles, which are a central part of the app's functionality and user 
 * experience.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../styles/themeNEW';
import { getMySchoolDorms, getMySchoolAffiliations } from '../api/affiliationsAPI';
import SelectionSheet from './SelectionSheet';

// Optional location import - gracefully handle if not installed
let Location = null;
try {
  Location = require('expo-location');
} catch (e) {
  // expo-location not installed, location features will be disabled
}

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const PRONOUN_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Any pronouns'];
const SEXUALITY_OPTIONS = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Prefer not to say'];
const DATING_INTENTIONS = ['Romantic', 'Platonic', 'Both'];
const RELIGIOUS_OPTIONS = ['Christian', 'Catholic', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Agnostic', 'Atheist', 'Spiritual', 'Other', 'Prefer not to say'];
const POLITICAL_OPTIONS = ['Very Liberal', 'Liberal', 'Moderate', 'Conservative', 'Very Conservative', 'Libertarian', 'Other', 'Prefer not to say'];
const ETHNICITY_OPTIONS = ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latino', 'Middle Eastern or North African', 'Native Hawaiian or Other Pacific Islander', 'White', 'Other', 'Prefer not to say'];

export default function ProfileDetailsForm({ profile, onSave, onClose }) {
  const insets = useSafeAreaInsets();
  
  // About Me
  const [bio, setBio] = useState(profile.bio || '');
  const [prompts, setPrompts] = useState(''); // Placeholder
  
  // Identity
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [gender, setGender] = useState(profile.gender || ''); // Placeholder
  const [pronouns, setPronouns] = useState(''); // Placeholder
  const [sexuality, setSexuality] = useState(''); // Placeholder
  
  // Academics
  const [academicYear, setAcademicYear] = useState(profile.academic_year || null);
  const [graduationYear, setGraduationYear] = useState(
    profile.graduation_year ? String(profile.graduation_year) : ''
  );
  const [major, setMajor] = useState(profile.major || '');
  
  // Location & Background
  const [locationDescription, setLocationDescription] = useState(profile.location_description || '');
  const [hometown, setHometown] = useState(''); // Placeholder
  const [languages, setLanguages] = useState(''); // Placeholder
  const [locationLat, setLocationLat] = useState(profile.location_lat || '');
  const [locationLon, setLocationLon] = useState(profile.location_lon || '');
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Personal Details
  const [height, setHeight] = useState(''); // Placeholder
  const [religiousBeliefs, setReligiousBeliefs] = useState([]); // Array for multiple selections
  const [politicalAffiliation, setPoliticalAffiliation] = useState(''); // Single selection
  const [ethnicity, setEthnicity] = useState([]); // Array for multiple selections
  
  // Affiliations
  const [affiliations, setAffiliations] = useState(
    profile.affiliations && Array.isArray(profile.affiliations) ? profile.affiliations : []
  );
  const [dorm, setDorm] = useState(null); // Single dorm selection
  const [dorms, setDorms] = useState([]);
  const [affiliationsByCategory, setAffiliationsByCategory] = useState({});
  const [loadingAffiliations, setLoadingAffiliations] = useState(true);
  
  // Selection sheet state
  const [selectionSheetVisible, setSelectionSheetVisible] = useState(false);
  const [selectionSheetConfig, setSelectionSheetConfig] = useState(null);
  
  // Interests
  const [interests, setInterests] = useState(''); // Placeholder - will be handled separately later
  
  // Dating Intentions
  const [datingIntentions, setDatingIntentions] = useState(''); // Placeholder

  const schoolLabel =
    profile?.school?.name ||
    profile?.school_name ||
    profile?.school?.short_name ||
    'School not set';
  
  const schoolId = profile?.school?.id || profile?.school_id;

  // Fetch dorms and affiliations on mount
  useEffect(() => {
    (async () => {
      if (!schoolId) {
        setLoadingAffiliations(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setLoadingAffiliations(false);
          return;
        }

        // Fetch dorms and affiliations in parallel
        const [dormsData, affiliationsData] = await Promise.all([
          getMySchoolDorms(token).catch((err) => {
            console.warn('Error fetching dorms:', err);
            return [];
          }),
          getMySchoolAffiliations(token).catch((err) => {
            console.warn('Error fetching affiliations:', err);
            return {};
          })
        ]);

        console.log('Dorms data:', dormsData);
        console.log('Affiliations data:', affiliationsData);
        console.log('Affiliation categories:', Object.keys(affiliationsData));

        setDorms(dormsData);
        setAffiliationsByCategory(affiliationsData);

        // Set initial dorm if user has one selected (check if any affiliation ID matches a dorm)
        // This is a simple check - you may need to adjust based on your data structure
        if (affiliations.length > 0 && dormsData.length > 0) {
          const matchingDorm = dormsData.find(d => affiliations.includes(d.id));
          if (matchingDorm) {
            setDorm(matchingDorm.id);
          }
        }
      } catch (error) {
        console.warn('Failed to load affiliations:', error);
      } finally {
        setLoadingAffiliations(false);
      }
    })();
  }, [schoolId]);

  async function getCurrentLocation() {
    if (!Location) {
      Alert.alert(
        'Location unavailable',
        'Location services are not available. Please install expo-location or enter coordinates manually.'
      );
      return;
    }

    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to use your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocationLat(String(location.coords.latitude));
      setLocationLon(String(location.coords.longitude));
      
      // Optionally reverse geocode to get a description
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (address) {
          const desc = [address.street, address.city, address.region]
            .filter(Boolean)
            .join(', ');
          if (desc) setLocationDescription(desc);
        }
      } catch (e) {
        // Geocoding failed, that's okay
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get your location. Please enter it manually.');
      console.warn('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  }

  function toggleAffiliation(affiliationId) {
    setAffiliations((prev) => {
      if (prev.includes(affiliationId)) {
        return prev.filter((id) => id !== affiliationId);
      } else {
        return [...prev, affiliationId];
      }
    });
  }

  function toggleDorm(dormId) {
    // Normalize dorm ID for comparison
    const normalizedDormId = typeof dormId === 'string' ? parseInt(dormId, 10) : dormId;
    const normalizedCurrentDorm = typeof dorm === 'string' ? parseInt(dorm, 10) : dorm;
    
    // Remove old dorm from affiliations if it exists
    setAffiliations((prev) => {
      const withoutOldDorm = prev.filter((id) => {
        const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
        return !dorms.some(d => {
          const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
          return dId === normalizedId && dId !== normalizedDormId;
        });
      });
      // Add new dorm if selected, otherwise just return without old dorm
      if (normalizedDormId && normalizedDormId !== normalizedCurrentDorm) {
        return [...withoutOldDorm, normalizedDormId];
      }
      return withoutOldDorm;
    });
    setDorm(normalizedDormId === normalizedCurrentDorm ? null : normalizedDormId);
  }

  // Helper functions for selection sheets
  function openSelectionSheet(config) {
    setSelectionSheetConfig(config);
    setSelectionSheetVisible(true);
  }

  function closeSelectionSheet() {
    setSelectionSheetVisible(false);
    setSelectionSheetConfig(null);
  }

  function getSelectedDisplayName(selected, options, allowMultiple = false) {
    if (!selected) return 'Not selected';
    if (allowMultiple && Array.isArray(selected)) {
      if (selected.length === 0) return 'Not selected';
      if (selected.length === 1) {
        const option = options.find(o => (o.id || o) === selected[0]);
        return option?.name || option?.label || String(option || selected[0]);
      }
      return `${selected.length} selected`;
    }
    const option = options.find(o => (o.id || o) === selected);
    return option?.name || option?.label || String(option || selected);
  }

  function submit() {
    const gradYearNum = graduationYear ? Number(graduationYear) : null;
    const nextBio = bio.trim() === '' ? null : bio.trim();
    const nextMajor = major.trim() === '' ? null : major.trim();
    const nextDisplayName = displayName.trim() === '' ? null : displayName.trim();
    const nextLocationDesc = locationDescription.trim() === '' ? null : locationDescription.trim();
    const nextLocationLat = locationLat.trim() === '' ? null : locationLat.trim();
    const nextLocationLon = locationLon.trim() === '' ? null : locationLon.trim();
    
    // For now, only save fields that exist in the backend
    // Placeholder fields will be added later
    onSave({
      displayName: nextDisplayName,
      bio: nextBio,
      major: nextMajor,
      graduationYear: gradYearNum,
      academicYear: academicYear || null,
      locationDescription: nextLocationDesc,
      locationLat: nextLocationLat,
      locationLon: nextLocationLon,
      affiliations: affiliations.length > 0 ? affiliations : null,
    });
  }

  return (
    <View style={[localStyles.container, { paddingTop: insets.top }]}>
      {/* Minimal header */}
      <View style={localStyles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={localStyles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="times" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={submit}
          style={localStyles.saveButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={localStyles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

    <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
      keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* About Me */}
        <View style={[localStyles.section, { marginTop: 24 }]}>
          <Text style={localStyles.sectionTitle}>About Me</Text>
          
          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
              style={[localStyles.input, localStyles.textArea]}
          placeholder="Say something about yourself"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Prompts</Text>
            <TextInput
              value={prompts}
              onChangeText={setPrompts}
              multiline
              style={[localStyles.input, localStyles.textArea]}
              placeholder="Answer prompts to help others get to know you"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Identity */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Identity</Text>
          
          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Name <Text style={localStyles.required}>*</Text></Text>
        <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              style={localStyles.input}
              placeholder="Your display name"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Gender <Text style={localStyles.required}>*</Text></Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={localStyles.chipRow}
              contentContainerStyle={localStyles.chipRowContent}
            >
              {GENDER_OPTIONS.map((option) => {
                const selected = gender === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setGender(option)}
                    style={[localStyles.chip, selected && localStyles.chipSelected]}
                  >
                    <Text
                      style={selected ? localStyles.chipTextSelected : localStyles.chipText}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Pronouns</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={localStyles.chipRow}
              contentContainerStyle={localStyles.chipRowContent}
            >
              {PRONOUN_OPTIONS.map((option) => {
                const selected = pronouns === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setPronouns(option)}
                    style={[localStyles.chip, selected && localStyles.chipSelected]}
                  >
                    <Text
                      style={selected ? localStyles.chipTextSelected : localStyles.chipText}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Sexuality</Text>
            <TouchableOpacity
              style={localStyles.selectRow}
              onPress={() => openSelectionSheet({
                title: 'Sexuality',
                options: SEXUALITY_OPTIONS.map(opt => ({ name: opt })),
                selected: sexuality,
                onSelect: (value) => setSexuality(value),
                allowMultiple: false,
                allowUnselect: true,
              })}
            >
              <Text style={[
                localStyles.selectRowText,
                !sexuality && localStyles.selectRowTextPlaceholder
              ]}>
                {sexuality || 'Not selected'}
              </Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Academics */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Academics</Text>
          
          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>School <Text style={localStyles.required}>*</Text></Text>
            <View style={localStyles.readonlyField}>
              <Text style={localStyles.readonlyText}>{schoolLabel}</Text>
            </View>
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Academic year <Text style={localStyles.required}>*</Text></Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={localStyles.chipRow}
              contentContainerStyle={localStyles.chipRowContent}
            >
              {ACADEMIC_YEARS.map((year) => {
                const selected = academicYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setAcademicYear(year)}
                    style={[localStyles.chip, selected && localStyles.chipSelected]}
                  >
                    <Text
                      style={selected ? localStyles.chipTextSelected : localStyles.chipText}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Graduation year</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
              style={localStyles.chipRow}
              contentContainerStyle={localStyles.chipRowContent}
        >
          {GRAD_YEARS.map((year) => {
            const selected = graduationYear === String(year);
            return (
              <TouchableOpacity
                key={year}
                onPress={() => setGraduationYear(String(year))}
                    style={[localStyles.chip, selected && localStyles.chipSelected]}
              >
                <Text
                      style={selected ? localStyles.chipTextSelected : localStyles.chipText}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Major</Text>
            <TextInput
              value={major}
              onChangeText={setMajor}
              style={localStyles.input}
              placeholder="e.g. Computer Science"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Location & Background */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Location & Background</Text>
          
          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Location</Text>
            <TextInput
              value={locationDescription}
              onChangeText={setLocationDescription}
              style={localStyles.input}
              placeholder="e.g. New York, NY or On campus"
              placeholderTextColor={COLORS.textMuted}
            />
            {Location && (
              <TouchableOpacity
                onPress={getCurrentLocation}
                disabled={locationLoading}
                style={localStyles.locationButton}
              >
                <Text style={localStyles.locationButtonText}>
                  {locationLoading ? 'Getting location...' : 'Use current location'}
                </Text>
          </TouchableOpacity>
            )}
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Hometown</Text>
            <TextInput
              value={hometown}
              onChangeText={setHometown}
              style={localStyles.input}
              placeholder="Where are you from?"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Languages</Text>
            <TextInput
              value={languages}
              onChangeText={setLanguages}
              style={localStyles.input}
              placeholder="e.g. English, Spanish, French"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Personal Details */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Personal Details</Text>
          
          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Height</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              style={localStyles.input}
              placeholder="e.g. 5'8 or 173 cm"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Religious beliefs</Text>
            <TouchableOpacity
              style={localStyles.selectRow}
              onPress={() => openSelectionSheet({
                title: 'Religious beliefs',
                options: RELIGIOUS_OPTIONS.map(opt => ({ name: opt, id: opt })),
                selected: religiousBeliefs,
                onSelect: (value) => {
                  const newValue = Array.isArray(value) ? value : (value ? [value] : []);
                  setReligiousBeliefs(newValue);
                },
                allowMultiple: true,
                allowUnselect: true,
              })}
            >
              <Text style={[
                localStyles.selectRowText,
                (!religiousBeliefs || religiousBeliefs.length === 0) && localStyles.selectRowTextPlaceholder
              ]}>
                {religiousBeliefs.length === 0
                  ? 'Not selected'
                  : religiousBeliefs.length === 1
                  ? religiousBeliefs[0]
                  : `${religiousBeliefs.length} selected`}
              </Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Political affiliation</Text>
            <TouchableOpacity
              style={localStyles.selectRow}
              onPress={() => openSelectionSheet({
                title: 'Political affiliation',
                options: POLITICAL_OPTIONS.map(opt => ({ name: opt, id: opt })),
                selected: politicalAffiliation,
                onSelect: (value) => setPoliticalAffiliation(value || ''),
                allowMultiple: false,
                allowUnselect: true,
              })}
            >
              <Text style={[
                localStyles.selectRowText,
                !politicalAffiliation && localStyles.selectRowTextPlaceholder
              ]}>
                {politicalAffiliation || 'Not selected'}
              </Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Ethnicity</Text>
            <TouchableOpacity
              style={localStyles.selectRow}
              onPress={() => openSelectionSheet({
                title: 'Ethnicity',
                options: ETHNICITY_OPTIONS.map(opt => ({ name: opt, id: opt })),
                selected: ethnicity,
                onSelect: (value) => {
                  const newValue = Array.isArray(value) ? value : (value ? [value] : []);
                  setEthnicity(newValue);
                },
                allowMultiple: true,
                allowUnselect: true,
              })}
            >
              <Text style={[
                localStyles.selectRowText,
                (!ethnicity || ethnicity.length === 0) && localStyles.selectRowTextPlaceholder
              ]}>
                {ethnicity.length === 0
                  ? 'Not selected'
                  : ethnicity.length === 1
                  ? ethnicity[0]
                  : `${ethnicity.length} selected`}
              </Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dorm Selection */}
        {dorms.length > 0 && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Dorm</Text>
            
            <View style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Residential house</Text>
              {loadingAffiliations ? (
                <ActivityIndicator size="small" color={COLORS.textMuted} style={{ marginTop: 10 }} />
              ) : (
                <TouchableOpacity
                  style={localStyles.selectRow}
                  onPress={() => openSelectionSheet({
                    title: 'Residential house',
                    options: dorms,
                    selected: dorm,
                    onSelect: (value) => {
                      toggleDorm(value);
                    },
                    allowMultiple: false,
                    allowUnselect: true,
                  })}
                >
                  <Text style={[
                    localStyles.selectRowText,
                    !dorm && localStyles.selectRowTextPlaceholder
                  ]}>
                    {dorm 
                      ? (() => {
                          // Normalize IDs for comparison
                          const normalizedDorm = typeof dorm === 'string' ? parseInt(dorm, 10) : dorm;
                          const found = dorms.find(d => {
                            const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
                            return dId === normalizedDorm;
                          });
                          return found?.name || 'Not selected';
                        })()
                      : 'Not selected'}
                  </Text>
                  <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Affiliations */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Affiliations</Text>
          
          {loadingAffiliations ? (
            <View style={localStyles.fieldGroup}>
              <ActivityIndicator size="small" color={COLORS.textMuted} style={{ marginTop: 10 }} />
            </View>
          ) : Object.keys(affiliationsByCategory).length === 0 ? (
            <View style={localStyles.fieldGroup}>
              <Text style={localStyles.placeholderText}>
                No affiliations available for your school
              </Text>
            </View>
          ) : (
            Object.entries(affiliationsByCategory).map(([categoryName, categoryAffiliations]) => {
              // Filter out dorms from regular affiliations
              const nonDormAffiliations = categoryAffiliations.filter(
                aff => !dorms.some(d => d.id === aff.id)
              );
              
              if (nonDormAffiliations.length === 0) return null;

              // Check if this is a single-select category (Greek Life, Academic Programs, Varsity Athletics)
              const categoryLower = categoryName.toLowerCase();
              const isSingleSelect = categoryLower.includes('greek') || 
                                     categoryLower.includes('academic') ||
                                     categoryLower.includes('varsity') ||
                                     categoryLower.includes('athletics');
              
              // Get selected affiliations for this category
              // Normalize IDs for comparison (handle both string and number IDs)
              const selectedForCategory = isSingleSelect
                ? affiliations.find(id => {
                    const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
                    return nonDormAffiliations.some(aff => {
                      const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                      return normalizedId === affId;
                    });
                  }) || null
                : affiliations.filter(id => {
                    const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
                    return nonDormAffiliations.some(aff => {
                      const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                      return normalizedId === affId;
                    });
                  });

              return (
                <View key={categoryName} style={localStyles.fieldGroup}>
                  <Text style={localStyles.label}>{categoryName}</Text>
                  <TouchableOpacity
                    style={localStyles.selectRow}
                    onPress={() => {
                      console.log('Opening selection sheet for:', categoryName);
                      console.log('Options:', nonDormAffiliations);
                      console.log('Selected:', selectedForCategory);
                      
                      openSelectionSheet({
                        title: categoryName,
                        options: nonDormAffiliations,
                        selected: selectedForCategory,
                        isAffiliationCategory: true,
                        onSelect: (value) => {
                          console.log('Selection made:', value, 'isSingleSelect:', isSingleSelect);
                          // Remove all affiliations from this category first
                          // Normalize IDs for comparison (handle both string and number IDs)
                          const otherAffiliationIds = affiliations.filter(id => {
                            const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
                            return !nonDormAffiliations.some(aff => {
                              const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                              return normalizedId === affId;
                            });
                          });
                          // Add back the newly selected ones
                          if (isSingleSelect) {
                            // Single select for Greek Life, Academic Programs, Varsity Athletics
                            if (value !== null && value !== undefined) {
                              const normalizedValue = typeof value === 'string' ? parseInt(value, 10) : value;
                              setAffiliations([...otherAffiliationIds, normalizedValue]);
                            } else {
                              setAffiliations(otherAffiliationIds);
                            }
                          } else {
                            // Multi-select for other categories - value is an array
                            const newAffiliationIds = Array.isArray(value) 
                              ? value.map(v => typeof v === 'string' ? parseInt(v, 10) : v).filter(v => v !== null && v !== undefined)
                              : (value ? [typeof value === 'string' ? parseInt(value, 10) : value] : []);
                            setAffiliations([...otherAffiliationIds, ...newAffiliationIds]);
                          }
                        },
                        allowMultiple: !isSingleSelect,
                        allowUnselect: true,
                      });
                    }}
                  >
                    <Text style={[
                      localStyles.selectRowText,
                      (!selectedForCategory || (Array.isArray(selectedForCategory) && selectedForCategory.length === 0)) && localStyles.selectRowTextPlaceholder
                    ]}>
                      {isSingleSelect
                        ? (selectedForCategory
                            ? (() => {
                                // Normalize the selected ID for comparison
                                const normalizedSelected = typeof selectedForCategory === 'string' ? parseInt(selectedForCategory, 10) : selectedForCategory;
                                const found = nonDormAffiliations.find(aff => {
                                  const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                                  return affId === normalizedSelected;
                                });
                                return found?.name || 'Not selected';
                              })()
                            : 'Not selected')
                        : (selectedForCategory.length === 0
                            ? 'Not selected'
                            : selectedForCategory.length === 1
                            ? (() => {
                                // Normalize the selected ID for comparison
                                const normalizedSelected = typeof selectedForCategory[0] === 'string' ? parseInt(selectedForCategory[0], 10) : selectedForCategory[0];
                                const found = nonDormAffiliations.find(aff => {
                                  const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                                  return affId === normalizedSelected;
                                });
                                return found?.name || 'Not selected';
                              })()
                            : `${selectedForCategory.length} selected`)}
                    </Text>
                    <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Interests */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Interests</Text>
          
          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Interests</Text>
            <TextInput
              value={interests}
              onChangeText={setInterests}
              style={localStyles.input}
              placeholder="Add your interests"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={localStyles.placeholderText}>
              Interest management coming soon
            </Text>
          </View>
        </View>

        {/* Dating Intentions */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Dating Intentions</Text>
          
          <View style={localStyles.fieldGroup}>
            <Text style={localStyles.label}>Looking for</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={localStyles.chipRow}
              contentContainerStyle={localStyles.chipRowContent}
            >
              {DATING_INTENTIONS.map((option) => {
                const selected = datingIntentions === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setDatingIntentions(option)}
                    style={[localStyles.chip, selected && localStyles.chipSelected]}
                  >
                    <Text
                      style={selected ? localStyles.chipTextSelected : localStyles.chipText}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
        </View>
      </View>

        <View style={{ height: 60 }} />
    </ScrollView>

      {/* Selection Sheet */}
      {selectionSheetConfig && (() => {
        // Calculate current selected value based on current state
        let currentSelected = selectionSheetConfig.selected;
        const title = selectionSheetConfig.title;
        
        // Recalculate selected from current state for reactive updates
        if (title === 'Residential house' || title === 'Dorm') {
          // Dorm - use current dorm state
          currentSelected = dorm;
        } else if (title === 'Religious beliefs') {
          // Religious beliefs - use current array state
          currentSelected = religiousBeliefs;
        } else if (title === 'Political affiliation') {
          // Political affiliation - use current string state
          currentSelected = politicalAffiliation;
        } else if (title === 'Ethnicity') {
          // Ethnicity - use current array state
          currentSelected = ethnicity;
        } else if (selectionSheetConfig.isAffiliationCategory) {
          // If this is an affiliations category, recalculate selected from current affiliations state
          const categoryName = title;
          const categoryLower = categoryName.toLowerCase();
          const isSingleSelect = categoryLower.includes('greek') || 
                                 categoryLower.includes('academic') ||
                                 categoryLower.includes('varsity') ||
                                 categoryLower.includes('athletics');
          const categoryAffiliations = selectionSheetConfig.options;
          
          if (isSingleSelect) {
            // Single select for Greek Life, Academic Programs, Varsity Athletics
            currentSelected = affiliations.find(id => {
              const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
              return categoryAffiliations.some(aff => {
                const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                return normalizedId === affId;
              });
            }) || null;
          } else {
            // Multi-select for other categories
            currentSelected = affiliations.filter(id => {
              const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
              return categoryAffiliations.some(aff => {
                const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                return normalizedId === affId;
              });
            });
          }
        }
        
        return (
          <SelectionSheet
            key={`${selectionSheetConfig.title}-${selectionSheetVisible}`}
            visible={selectionSheetVisible}
            title={selectionSheetConfig.title}
            options={selectionSheetConfig.options}
            selected={currentSelected}
            onSelect={(value, option) => {
              console.log('SelectionSheet onSelect called:', value, option);
              if (selectionSheetConfig.onSelect) {
                selectionSheetConfig.onSelect(value, option);
              }
              // Don't auto-close - user must click X to close
            }}
            onClose={() => {
              console.log('SelectionSheet onClose called');
              closeSelectionSheet();
            }}
            allowMultiple={selectionSheetConfig.allowMultiple}
            allowUnselect={selectionSheetConfig.allowUnselect}
          />
        );
      })()}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface, // White background like VSCO
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginTop: 40, // Large spacing between sections (VSCO style)
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  fieldGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginBottom: 10,
    letterSpacing: 0,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.backgroundSubtle, // Light gray rounded container
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 0, // No border
    fontWeight: '400',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  readonlyField: {
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readonlyText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  chipRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  chipRowContent: {
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: COLORS.backgroundSubtle,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.textPrimary,
  },
  chipText: {
    fontSize: 15,
    color: COLORS.textBody,
    fontWeight: '400',
  },
  chipTextSelected: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.surface,
  },
  locationButton: {
    marginTop: 10,
    paddingVertical: 4,
  },
  locationButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    lineHeight: 18,
  },
  affiliationText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
    marginTop: 4,
  },
  affiliationSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 18,
  },
  placeholderText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginTop: 8,
    fontStyle: 'italic',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  selectRowText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
    flex: 1,
  },
  selectRowTextPlaceholder: {
    color: COLORS.textMuted,
  },
});
