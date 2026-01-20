// // mobile/components/ProfileDetailsForm.js

// /**
//  * ProfileDetailsForm is a reusable form component for editing a user's basic profile 
//  * information, such as their display name, bio, major, and graduation year.
//  * 
//  * It is used within the ProfileScreen to allow users to edit their own profile 
//  * details. When the form is submitted, it calls the onSave prop with the updated
//  * profile fields, which the ProfileScreen handles by making an API call to update 
//  * the user's profile on the server.
//  * 
//  * The form is pre-populated with the user's current profile details, which are 
//  * passed in as the profile prop. It uses reusable input components and styles from 
//  * the ProfileFormStyles module to maintain a consistent look and feel with other 
//  * forms in the app.
//  * 
//  * Overall, this component plays a crucial role in allowing users to personalize 
//  * their profiles, which are a central part of the app's functionality and user 
//  * experience.
//  */

// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet, ActivityIndicator } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { FontAwesome } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { COLORS } from '../../../../styles/themeNEW';
// import { getMySchoolDorms, getMySchoolAffiliations } from '../../../../api/affiliationsAPI';
// import SelectionSheet from '../SelectionSheet';

// // Optional location import - gracefully handle if not installed
// let Location = null;
// try {
//   Location = require('expo-location');
// } catch (e) {
//   // expo-location not installed, location features will be disabled
// }

// const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
// const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
// const GENDER_OPTIONS = ['Male', 'Female', 'Non-Binary'];
// const PRONOUN_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Other'];
// const SEXUALITY_OPTIONS = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Prefer not to say'];
// const DATING_INTENTIONS = ['Romantic', 'Platonic', 'Both'];
// const RELIGIOUS_OPTIONS = ['Christian', 'Catholic', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Agnostic', 'Atheist', 'Spiritual', 'Other', 'Prefer not to say'];
// const POLITICAL_OPTIONS = ['Very Liberal', 'Liberal', 'Moderate', 'Conservative', 'Very Conservative', 'Libertarian', 'Other', 'Prefer not to say'];
// const ETHNICITY_OPTIONS = ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latino', 'Middle Eastern or North African', 'Native Hawaiian or Other Pacific Islander', 'White', 'Other', 'Prefer not to say'];

// export default function ProfileDetailsForm({ profile, onSave, onClose }) {
//   const insets = useSafeAreaInsets();
  
//   // About Me
//   const [bio, setBio] = useState(profile.bio || '');
//   const [prompts, setPrompts] = useState(''); // Placeholder
  
//   // Identity
//   const [displayName, setDisplayName] = useState(profile.display_name || '');
//   const [gender, setGender] = useState(profile.gender || '');
//   const [pronouns, setPronouns] = useState(profile.pronouns || '');
//   const [sexuality, setSexuality] = useState(profile.sexuality || '');
  
//   // Academics
//   const [academicYear, setAcademicYear] = useState(profile.academic_year || null);
//   const [graduationYear, setGraduationYear] = useState(
//     profile.graduation_year ? String(profile.graduation_year) : ''
//   );
//   const [major, setMajor] = useState(profile.major || '');
  
//   // Location & Background
//   const [locationDescription, setLocationDescription] = useState(profile.location_description || '');
//   const [hometown, setHometown] = useState(profile.hometown || '');
//   const [languages, setLanguages] = useState(profile.languages || '');
//   const [locationLat, setLocationLat] = useState(profile.location_lat || '');
//   const [locationLon, setLocationLon] = useState(profile.location_lon || '');
//   const [locationLoading, setLocationLoading] = useState(false);
  
//   // Personal Details
//   const [height, setHeight] = useState(profile.height ? String(profile.height) : '');
//   // religious_beliefs is stored as comma-separated string in DB, but we use array in UI
//   const [religiousBeliefs, setReligiousBeliefs] = useState(
//     profile.religious_beliefs 
//       ? (Array.isArray(profile.religious_beliefs) 
//           ? profile.religious_beliefs 
//           : profile.religious_beliefs.split(',').map(s => s.trim()).filter(Boolean))
//       : []
//   );
//   const [politicalAffiliation, setPoliticalAffiliation] = useState(profile.political_affiliation || '');
//   // ethnicity is stored as comma-separated string in DB, but we use array in UI
//   const [ethnicity, setEthnicity] = useState(
//     profile.ethnicity 
//       ? (Array.isArray(profile.ethnicity) 
//           ? profile.ethnicity 
//           : profile.ethnicity.split(',').map(s => s.trim()).filter(Boolean))
//       : []
//   );
  
//   // Affiliations (normalize IDs to numbers for consistency)
//   const [affiliations, setAffiliations] = useState(() => {
//     if (profile.affiliations && Array.isArray(profile.affiliations)) {
//       return profile.affiliations.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id));
//     }
//     return [];
//   });
//   // Featured/key affiliations (up to 2) - these show in preview
//   const [featuredAffiliations, setFeaturedAffiliations] = useState(
//     profile.featured_affiliations && Array.isArray(profile.featured_affiliations) 
//       ? profile.featured_affiliations 
//       : []
//   );
//   const [dorm, setDorm] = useState(null); // Single dorm selection
//   const [dorms, setDorms] = useState([]);
//   const [affiliationsByCategory, setAffiliationsByCategory] = useState({});
//   const [loadingAffiliations, setLoadingAffiliations] = useState(true);
  
//   // Selection sheet state
//   const [selectionSheetVisible, setSelectionSheetVisible] = useState(false);
//   const [selectionSheetConfig, setSelectionSheetConfig] = useState(null);
  
//   // Interests
//   const [interests, setInterests] = useState(''); // Placeholder - will be handled separately later
  
//   // Dating Intentions
//   const [datingIntentions, setDatingIntentions] = useState(''); // Placeholder

//   const schoolLabel =
//     profile?.school?.name ||
//     profile?.school_name ||
//     profile?.school?.short_name ||
//     'School not set';
  
//   const schoolId = profile?.school?.id || profile?.school_id;

//   // Fetch dorms and affiliations on mount
//   useEffect(() => {
//     (async () => {
//       if (!schoolId) {
//         setLoadingAffiliations(false);
//         return;
//       }

//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (!token) {
//           setLoadingAffiliations(false);
//           return;
//         }

//         // Fetch dorms and affiliations in parallel
//         const [dormsData, affiliationsData] = await Promise.all([
//           getMySchoolDorms(token).catch((err) => {
//             console.warn('Error fetching dorms:', err);
//             return [];
//           }),
//           getMySchoolAffiliations(token).catch((err) => {
//             console.warn('Error fetching affiliations:', err);
//             return {};
//           })
//         ]);

//         console.log('Dorms data:', dormsData);
//         console.log('Affiliations data:', affiliationsData);
//         console.log('Affiliation categories:', Object.keys(affiliationsData));

