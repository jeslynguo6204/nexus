// // mobile/screens/AuthScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import styles from '../styles/AuthStyles';

// const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

// export default function AuthScreen({ onSignedIn }) {
//   const [mode, setMode] = useState('login');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [gender, setGender] = useState('');
//   const [dateOfBirth, setDateOfBirth] = useState('');
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit() {
//     try {
//       setLoading(true);
//       setError('');

//       // client-side validation for signup
//       if (mode === 'signup') {
//         if (!fullName?.trim()) {
//           setError('Please enter your full name');
//           return;
//         }
//         if (!gender) {
//           setError('Please select your gender');
//           return;
//         }
//         if (!dateOfBirth) {
//           setError('Please select your date of birth');
//           return;
//         }
//         // basic DOB format check YYYY-MM-DD
//         if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
//           setError('Date of birth must be in YYYY-MM-DD format');
//           return;
//         }
//         const dobDate = new Date(dateOfBirth);
//         if (isNaN(dobDate.getTime())) {
//           setError('Date of birth is invalid');
//           return;
//         }
//         const now = new Date();
//         if (dobDate > now) {
//           setError('Date of birth cannot be in the future');
//           return;
//         }
//       }

//       const path = mode === 'login' ? '/auth/login' : '/auth/signup';
//       const body =
//         mode === 'login'
//           ? { email, password }
//           : { email, password, fullName, dateOfBirth, gender }; // include new fields for signup

//       const res = await fetch(`${API_BASE}${path}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       const json = await res.json();
//       if (!res.ok) {
//         throw new Error(json.error || 'Auth failed');
//       }

//       // let parent store token, etc.
//       onSignedIn(json);
//     } catch (e) {
//       Alert.alert('Error', String(e.message || e));
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <ScrollView
//         contentContainerStyle={styles.content}
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.logoCircle}>
//           <Text style={styles.logoText}>6°</Text>
//         </View>

//         <Text style={styles.appName}>Six Degrees</Text>
//         <Text style={styles.subtitle}>
//           Meet people just a few connections away.
//         </Text>

//         <View style={styles.modeToggle}>
//           <TouchableOpacity
//             style={[
//               styles.modeButton,
//               mode === 'login' && styles.modeButtonActive,
//             ]}
//             onPress={() => setMode('login')}
//           >
//             <Text
//               style={[
//                 styles.modeButtonText,
//                 mode === 'login' && styles.modeButtonTextActive,
//               ]}
//             >
//               Log in
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.modeButton,
//               mode === 'signup' && styles.modeButtonActive,
//             ]}
//             onPress={() => setMode('signup')}
//           >
//             <Text
//               style={[
//                 styles.modeButtonText,
//                 mode === 'signup' && styles.modeButtonTextActive,
//               ]}
//             >
//               Sign up
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.card}>
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//           {mode === 'signup' && (
//             <>
//               <Text style={styles.label}>Full name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={fullName}
//                 onChangeText={setFullName}
//                 placeholder="Jane Doe"
//                 autoCapitalize="words"
//               />

//               <Text style={styles.label}>Gender</Text>
//               <View style={styles.pickerWrap}>
//                 <Picker
//                   selectedValue={gender}
//                   onValueChange={(val) => setGender(val)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="Select gender..." value="" />
//                   <Picker.Item label="Female" value="female" />
//                   <Picker.Item label="Male" value="male" />
//                   <Picker.Item label="Non-binary" value="non-binary" />
//                   <Picker.Item label="Other" value="other" />
//                 </Picker>
//               </View>

//               <Text style={styles.label}>Date of birth</Text>
//               <TouchableOpacity
//                 style={styles.input}
//                 onPress={() => setShowDatePicker(true)}
//               >
//                 <Text>{dateOfBirth || 'YYYY-MM-DD'}</Text>
//               </TouchableOpacity>

//               {showDatePicker && (
//                 <DateTimePicker
//                   value={selectedDate ? new Date(selectedDate) : new Date(2000, 0, 1)}
//                   mode="date"
//                   maximumDate={new Date()}
//                   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                   onChange={(event, picked) => {
//                     if (Platform.OS === 'android') setShowDatePicker(false);
//                     if (picked) {
//                       const d = picked instanceof Date ? picked : new Date(picked);
//                       setSelectedDate(d.toISOString());
//                       const yyyy = d.getFullYear();
//                       const mm = String(d.getMonth() + 1).padStart(2, '0');
//                       const dd = String(d.getDate()).padStart(2, '0');
//                       setDateOfBirth(`${yyyy}-${mm}-${dd}`);
//                     }
//                   }}
//                 />
//               )}
//             </>
//           )}

//           <Text style={styles.label}>Email</Text>
//           <TextInput
//             style={styles.input}
//             value={email}
//             onChangeText={setEmail}
//             placeholder="you@school.edu"
//             autoCapitalize="none"
//             keyboardType="email-address"
//           />

//           <Text style={styles.label}>Password</Text>
//           <TextInput
//             style={styles.input}
//             value={password}
//             onChangeText={setPassword}
//             placeholder="••••••••"
//             secureTextEntry
//           />

//           <TouchableOpacity
//             style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
//             onPress={handleSubmit}
//             disabled={loading}
//           >
//             <Text style={styles.primaryButtonText}>
//               {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }
