/**
 * Test script for Profiles API
 * 
 * Usage:
 * 1. Make sure your backend server is running (npm run dev)
 * 2. Update BASE_URL and credentials below
 * 3. Run: node test-profiles.js
 */
const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:4000';
let authToken = null;
let userId = null;

// Test credentials - UPDATE THESE
const TEST_EMAIL = 'cbegg@wharton.upenn.edu';
const TEST_PASSWORD = 'test';

// Helper function to make API calls
async function apiCall(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, options);
    
    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      data = { error: `Invalid JSON response: ${text.substring(0, 200)}` };
    }
    
    return { status: response.status, data };
  } catch (error) {
    const errorMsg = error.message || String(error);
    const isConnectionError = errorMsg.includes('ECONNREFUSED') || 
                              errorMsg.includes('fetch failed') ||
                              errorMsg.includes('request to') && errorMsg.includes('failed');
    
    if (isConnectionError) {
      console.error(`\n❌ Connection Error: Cannot connect to ${BASE_URL}`);
      console.error(`   Make sure your server is running: npm run dev`);
      console.error(`   Error: ${errorMsg}`);
    } else {
      console.error('API Call Error:', errorMsg);
    }
    return { status: 0, data: { error: errorMsg } };
  }
}

// Test 1: Login to get auth token
async function testLogin() {
  console.log('\n=== Test 1: Login ===');
  const result = await apiCall('POST', '/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (result.status === 0) {
    // Connection error already logged in apiCall
    return false;
  }

  if (result.status === 200 && result.data.token) {
    authToken = result.data.token;
    userId = result.data.user?.id;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    if (result.status === 401) {
      console.log('   → Check your email and password');
    }
    return false;
  }
}

// Test 2: Get current profile (retrieve all fields)
async function testGetProfile() {
  console.log('\n=== Test 2: Get Profile (Retrieve) ===');
  const result = await apiCall('GET', '/profiles/me', null, authToken);

  if (result.status === 200 && result.data.profile) {
    const profile = result.data.profile;
    console.log('✅ Profile retrieved successfully');
    console.log('\nRetrieved fields:');
    
    const expectedFields = [
      'user_id',
      'display_name',
      'bio',
      'major',
      'graduation_year',
      'academic_year',
      'is_dating_enabled',
      'is_friends_enabled',
      'dating_gender_preference',
      'friends_gender_preference',
      'min_age_preference',
      'max_age_preference',
      'max_distance_km',
      'show_me_in_discovery',
      'location_lat',
      'location_lon',
      'location_description',
      'interests',
      'photos',
      'affiliations',
      'updated_at',
    ];

    expectedFields.forEach(field => {
      const value = profile[field];
      const status = value !== undefined ? '✅' : '❌';
      console.log(`   ${status} ${field}: ${JSON.stringify(value)}`);
    });

    return true;
  } else {
    console.log('❌ Get profile failed:', result.data);
    return false;
  }
}

// Test 3: Update profile with all fields
async function testUpdateProfile() {
  console.log('\n=== Test 3: Update Profile (Store/Update) ===');
  
  const updateData = {
    displayName: 'Test User Updated',
    bio: 'This is a test bio to verify the profile update functionality works correctly.',
    major: 'Computer Science',
    graduationYear: 2025,
    academicYear: 'Junior', // ENUM: 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'
    isDatingEnabled: true,
    isFriendsEnabled: true,
    datingGenderPreference: 'everyone',
    friendsGenderPreference: 'everyone',
    minAgePreference: 20,
    maxAgePreference: 30,
    maxDistanceKm: 50,
    showMeInDiscovery: true,
    locationLat: '40.7128',
    locationLon: '-74.0060',
    locationDescription: 'New York, NY',
    interests: ['coding', 'hiking', 'reading', 'music'],
    photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    // NOTE: affiliations is an array of affiliation IDs (integers)
    // Update these with actual affiliation IDs from your database
    // You can query: SELECT id, name FROM affiliations;
    affiliations: [1, 2],
  };

  console.log('Sending update with all fields...');
  const result = await apiCall('PATCH', '/profiles/me', updateData, authToken);

  if (result.status === 200 && result.data.profile) {
    console.log('✅ Profile updated successfully');
    const profile = result.data.profile;
    
    // Verify all fields were updated
    console.log('\nUpdated fields verification:');
    const checks = [
      { field: 'display_name', expected: updateData.displayName },
      { field: 'bio', expected: updateData.bio },
      { field: 'major', expected: updateData.major },
      { field: 'graduation_year', expected: updateData.graduationYear },
      { field: 'academic_year', expected: updateData.academicYear },
      { field: 'is_dating_enabled', expected: updateData.isDatingEnabled },
      { field: 'is_friends_enabled', expected: updateData.isFriendsEnabled },
      { field: 'dating_gender_preference', expected: updateData.datingGenderPreference },
      { field: 'friends_gender_preference', expected: updateData.friendsGenderPreference },
      { field: 'min_age_preference', expected: updateData.minAgePreference },
      { field: 'max_age_preference', expected: updateData.maxAgePreference },
      { field: 'max_distance_km', expected: updateData.maxDistanceKm },
      { field: 'show_me_in_discovery', expected: updateData.showMeInDiscovery },
      { field: 'location_lat', expected: updateData.locationLat },
      { field: 'location_lon', expected: updateData.locationLon },
      { field: 'location_description', expected: updateData.locationDescription },
      { field: 'interests', expected: updateData.interests },
      { field: 'photos', expected: updateData.photos },
      { field: 'affiliations', expected: updateData.affiliations },
    ];

    checks.forEach(({ field, expected }) => {
      const actual = profile[field];
      // For location coordinates, compare as numbers (handles decimal formatting)
      let match;
      if (field === 'location_lat' || field === 'location_lon') {
        match = actual !== null && expected !== null && 
                Math.abs(parseFloat(actual) - parseFloat(expected)) < 0.0001;
      } else {
        match = JSON.stringify(actual) === JSON.stringify(expected);
      }
      const status = match ? '✅' : '❌';
      console.log(`   ${status} ${field}`);
      if (!match) {
        console.log(`      Expected: ${JSON.stringify(expected)}`);
        console.log(`      Actual: ${JSON.stringify(actual)}`);
      }
    });

    return true;
  } else {
    console.log('❌ Update profile failed:', result.data);
    return false;
  }
}