//         setDorms(dormsData);
//         setAffiliationsByCategory(affiliationsData);

//         // Set initial dorm if user has one selected (check if any affiliation ID matches a dorm)
//         // Normalize IDs for comparison to handle string/number mismatches
//         if (affiliations.length > 0 && dormsData.length > 0) {
//           const matchingDorm = dormsData.find(d => {
//             const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
//             return affiliations.some(affId => {
//               const normalizedAffId = typeof affId === 'string' ? parseInt(affId, 10) : affId;
//               return normalizedAffId === dId;
//             });
//           });
//           if (matchingDorm) {
//             const dormId = typeof matchingDorm.id === 'string' ? parseInt(matchingDorm.id, 10) : matchingDorm.id;
//             setDorm(dormId);
//             console.log('Initial dorm set:', dormId, matchingDorm.name);
//           }
//         }
//       } catch (error) {
//         console.warn('Failed to load affiliations:', error);
//       } finally {
//         setLoadingAffiliations(false);
//       }
//     })();
//   }, [schoolId]);

//   // Clean up featured affiliations when affiliations are removed
//   useEffect(() => {
//     if (featuredAffiliations.length > 0 && affiliations.length > 0) {
//       // Remove any featured affiliations that are no longer in the affiliations list
//       const validFeatured = featuredAffiliations.filter(featuredId => {
//         const normalizedFeatured = typeof featuredId === 'string' ? parseInt(featuredId, 10) : featuredId;
//         return affiliations.some(affId => {
//           const normalizedAff = typeof affId === 'string' ? parseInt(affId, 10) : affId;
//           return normalizedAff === normalizedFeatured;
//         });
//       });
      
//       // Only update if there's a change (to avoid infinite loops)
//       if (validFeatured.length !== featuredAffiliations.length) {
//         setFeaturedAffiliations(validFeatured);
//       }
//     } else if (affiliations.length === 0 && featuredAffiliations.length > 0) {
//       // If all affiliations are removed, clear featured affiliations
//       setFeaturedAffiliations([]);
//     }
//   }, [affiliations]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Separate effect to set dorm when both dorms and affiliations are available
//   useEffect(() => {
//     if (dorms.length > 0 && affiliations.length > 0 && !dorm) {
//       // Check if any affiliation ID matches a dorm (normalize IDs for comparison)
//       const matchingDorm = dorms.find(d => {
//         const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
//         return affiliations.some(affId => {
//           const normalizedAffId = typeof affId === 'string' ? parseInt(affId, 10) : affId;
//           return normalizedAffId === dId;
//         });
//       });
//       if (matchingDorm) {
//         const dormId = typeof matchingDorm.id === 'string' ? parseInt(matchingDorm.id, 10) : matchingDorm.id;
//         setDorm(dormId);
//         console.log('Dorm initialized from affiliations:', dormId, matchingDorm.name);
//       }
//     }
//   }, [dorms, affiliations, dorm]);

//   async function getCurrentLocation() {
//     if (!Location) {
//       Alert.alert(
//         'Location unavailable',
//         'Location services are not available. Please install expo-location or enter coordinates manually.'
//       );
//       return;
//     }

//     try {
//       setLocationLoading(true);
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission needed', 'Location permission is required to use your current location.');
//         return;
//       }

//       const location = await Location.getCurrentPositionAsync({});
//       setLocationLat(String(location.coords.latitude));
//       setLocationLon(String(location.coords.longitude));
      
//       // Optionally reverse geocode to get a description
//       try {
//         const [address] = await Location.reverseGeocodeAsync({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         });
//         if (address) {
//           const desc = [address.street, address.city, address.region]
//             .filter(Boolean)
//             .join(', ');
//           if (desc) setLocationDescription(desc);
//         }
//       } catch (e) {
//         // Geocoding failed, that's okay
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to get your location. Please enter it manually.');
//       console.warn('Location error:', error);
//     } finally {
//       setLocationLoading(false);
//     }
//   }

//   function toggleAffiliation(affiliationId) {
//     setAffiliations((prev) => {
//       if (prev.includes(affiliationId)) {
//         return prev.filter((id) => id !== affiliationId);
//       } else {
//         return [...prev, affiliationId];
//       }
//     });
//   }

//   function toggleDorm(dormId) {
//     // Normalize dorm ID for comparison
//     const normalizedDormId = typeof dormId === 'string' ? parseInt(dormId, 10) : dormId;
//     const normalizedCurrentDorm = typeof dorm === 'string' ? parseInt(dorm, 10) : dorm;
    
//     // Remove old dorm from affiliations if it exists
//     setAffiliations((prev) => {
//       const withoutOldDorm = prev.filter((id) => {
//         const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//         return !dorms.some(d => {
//           const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
//           return dId === normalizedId && dId !== normalizedDormId;
//         });
//       });
//       // Add new dorm if selected, otherwise just return without old dorm
//       if (normalizedDormId && normalizedDormId !== normalizedCurrentDorm) {
//         return [...withoutOldDorm, normalizedDormId];
//       }
//       return withoutOldDorm;
//     });
//     setDorm(normalizedDormId === normalizedCurrentDorm ? null : normalizedDormId);
//   }

//   // Helper functions for selection sheets
//   function openSelectionSheet(config) {
//     setSelectionSheetConfig(config);
//     setSelectionSheetVisible(true);
//   }

//   function closeSelectionSheet() {
//     setSelectionSheetVisible(false);
//     setSelectionSheetConfig(null);
//   }

//   // Helper function to sort affiliation categories in a specific order
//   // School should appear first, Club Sports should appear right after Varsity Athletics
//   function sortAffiliationCategories(categories) {
//     const categoryOrder = [
//       'House',
//       'School',
//       'Academic Programs',
//       'Greek Life',
//       'Pre-Professional Greek Life',
//       'Varsity Athletics',
//       'Club Sports', // Right after Varsity Athletics
//       'Senior Society',
//       'Publications',
//       'Student Government',
//       'Consulting Clubs',
//       'Business Clubs',
//       'Engineering Clubs'
//     ];

//     // Create a map for quick lookup of order
//     const orderMap = new Map();
//     categoryOrder.forEach((cat, index) => {
//       orderMap.set(cat.toLowerCase(), index);
//     });

//     // Sort categories: known categories first (in specified order), then alphabetically
//     return Object.entries(categories).sort(([nameA], [nameB]) => {
//       const orderA = orderMap.get(nameA.toLowerCase());
//       const orderB = orderMap.get(nameB.toLowerCase());

//       // If both are in the order list, sort by their position
//       if (orderA !== undefined && orderB !== undefined) {
//         return orderA - orderB;
//       }
//       // If only A is in the order list, A comes first
//       if (orderA !== undefined) {
//         return -1;
//       }
//       // If only B is in the order list, B comes first
//       if (orderB !== undefined) {
//         return 1;
//       }
//       // If neither is in the order list, sort alphabetically
//       return nameA.localeCompare(nameB);
//     });
//   }

//   function getSelectedDisplayName(selected, options, allowMultiple = false) {
//     if (!selected) return 'Not selected';
//     if (allowMultiple && Array.isArray(selected)) {
//       if (selected.length === 0) return 'Not selected';
//       if (selected.length === 1) {
//         const option = options.find(o => (o.id || o) === selected[0]);
//         return option?.name || option?.label || String(option || selected[0]);
//       }
//       return `${selected.length} selected`;
//     }
//     const option = options.find(o => (o.id || o) === selected);
//     return option?.name || option?.label || String(option || selected);
//   }

//   function submit() {
//     // Validate graduationYear - must be integer between 2020-2040
//     let gradYearNum = null;
//     if (graduationYear && graduationYear.trim() !== '') {
//       const parsed = Number(graduationYear);
//       if (!isNaN(parsed) && Number.isInteger(parsed) && parsed >= 2020 && parsed <= 2040) {
//         gradYearNum = parsed;
//       }
//     }
    
//     const nextBio = bio.trim() === '' ? null : bio.trim();
//     const nextMajor = major.trim() === '' ? null : major.trim();
//     const nextDisplayName = displayName.trim() === '' ? null : displayName.trim();
//     const nextLocationDesc = locationDescription.trim() === '' ? null : locationDescription.trim();
//     const nextLocationLat = locationLat.trim() === '' ? null : locationLat.trim();
//     const nextLocationLon = locationLon.trim() === '' ? null : locationLon.trim();
    
//     // Ensure dorm is included in affiliations if selected
//     // Note: Houses are NOT dorms - they're regular affiliations and should NOT be removed here
//     let finalAffiliations = [...affiliations];
//     console.log('Submit - Current dorm:', dorm);
//     console.log('Submit - Current affiliations (before processing):', affiliations);
//     console.log('Submit - Available dorms:', dorms.map(d => ({ id: d.id, name: d.name })));
    
//     // First, remove any existing dorms from affiliations (houses are NOT dorms, so they won't be removed)
//     finalAffiliations = finalAffiliations.filter(id => {
//       const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//       const isDorm = dorms.some(d => {
//         const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
//         return dId === normalizedId;
//       });
//       if (isDorm) {
//         console.log('Submit - Removing dorm ID from affiliations:', normalizedId);
//       }
//       return !isDorm;
//     });
//     console.log('Submit - Affiliations after removing dorms (houses should still be here):', finalAffiliations);
    
//     // Then, if a dorm is selected, add it
//     if (dorm) {
//       const normalizedDorm = typeof dorm === 'string' ? parseInt(dorm, 10) : dorm;
//       console.log('Submit - Normalized dorm ID:', normalizedDorm);
//       finalAffiliations.push(normalizedDorm);
//       console.log('Submit - Final affiliations with dorm:', finalAffiliations);
//     } else {
//       console.log('Submit - No dorm selected, final affiliations:', finalAffiliations);
//     }
    
//     // Clean and validate affiliations array - ensure all are positive integers
//     finalAffiliations = finalAffiliations
//       .map(id => {
//         if (typeof id === 'string') {
//           const parsed = parseInt(id, 10);
//           return isNaN(parsed) ? null : parsed;
//         }
//         return id;
//       })
//       .filter(id => id !== null && id !== undefined && Number.isInteger(id) && id > 0);
    
//     // Handle religious beliefs - convert array to comma-separated string for DB
//     const nextReligiousBeliefs = religiousBeliefs.length > 0 ? religiousBeliefs.join(', ') : null;
    
//     // Handle ethnicity - convert array to comma-separated string for DB
//     const nextEthnicity = ethnicity.length > 0 ? ethnicity.join(', ') : null;
    
//     // Handle height - convert to number or null, ensure it's valid
//     let nextHeight = null;
//     if (height.trim() !== '') {
//       const parsedHeight = parseFloat(height.trim());
//       if (!isNaN(parsedHeight) && parsedHeight >= 0 && parsedHeight <= 300) {
//         nextHeight = parsedHeight;
//       }
//     }
    
//     // Handle languages
//     const nextLanguages = languages.trim() !== '' ? languages.trim() : null;
    
//     // Handle hometown
//     const nextHometown = hometown.trim() !== '' ? hometown.trim() : null;
    
//     // Prepare the payload
//     // For fields that can be cleared: if they had a value originally but are now empty, send null
//     // If they never had a value and are still empty, omit them
//     // If they have a value (new or updated), send it
//     const payload = {};
    
//     // Display name - always send if changed or if clearing
//     const originalDisplayName = profile.display_name || null;
//     if (nextDisplayName !== originalDisplayName) {
//       payload.displayName = nextDisplayName;
//     }
    
//     // Bio - send if changed or if clearing
//     const originalBio = profile.bio || null;
//     if (nextBio !== originalBio) {
//       payload.bio = nextBio;
//     }
    
//     // Major - send if changed or if clearing
//     const originalMajor = profile.major || null;
//     if (nextMajor !== originalMajor) {
//       payload.major = nextMajor;
//     }
    
//     // Graduation year - send if changed or if clearing
//     const originalGradYear = profile.graduation_year || null;
//     if (gradYearNum !== originalGradYear) {
//       payload.graduationYear = gradYearNum;
//     }
    
//     // Academic year - send if changed or if clearing
//     const originalAcademicYear = profile.academic_year || null;
//     const validAcademicYears = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
//     const finalAcademicYear = (academicYear && validAcademicYears.includes(academicYear)) ? academicYear : null;
//     if (finalAcademicYear !== originalAcademicYear) {
//       payload.academicYear = finalAcademicYear;
//     }
    
//     // Location description - send if changed or if clearing
//     const originalLocationDesc = profile.location_description || null;
//     if (nextLocationDesc !== originalLocationDesc) {
//       payload.locationDescription = nextLocationDesc;
//     }
    
//     // Location lat/lon - send if changed or if clearing
//     const originalLocationLat = profile.location_lat || null;
//     if (nextLocationLat !== originalLocationLat) {
//       payload.locationLat = nextLocationLat;
//     }
//     const originalLocationLon = profile.location_lon || null;
//     if (nextLocationLon !== originalLocationLon) {
//       payload.locationLon = nextLocationLon;
//     }
    
//     // Affiliations - always send if there are any, or send empty array if clearing all
//     const originalAffiliations = profile.affiliations && Array.isArray(profile.affiliations) 
//       ? profile.affiliations.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0).sort()
//       : [];
//     const finalAffiliationsSorted = [...finalAffiliations].sort();
//     const affiliationsChanged = JSON.stringify(originalAffiliations) !== JSON.stringify(finalAffiliationsSorted);
//     if (affiliationsChanged) {
//       payload.affiliations = finalAffiliations.length > 0 ? finalAffiliations : [];
//     }
    