// Test 4: Partial update (test individual fields)
async function testPartialUpdate() {
  console.log('\n=== Test 4: Partial Update (Individual Fields) ===');
  
  const partialUpdates = [
    { field: 'academicYear', value: 'Senior', dbField: 'academic_year' }, // ENUM value
    { field: 'locationLat', value: '40.7580', dbField: 'location_lat' },
    { field: 'locationLon', value: '-73.9855', dbField: 'location_lon' },
    { field: 'locationDescription', value: 'Times Square, NYC', dbField: 'location_description' },
    { field: 'affiliations', value: [3], dbField: 'affiliations' }, // Array of affiliation IDs
  ];

  for (const { field, value, dbField } of partialUpdates) {
    console.log(`\nTesting ${field}...`);
    const result = await apiCall('PATCH', '/profiles/me', { [field]: value }, authToken);
    
    if (result.status === 200) {
      const actual = result.data.profile[dbField];
      // For location coordinates, compare as numbers (handles decimal formatting)
      let match;
      if (dbField === 'location_lat' || dbField === 'location_lon') {
        match = actual !== null && value !== null && 
                Math.abs(parseFloat(actual) - parseFloat(value)) < 0.0001;
      } else {
        match = JSON.stringify(actual) === JSON.stringify(value);
      }
      const status = match ? '✅' : '❌';
      console.log(`   ${status} ${field}: ${JSON.stringify(actual)}`);
      if (!match) {
        console.log(`      Expected: ${JSON.stringify(value)}`);
      }
    } else {
      console.log(`   ❌ Failed: ${result.data.error || JSON.stringify(result.data)}`);
    }
  }
}

// Test 5: Validation tests
async function testValidation() {
  console.log('\n=== Test 5: Validation Tests ===');
  
  const invalidTests = [
    { name: 'Invalid minAge > maxAge', data: { minAgePreference: 30, maxAgePreference: 20 } },
    { name: 'Invalid academicYear (not in enum)', data: { academicYear: 'InvalidYear' } },
    { name: 'Invalid maxDistanceKm (too high)', data: { maxDistanceKm: 1000 } },
    { name: 'Invalid gender preference', data: { datingGenderPreference: 'invalid' } },
    { name: 'Too many interests', data: { interests: Array(60).fill('interest') } },
    { name: 'Too many photos', data: { photos: Array(10).fill('https://example.com/photo.jpg') } },
    { name: 'Too many affiliations', data: { affiliations: Array(25).fill(1) } },
    { name: 'Invalid affiliations (strings instead of IDs)', data: { affiliations: ['Invalid'] } },
  ];

  for (const test of invalidTests) {
    const result = await apiCall('PATCH', '/profiles/me', test.data, authToken);
    if (result.status === 400) {
      console.log(`   ✅ ${test.name}: Correctly rejected`);
    } else {
      console.log(`   ❌ ${test.name}: Should have been rejected but got status ${result.status}`);
    }
  }
}

// Health check
async function checkServerHealth() {
  console.log('🔍 Checking server connection...');
  const result = await apiCall('GET', '/health', null, null);
  
  if (result.status === 200 && result.data.ok) {
    console.log('✅ Server is running\n');
    return true;
  } else {
    console.log('❌ Server is not responding');
    console.log(`   Status: ${result.status}`);
    console.log(`   Make sure your server is running: cd backend && npm run dev\n`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Profiles API Tests\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Email: ${TEST_EMAIL}\n`);

  // Check if fetch is available (Node 18+)
  if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ or you need to install node-fetch');
    console.log('   Run: npm install node-fetch@2');
    console.log('   Then add: const fetch = require("node-fetch"); at the top');
    return;
  }

  // Check server health first
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    return;
  }

  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication.');
    console.log('   → Please check your email and password');
    return;
  }

  await testGetProfile();
  await testUpdateProfile();
  await testPartialUpdate();
  await testValidation();

  console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);