//     // Gender - send if changed or if clearing
//     const originalGender = profile.gender || null;
//     if (gender !== originalGender) {
//       payload.gender = gender || null;
//     }
    
//     // Sexuality - send if changed or if clearing
//     const originalSexuality = profile.sexuality || null;
//     if (sexuality !== originalSexuality) {
//       payload.sexuality = sexuality || null;
//     }
    
//     // Pronouns - send if changed or if clearing
//     const originalPronouns = profile.pronouns || null;
//     if (pronouns !== originalPronouns) {
//       payload.pronouns = pronouns || null;
//     }
    
//     // Religious beliefs - send if changed or if clearing
//     const originalReligiousBeliefs = profile.religious_beliefs || null;
//     if (nextReligiousBeliefs !== originalReligiousBeliefs) {
//       payload.religiousBeliefs = nextReligiousBeliefs;
//     }
    
//     // Height - send if changed or if clearing
//     const originalHeight = profile.height || null;
//     if (nextHeight !== originalHeight) {
//       payload.height = nextHeight;
//     }
    
//     // Political affiliation - send if changed or if clearing
//     const originalPoliticalAffiliation = profile.political_affiliation || null;
//     if (politicalAffiliation !== originalPoliticalAffiliation) {
//       payload.politicalAffiliation = politicalAffiliation || null;
//     }
    
//     // Languages - send if changed or if clearing
//     const originalLanguages = profile.languages || null;
//     if (nextLanguages !== originalLanguages) {
//       payload.languages = nextLanguages;
//     }
    
//     // Hometown - send if changed or if clearing
//     const originalHometown = profile.hometown || null;
//     if (nextHometown !== originalHometown) {
//       payload.hometown = nextHometown;
//     }
    
//     // Ethnicity - send if changed or if clearing
//     const originalEthnicity = profile.ethnicity || null;
//     if (nextEthnicity !== originalEthnicity) {
//       payload.ethnicity = nextEthnicity;
//     }
    
//     // Featured affiliations - send if changed or if clearing
//     // IMPORTANT: Do NOT sort - preserve the order they were selected
//     const originalFeatured = (profile.featured_affiliations && Array.isArray(profile.featured_affiliations))
//       ? profile.featured_affiliations.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0)
//       : [];
//     const cleanedFeatured = featuredAffiliations
//       .map(id => {
//         if (typeof id === 'string') {
//           const parsed = parseInt(id, 10);
//           return isNaN(parsed) ? null : parsed;
//         }
//         return id;
//       })
//       .filter(id => id !== null && id !== undefined && Number.isInteger(id) && id > 0);
//     // Compare arrays preserving order
//     const featuredChanged = JSON.stringify(originalFeatured) !== JSON.stringify(cleanedFeatured);
//     if (featuredChanged) {
//       payload.featuredAffiliations = cleanedFeatured.length > 0 ? cleanedFeatured : null;
//     }
    
//     // Log the payload for debugging
//     console.log('Submit - Final payload being sent:', JSON.stringify(payload, null, 2));
//     console.log('Submit - Affiliations in payload:', payload.affiliations);
//     console.log('Submit - Featured affiliations in payload:', payload.featuredAffiliations);
    
//     onSave(payload);
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

//     <ScrollView
//         style={localStyles.scrollView}
//         contentContainerStyle={localStyles.scrollContent}
//       keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* About Me */}
//         <View style={[localStyles.section, { marginTop: 24 }]}>
//           <Text style={localStyles.sectionTitle}>About Me</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Bio</Text>
//         <TextInput
//           value={bio}
//           onChangeText={setBio}
//           multiline
//               style={[localStyles.input, localStyles.textArea]}
//           placeholder="Say something about yourself"
//               placeholderTextColor={COLORS.textMuted}
//             />
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Prompts</Text>
//             <TextInput
//               value={prompts}
//               onChangeText={setPrompts}
//               multiline
//               style={[localStyles.input, localStyles.textArea]}
//               placeholder="Answer prompts to help others get to know you"
//               placeholderTextColor={COLORS.textMuted}
//             />
//           </View>
//         </View>

//         {/* Identity */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Identity</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Name <Text style={localStyles.required}>*</Text></Text>
//         <TextInput
//               value={displayName}
//               onChangeText={setDisplayName}
//               style={localStyles.input}
//               placeholder="Your display name"
//               placeholderTextColor={COLORS.textMuted}
//             />
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Gender <Text style={localStyles.required}>*</Text></Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={localStyles.chipRow}
//               contentContainerStyle={localStyles.chipRowContent}
//             >
//               {GENDER_OPTIONS.map((option) => {
//                 const selected = gender === option;
//                 return (
//                   <TouchableOpacity
//                     key={option}
//                     onPress={() => setGender(option)}
//                     style={[localStyles.chip, selected && localStyles.chipSelected]}
//                   >
//                     <Text
//                       style={selected ? localStyles.chipTextSelected : localStyles.chipText}
//                     >
//                       {option}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Pronouns</Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={localStyles.chipRow}
//               contentContainerStyle={localStyles.chipRowContent}
//             >
//               {PRONOUN_OPTIONS.map((option) => {
//                 const selected = pronouns === option;
//                 return (
//                   <TouchableOpacity
//                     key={option}
//                     onPress={() => {
//                       // If already selected, unselect it; otherwise, select it
//                       setPronouns(selected ? '' : option);
//                     }}
//                     style={[localStyles.chip, selected && localStyles.chipSelected]}
//                   >
//                     <Text
//                       style={selected ? localStyles.chipTextSelected : localStyles.chipText}
//                     >
//                       {option}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Sexuality</Text>
//             <TouchableOpacity
//               style={localStyles.selectRow}
//               onPress={() => openSelectionSheet({
//                 title: 'Sexuality',
//                 options: SEXUALITY_OPTIONS.map(opt => ({ name: opt, id: opt })),
//                 selected: sexuality,
//                 onSelect: (value) => setSexuality(value || ''),
//                 allowMultiple: false,
//                 allowUnselect: true,
//               })}
//             >
//               <Text style={[
//                 localStyles.selectRowText,
//                 !sexuality && localStyles.selectRowTextPlaceholder
//               ]}>
//                 {sexuality || 'Not selected'}
//               </Text>
//               <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Academics */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Academics</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>School <Text style={localStyles.required}>*</Text></Text>
//             <View style={localStyles.readonlyField}>
//               <Text style={localStyles.readonlyText}>{schoolLabel}</Text>
//             </View>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Academic year <Text style={localStyles.required}>*</Text></Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={localStyles.chipRow}
//               contentContainerStyle={localStyles.chipRowContent}
//             >
//               {ACADEMIC_YEARS.map((year) => {
//                 const selected = academicYear === year;
//                 return (
//                   <TouchableOpacity
//                     key={year}
//                     onPress={() => setAcademicYear(year)}
//                     style={[localStyles.chip, selected && localStyles.chipSelected]}
//                   >
//                     <Text
//                       style={selected ? localStyles.chipTextSelected : localStyles.chipText}
//                     >
//                       {year}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Graduation year</Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//               style={localStyles.chipRow}
//               contentContainerStyle={localStyles.chipRowContent}
//         >
//           {GRAD_YEARS.map((year) => {
//             const selected = graduationYear === String(year);
//             return (
//               <TouchableOpacity
//                 key={year}
//                 onPress={() => setGraduationYear(String(year))}
//                     style={[localStyles.chip, selected && localStyles.chipSelected]}
//               >
//                 <Text
//                       style={selected ? localStyles.chipTextSelected : localStyles.chipText}
//                 >
//                   {year}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Major/Area of Study</Text>
//             <TextInput
//               value={major}
//               onChangeText={setMajor}
//               style={localStyles.input}
//               placeholder="e.g. Computer Science"
//               placeholderTextColor={COLORS.textMuted}
//             />
//           </View>
//         </View>

//         {/* Location & Background */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Location & Background</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Location</Text>
//             <TextInput
//               value={locationDescription}
//               onChangeText={setLocationDescription}
//               style={localStyles.input}
//               placeholder="Where are you currently located?"
//               placeholderTextColor={COLORS.textMuted}
//             />
//             {Location && (
//               <TouchableOpacity
//                 onPress={getCurrentLocation}
//                 disabled={locationLoading}
//                 style={localStyles.locationButton}
//               >
//                 <Text style={localStyles.locationButtonText}>
//                   {locationLoading ? 'Getting location...' : 'Use current location'}
//                 </Text>
//           </TouchableOpacity>
//             )}
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Hometown</Text>
//             <TextInput
//               value={hometown}
//               onChangeText={setHometown}
//               style={localStyles.input}
//               placeholder="Where do you call home?"
//               placeholderTextColor={COLORS.textMuted}
//             />
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Languages</Text>
//             <TextInput
//               value={languages}
//               onChangeText={setLanguages}
//               style={localStyles.input}
//               placeholder="e.g. English, Spanish, French"
//               placeholderTextColor={COLORS.textMuted}
//             />
//           </View>
//         </View>

//         {/* Personal Details */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Personal Details</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Height</Text>
//             <TextInput
//               value={height}
//               onChangeText={setHeight}
//               style={localStyles.input}
//               placeholder="e.g. 5'8 or 173 cm"
//               placeholderTextColor={COLORS.textMuted}
//             />
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Religious Beliefs</Text>
//             <TouchableOpacity
//               style={localStyles.selectRow}
//               onPress={() => openSelectionSheet({
//                 title: 'Religious beliefs',
//                 options: RELIGIOUS_OPTIONS.map(opt => ({ name: opt, id: opt })),
//                 selected: religiousBeliefs,
//                 onSelect: (value) => {
//                   const newValue = Array.isArray(value) ? value : (value ? [value] : []);
//                   setReligiousBeliefs(newValue);
//                 },
//                 allowMultiple: true,
//                 allowUnselect: true,
//               })}
//             >
//               <Text style={[
//                 localStyles.selectRowText,
//                 (!religiousBeliefs || religiousBeliefs.length === 0) && localStyles.selectRowTextPlaceholder
//               ]}>
//                 {religiousBeliefs.length === 0
//                   ? 'Not selected'
//                   : religiousBeliefs.join(', ')}
//               </Text>
//               <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
//             </TouchableOpacity>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Political Affiliation</Text>
//             <TouchableOpacity
//               style={localStyles.selectRow}
//               onPress={() => openSelectionSheet({
//                 title: 'Political affiliation',
//                 options: POLITICAL_OPTIONS.map(opt => ({ name: opt, id: opt })),
//                 selected: politicalAffiliation,
//                 onSelect: (value) => setPoliticalAffiliation(value || ''),
//                 allowMultiple: false,
//                 allowUnselect: true,
//               })}
//             >
//               <Text style={[
//                 localStyles.selectRowText,
//                 !politicalAffiliation && localStyles.selectRowTextPlaceholder
//               ]}>
//                 {politicalAffiliation || 'Not selected'}
//               </Text>
//               <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
//             </TouchableOpacity>
//           </View>

//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Ethnicity</Text>
//             <TouchableOpacity
//               style={localStyles.selectRow}
//               onPress={() => openSelectionSheet({
//                 title: 'Ethnicity',
//                 options: ETHNICITY_OPTIONS.map(opt => ({ name: opt, id: opt })),
//                 selected: ethnicity,
//                 onSelect: (value) => {
//                   const newValue = Array.isArray(value) ? value : (value ? [value] : []);
//                   setEthnicity(newValue);
//                 },
//                 allowMultiple: true,
//                 allowUnselect: true,
//               })}
//             >
//               <Text style={[
//                 localStyles.selectRowText,
//                 (!ethnicity || ethnicity.length === 0) && localStyles.selectRowTextPlaceholder
//               ]}>
//                 {ethnicity.length === 0
//                   ? 'Not selected'
//                   : ethnicity.join(', ')}
//               </Text>
//               <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Dorm Selection */}
//         {dorms.length > 0 && (
//           <View style={localStyles.section}>
//             <Text style={localStyles.sectionTitle}>Dorm</Text>
            
//             <View style={localStyles.fieldGroup}>
//               <Text style={localStyles.label}>Residential House</Text>
//               {loadingAffiliations ? (
//                 <ActivityIndicator size="small" color={COLORS.textMuted} style={{ marginTop: 10 }} />
//               ) : (
//                 <TouchableOpacity
//                   style={localStyles.selectRow}
//                   onPress={() => openSelectionSheet({
//                     title: 'Residential house',
//                     options: dorms,
//                     selected: dorm,
//                     onSelect: (value) => {
//                       toggleDorm(value);
//                     },
//                     allowMultiple: false,
//                     allowUnselect: true,
//                   })}
//                 >
//                   <Text style={[
//                     localStyles.selectRowText,
//                     !dorm && localStyles.selectRowTextPlaceholder
//                   ]}>
//                     {dorm 
//                       ? (() => {
//                           // Normalize IDs for comparison
//                           const normalizedDorm = typeof dorm === 'string' ? parseInt(dorm, 10) : dorm;
//                           const found = dorms.find(d => {
//                             const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
//                             return dId === normalizedDorm;
//                           });
//                           return found?.name || 'Not selected';
//                         })()
//                       : 'Not selected'}
//                   </Text>
//                   <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}

//         {/* Affiliations */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Affiliations</Text>
          
//           {loadingAffiliations ? (
//             <View style={localStyles.fieldGroup}>
//               <ActivityIndicator size="small" color={COLORS.textMuted} style={{ marginTop: 10 }} />
//             </View>
//           ) : Object.keys(affiliationsByCategory).length === 0 ? (
//             <View style={localStyles.fieldGroup}>
//               <Text style={localStyles.placeholderText}>
//                 No affiliations available for your school
//               </Text>
//             </View>
//           ) : (
//             sortAffiliationCategories(affiliationsByCategory).map(([categoryName, categoryAffiliations]) => {
//               // Filter out dorms from regular affiliations (normalize IDs for comparison)
//               const nonDormAffiliations = categoryAffiliations.filter(
//                 aff => {
//                   const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                   return !dorms.some(d => {
//                     const dId = typeof d.id === 'string' ? parseInt(d.id, 10) : d.id;
//                     return dId === affId;
//                   });
//                 }
//               );
              
//               if (nonDormAffiliations.length === 0) return null;

//               // Check if this is a single-select category (Greek Life and House)
//               const categoryLower = categoryName.toLowerCase();
//               const isSingleSelect = categoryLower.includes('greek') || categoryLower.includes('house');
              
//               // Get selected affiliations for this category
//               // Normalize IDs for comparison (handle both string and number IDs)
//               const selectedForCategory = isSingleSelect
//                 ? affiliations.find(id => {
//                     const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//                     return nonDormAffiliations.some(aff => {
//                       const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                       return normalizedId === affId;
//                     });
//                   }) || null
//                 : affiliations.filter(id => {
//                     const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//                     return nonDormAffiliations.some(aff => {
//                       const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                       return normalizedId === affId;
//                     });
//                   });

//               return (
//                 <View key={categoryName} style={localStyles.fieldGroup}>
//                   <Text style={localStyles.label}>{categoryName}</Text>
//                   <TouchableOpacity
//                     style={localStyles.selectRow}
//                     onPress={() => {
//                       console.log('Opening selection sheet for:', categoryName);
//                       console.log('Options:', nonDormAffiliations);
//                       console.log('Selected:', selectedForCategory);
                      
//                       openSelectionSheet({
//                         title: categoryName,
//                         options: nonDormAffiliations,
//                         selected: selectedForCategory,
//                         isAffiliationCategory: true,
//                         onSelect: (value) => {
//                           console.log('Selection made:', value, 'isSingleSelect:', isSingleSelect);
//                           console.log('Current affiliations before update:', affiliations);
//                           console.log('nonDormAffiliations:', nonDormAffiliations);
                          
//                           // Remove all affiliations from this category first
//                           // Normalize IDs for comparison (handle both string and number IDs)
//                           const otherAffiliationIds = affiliations.filter(id => {
//                             const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//                             return !nonDormAffiliations.some(aff => {
//                               const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                               return normalizedId === affId;
//                             });
//                           });
//                           console.log('otherAffiliationIds (after removing category):', otherAffiliationIds);
                          
//                           // Add back the newly selected ones
//                           if (isSingleSelect) {
//                             // Single select for Greek Life and House
//                             if (value !== null && value !== undefined) {
//                               const normalizedValue = typeof value === 'string' ? parseInt(value, 10) : value;
//                               const newAffiliations = [...otherAffiliationIds, normalizedValue];
//                               console.log('Setting affiliations (single-select):', newAffiliations);
//                               setAffiliations(newAffiliations);
//                             } else {
//                               console.log('Setting affiliations (unselected):', otherAffiliationIds);
//                               setAffiliations(otherAffiliationIds);
//                             }
//                           } else {
//                             // Multi-select for other categories (Academic Programs, Varsity Athletics, etc.) - value is an array
//                             const newAffiliationIds = Array.isArray(value) 
//                               ? value.map(v => typeof v === 'string' ? parseInt(v, 10) : v).filter(v => v !== null && v !== undefined)
//                               : (value ? [typeof value === 'string' ? parseInt(value, 10) : value] : []);
//                             const newAffiliations = [...otherAffiliationIds, ...newAffiliationIds];
//                             console.log('Setting affiliations (multi-select):', newAffiliations);
//                             setAffiliations(newAffiliations);
//                           }
//                         },
//                         allowMultiple: !isSingleSelect,
//                         allowUnselect: true,
//                       });
//                     }}
//                   >
//                     <Text style={[
//                       localStyles.selectRowText,
//                       (!selectedForCategory || (Array.isArray(selectedForCategory) && selectedForCategory.length === 0)) && localStyles.selectRowTextPlaceholder
//                     ]}>
//                       {isSingleSelect
//                         ? (selectedForCategory
//                             ? (() => {
//                                 // Normalize the selected ID for comparison
//                                 const normalizedSelected = typeof selectedForCategory === 'string' ? parseInt(selectedForCategory, 10) : selectedForCategory;
//                                 const found = nonDormAffiliations.find(aff => {
//                                   const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                                   return affId === normalizedSelected;
//                                 });
//                                 return found?.name || 'Not selected';
//                               })()
//                             : 'Not selected')
//                         : (selectedForCategory.length === 0
//                             ? 'Not selected'
//                             : (() => {
//                                 // For multi-select, show comma-separated names
//                                 const selectedNames = selectedForCategory
//                                   .map(selectedId => {
//                                     const normalizedSelected = typeof selectedId === 'string' ? parseInt(selectedId, 10) : selectedId;
//                                     const found = nonDormAffiliations.find(aff => {
//                                       const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                                       return affId === normalizedSelected;
//                                     });
//                                     return found?.name;
//                                   })
//                                   .filter(Boolean); // Remove any undefined values
//                                 return selectedNames.length > 0 ? selectedNames.join(', ') : 'Not selected';
//                               })())}
//                     </Text>
//                     <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
//                   </TouchableOpacity>
//                 </View>
//               );
//             })
//           )}
          
//           {/* Caption about affiliations */}
//           <View style={localStyles.fieldGroup}>
//             <Text style={[localStyles.placeholderText, { fontStyle: 'italic', marginTop: 8, fontSize: 13, lineHeight: 18 }]}>
//               Remember, this isn't a resume. You can select as many affiliations as you like, but you can choose up to two key ones to highlight on your profile.
//             </Text>
//           </View>
          
//           {/* Key Affiliations Selector */}
//           {affiliations.length > 0 && (() => {
//             // Get all selected affiliations with their names, but order them by featuredAffiliations order
//             const allSelectedAffilsMap = new Map();
//             Object.entries(affiliationsByCategory).forEach(([categoryName, categoryAffiliations]) => {
//               const nonDormAffiliations = categoryAffiliations.filter(
//                 aff => !dorms.some(d => d.id === aff.id)
//               );
//               nonDormAffiliations.forEach(aff => {
//                 const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                 if (affiliations.some(id => {
//                   const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//                   return normalizedId === affId;
//                 })) {
//                   allSelectedAffilsMap.set(affId, aff);
//                 }
//               });
//             });
            
//             // Order affiliations by the order they appear in featuredAffiliations (selection order)
//             // Then append any other selected affiliations that aren't featured
//             const orderedAffils = [];
//             const featuredSet = new Set(featuredAffiliations.map(id => {
//               const normalized = typeof id === 'string' ? parseInt(id, 10) : id;
//               return normalized;
//             }));
            
//             // First, add featured affiliations in their selection order
//             featuredAffiliations.forEach(featuredId => {
//               const normalized = typeof featuredId === 'string' ? parseInt(featuredId, 10) : featuredId;
//               const aff = allSelectedAffilsMap.get(normalized);
//               if (aff) {
//                 orderedAffils.push(aff);
//               }
//             });
            
//             // Then, add any other selected affiliations that aren't featured
//             allSelectedAffilsMap.forEach((aff, affId) => {
//               if (!featuredSet.has(affId)) {
//                 orderedAffils.push(aff);
//               }
//             });
            
//             return (
//               <View style={localStyles.section}>
//                 <Text style={localStyles.sectionTitle}>Key Affiliations</Text>
                
//                 <View style={[localStyles.fieldGroup, { marginTop: 10 }]}>
//                   <Text style={[localStyles.placeholderText, { fontSize: 13 }]}>
//                     Select up to 2 affiliations to feature in your profile preview
//                   </Text>
//                 </View>
                
//                 <View style={localStyles.fieldGroup}>
//                   <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
//                   {orderedAffils.map((aff) => {
//                     const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                     const isSelected = featuredAffiliations.some(featuredId => {
//                       const normalizedFeatured = typeof featuredId === 'string' ? parseInt(featuredId, 10) : featuredId;
//                       return normalizedFeatured === affId;
//                     });
//                     const isDisabled = !isSelected && featuredAffiliations.length >= 2;
                    
//                     return (
//                       <TouchableOpacity
//                         key={aff.id}
//                         onPress={() => {
//                           if (isSelected) {
//                             // Unselect
//                             const newFeatured = featuredAffiliations.filter(featuredId => {
//                               const normalizedFeatured = typeof featuredId === 'string' ? parseInt(featuredId, 10) : featuredId;
//                               return normalizedFeatured !== affId;
//                             });
//                             setFeaturedAffiliations(newFeatured);
//                           } else if (!isDisabled) {
//                             // Select (only if under limit) - preserve order by appending to end
//                             // If we're at the limit, remove the oldest (first) and add the new one at the end
//                             if (featuredAffiliations.length >= 2) {
//                               const newFeatured = [...featuredAffiliations.slice(1), affId];
//                               setFeaturedAffiliations(newFeatured);
//                             } else {
//                               const newFeatured = [...featuredAffiliations, affId];
//                               setFeaturedAffiliations(newFeatured);
//                             }
//                           }
//                         }}
//                         disabled={isDisabled}
//                         style={[
//                           localStyles.chip,
//                           isSelected && localStyles.chipSelected,
//                           isDisabled && { opacity: 0.4 },
//                           { marginBottom: 8 },
//                         ]}
//                       >
//                         <Text
//                           style={isSelected ? localStyles.chipTextSelected : localStyles.chipText}
//                         >
//                           {aff.name}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//                 </View>
//               </View>
//             );
//           })()}
//         </View>

//         {/* Interests */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Interests</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Interests</Text>
//             <TextInput
//               value={interests}
//               onChangeText={setInterests}
//               style={localStyles.input}
//               placeholder="Add your interests"
//               placeholderTextColor={COLORS.textMuted}
//             />
//             <Text style={localStyles.placeholderText}>
//               Interest management coming soon
//             </Text>
//           </View>
//         </View>

//         {/* Dating Intentions */}
//         <View style={localStyles.section}>
//           <Text style={localStyles.sectionTitle}>Dating Intentions</Text>
          
//           <View style={localStyles.fieldGroup}>
//             <Text style={localStyles.label}>Looking for</Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={localStyles.chipRow}
//               contentContainerStyle={localStyles.chipRowContent}
//             >
//               {DATING_INTENTIONS.map((option) => {
//                 const selected = datingIntentions === option;
//                 return (
//                   <TouchableOpacity
//                     key={option}
//                     onPress={() => setDatingIntentions(option)}
//                     style={[localStyles.chip, selected && localStyles.chipSelected]}
//                   >
//                     <Text
//                       style={selected ? localStyles.chipTextSelected : localStyles.chipText}
//                     >
//                       {option}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//         </View>
//       </View>

//         <View style={{ height: 60 }} />
//     </ScrollView>

//       {/* Selection Sheet */}
//       {selectionSheetConfig && (() => {
//         // Calculate current selected value based on current state
//         let currentSelected = selectionSheetConfig.selected;
//         const title = selectionSheetConfig.title;
        
//         // Recalculate selected from current state for reactive updates
//         if (title === 'Residential house' || title === 'Dorm') {
//           // Dorm - use current dorm state
//           currentSelected = dorm;
//         } else if (title === 'Religious beliefs') {
//           // Religious beliefs - use current array state
//           currentSelected = religiousBeliefs;
//         } else if (title === 'Political affiliation') {
//           // Political affiliation - use current string state
//           currentSelected = politicalAffiliation;
//         } else if (title === 'Sexuality') {
//           // Sexuality - use current string state
//           currentSelected = sexuality;
//         } else if (title === 'Ethnicity') {
//           // Ethnicity - use current array state
//           currentSelected = ethnicity;
//         } else if (selectionSheetConfig.isAffiliationCategory) {
//           // If this is an affiliations category, recalculate selected from current affiliations state
//           const categoryName = title;
//           const categoryLower = categoryName.toLowerCase();
//           const isSingleSelect = categoryLower.includes('greek') || categoryLower.includes('house');
//           const categoryAffiliations = selectionSheetConfig.options;
          
//           if (isSingleSelect) {
//             // Single select for Greek Life and House
//             currentSelected = affiliations.find(id => {
//               const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//               return categoryAffiliations.some(aff => {
//                 const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                 return normalizedId === affId;
//               });
//             }) || null;
//           } else {
//             // Multi-select for other categories
//             currentSelected = affiliations.filter(id => {
//               const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
//               return categoryAffiliations.some(aff => {
//                 const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
//                 return normalizedId === affId;
//               });
//             });
//           }
//         }
        
//         return (
//           <SelectionSheet
//             key={`${selectionSheetConfig.title}-${selectionSheetVisible}`}
//             visible={selectionSheetVisible}
//             title={selectionSheetConfig.title}
//             options={selectionSheetConfig.options}
//             selected={currentSelected}
//             onSelect={(value, option) => {
//               console.log('SelectionSheet onSelect called:', value, option);
//               if (selectionSheetConfig.onSelect) {
//                 selectionSheetConfig.onSelect(value, option);
//               }
//               // Don't auto-close - user must click X to close
//             }}
//             onClose={() => {
//               console.log('SelectionSheet onClose called');
//               closeSelectionSheet();
//             }}
//             allowMultiple={selectionSheetConfig.allowMultiple}
//             allowUnselect={selectionSheetConfig.allowUnselect}
//           />
//         );
//       })()}
//     </View>
//   );
// }

// const localStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.surface, // White background like VSCO
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     backgroundColor: COLORS.surface,
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
//     paddingTop: 8,
//     paddingBottom: 40,
//   },
//   section: {
//     marginTop: 40, // Large spacing between sections (VSCO style)
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.textPrimary,
//     letterSpacing: -0.2,
//   },
//   fieldGroup: {
//     marginTop: 20,
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: '400',
//     color: COLORS.textMuted,
//     marginBottom: 10,
//     letterSpacing: 0,
//   },
//   required: {
//     color: COLORS.danger,
//   },
//   input: {
//     backgroundColor: COLORS.backgroundSubtle, // Light gray rounded container
//     borderRadius: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     borderWidth: 0, // No border
//     fontWeight: '400',
//   },
//   textArea: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//     paddingTop: 14,
//   },
//   readonlyField: {
//     backgroundColor: COLORS.backgroundSubtle,
//     borderRadius: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//   },
//   readonlyText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     fontWeight: '400',
//   },
//   chipRow: {
//     marginTop: 4,
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
//   locationButton: {
//     marginTop: 10,
//     paddingVertical: 4,
//   },
//   locationButtonText: {
//     fontSize: 14,
//     color: COLORS.textMuted,
//     fontWeight: '400',
//   },
//   switchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
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
//   affiliationText: {
//     fontSize: 15,
//     color: COLORS.textPrimary,
//     fontWeight: '400',
//     marginTop: 4,
//   },
//   affiliationSubtext: {
//     fontSize: 13,
//     color: COLORS.textMuted,
//     fontWeight: '400',
//     marginTop: 2,
//     lineHeight: 18,
//   },
//   placeholderText: {
//     fontSize: 13,
//     color: COLORS.textMuted,
//     fontWeight: '400',
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
//   selectRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: COLORS.backgroundSubtle,
//     borderRadius: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     marginTop: 4,
//   },
//   selectRowText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     fontWeight: '400',
//     flex: 1,
//   },
//   selectRowTextPlaceholder: {
//     color: COLORS.textMuted,
//   },
// });


// mobile/features/profile/components/ProfileDetailsForm/ProfileDetailsForm.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '@/styles/themeNEW';
import SelectionSheet from '../SelectionSheet';

import { getMySchoolDorms, getMySchoolAffiliations } from '@/api/affiliationsAPI';

import {
  profileToDraft,
  extractDormIdFromAffiliations,
  stripDormIds,
  normalizeIdArray,
} from './utils/profileDraft';

import { buildProfileUpdatePayload } from './utils/profilePayload';
import { sortAffiliationCategories } from './utils/affiliations';

import AboutSection from './sections/AboutSection';
import IdentitySection from './sections/IdentitySection';
import AcademicsSection from './sections/AcademicsSection';
import LocationSection from './sections/LocationSection';
import PersonalDetailsSection from './sections/PersonalDetailsSection';
import DormSection from './sections/DormSection';
import AffiliationsSection from './sections/AffiliationsSection';
import FeaturedAffiliationsSection from './sections/FeaturedAffiliationsSection';

export default function ProfileDetailsForm({ profile, onSave, onClose }) {
  const insets = useSafeAreaInsets();

  // Draft model
  const [draft, setDraft] = useState(() => profileToDraft(profile));
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  // Remote options
  const [dorms, setDorms] = useState([]);
  const [affiliationsByCategory, setAffiliationsByCategory] = useState({});
  const [loadingAffiliations, setLoadingAffiliations] = useState(true);

  // Selection sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(null);

  const schoolLabel =
    profile?.school?.name ||
    profile?.school_name ||
    profile?.school?.short_name ||
    'School not set';

  const schoolId = profile?.school?.id || profile?.school_id;

  // Fetch dorms + affiliations when schoolId changes
  useEffect(() => {
    (async () => {
      if (!schoolId) {
        setLoadingAffiliations(false);
        return;
      }

      setLoadingAffiliations(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setLoadingAffiliations(false);
          return;
        }

        const [dormsData, affiliationsData] = await Promise.all([
          getMySchoolDorms(token).catch(() => []),
          getMySchoolAffiliations(token).catch(() => ({})),
        ]);

        setDorms(Array.isArray(dormsData) ? dormsData : []);
        setAffiliationsByCategory(affiliationsData || {});

        // Split dorm out of draft affiliations once dorm list is known
        setDraft((prev) => {
          const dormId = extractDormIdFromAffiliations(prev.affiliations, dormsData);
          const nonDorm = stripDormIds(prev.affiliations, dormsData);
          return {
            ...prev,
            dormId: dormId ?? prev.dormId,
            affiliations: normalizeIdArray(nonDorm),
          };
        });
      } finally {
        setLoadingAffiliations(false);
      }
    })();
  }, [schoolId]);

  const sortedAffiliationEntries = useMemo(() => {
    return sortAffiliationCategories(affiliationsByCategory);
  }, [affiliationsByCategory]);

  function openSelectionSheet(config) {
    setSheetConfig(config);
    setSheetVisible(true);
  }

  function closeSelectionSheet() {
    setSheetVisible(false);
    setSheetConfig(null);
  }

  function submit() {
    try {
      const payload = buildProfileUpdatePayload(profile, draft);
      onSave(payload);
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
      if (__DEV__) console.warn('ProfileDetailsForm submit error:', e);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface, paddingTop: insets.top }}>
      {/* Header */}
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ paddingHorizontal: 4, paddingVertical: 4 }}
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
        <AboutSection draft={draft} setField={setField} />

        <IdentitySection
          draft={draft}
          setField={setField}
          openSelectionSheet={openSelectionSheet}
        />

        <AcademicsSection
          draft={draft}
          setField={setField}
          schoolLabel={schoolLabel}
        />

        <LocationSection draft={draft} setField={setField} />

        <PersonalDetailsSection
          draft={draft}
          setField={setField}
          openSelectionSheet={openSelectionSheet}
        />

        <DormSection
          draft={draft}
          setField={setField}
          dorms={dorms}
          loading={loadingAffiliations}
          openSelectionSheet={openSelectionSheet}
        />

        <AffiliationsSection
          draft={draft}
          setField={setField}
          dorms={dorms}
          loading={loadingAffiliations}
          sortedAffiliationEntries={sortedAffiliationEntries}
          openSelectionSheet={openSelectionSheet}
        />

        <FeaturedAffiliationsSection
          draft={draft}
          setField={setField}
          dorms={dorms}
          affiliationsByCategory={affiliationsByCategory}
        />
      </ScrollView>

      {/* Selection sheet */}
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
