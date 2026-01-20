# Profiles Module Testing Guide

This guide provides multiple ways to test the profiles module to verify all 21 columns are working correctly.

## Prerequisites

1. Make sure your backend server is running:
   ```bash
   cd backend
   npm run dev
   ```

2. Ensure you have a test user account (or create one via signup)

## Method 1: Automated Test Script

A Node.js test script is provided that tests all fields automatically.

### Setup

If you're using Node.js < 18, install node-fetch:
```bash
cd backend
npm install node-fetch@2
```

Then add this line at the top of `test-profiles.js`:
```javascript
const fetch = require('node-fetch');
```

### Run the Test

1. Edit `test-profiles.js` and update:
   - `TEST_EMAIL`: Your test user's email
   - `TEST_PASSWORD`: Your test user's password
   - `BASE_URL`: Your server URL (default: http://localhost:4000)

2. Run the test:
   ```bash
   node test-profiles.js
   ```

The script will:
- ✅ Login and get auth token
- ✅ Retrieve profile and verify all fields are returned
- ✅ Update profile with all fields and verify they're stored
- ✅ Test partial updates for individual fields
- ✅ Test validation rules

## Method 2: Manual Testing with cURL

### Step 1: Login and Get Token

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the `token` from the response.

### Step 2: Get Current Profile (Retrieve Test)

```bash
curl -X GET http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Verify:** Check that all 21 fields are present in the response:
- `user_id`, `display_name`, `bio`, `major`, `graduation_year`, `academic_year`
- `is_dating_enabled`, `is_friends_enabled`
- `dating_gender_preference`, `friends_gender_preference`
- `min_age_preference`, `max_age_preference`, `max_distance_km`
- `show_me_in_discovery`
- `location_lat`, `location_lon`, `location_description`
- `interests`, `photos`, `affiliations`
- `updated_at`

### Step 3: Update Profile (Store/Update Test)

Test updating all fields at once:

```bash
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "bio": "This is my bio",
    "major": "Computer Science",
    "graduationYear": 2025,
    "academicYear": 3,
    "isDatingEnabled": true,
    "isFriendsEnabled": true,
    "datingGenderPreference": "everyone",
    "friendsGenderPreference": "everyone",
    "minAgePreference": 20,
    "maxAgePreference": 30,
    "maxDistanceKm": 50,
    "showMeInDiscovery": true,
    "locationLat": "40.7128",
    "locationLon": "-74.0060",
    "locationDescription": "New York, NY",
    "interests": ["coding", "hiking", "reading"],
    "photos": ["https://example.com/photo1.jpg"],
    "affiliations": ["Computer Science Club"]
  }'
```

**Verify:** The response should include all updated fields.

### Step 4: Test Individual Field Updates

Test each newly added field individually:

```bash
# Test academic_year
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"academicYear": 4}'

# Test location_lat
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"locationLat": "40.7580"}'

# Test location_lon
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"locationLon": "-73.9855"}'

# Test location_description
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"locationDescription": "Times Square, NYC"}'

# Test affiliations
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"affiliations": ["New Club", "Another Club"]}'
```

After each update, run the GET request again to verify the field was saved.

## Method 3: Using Postman or Insomnia

1. **Create a Collection:**
   - Login request (POST `/auth/login`)
   - Get Profile (GET `/profiles/me`)
   - Update Profile (PATCH `/profiles/me`)

2. **Set up Environment Variables:**
   - `base_url`: http://localhost:4000
   - `token`: (set automatically from login response)

3. **Test Flow:**
   - Run login → save token
   - Run GET profile → verify all fields
   - Run PATCH with full update → verify response
   - Run GET again → verify changes persisted

## Method 4: Direct Database Verification

After making updates via API, you can verify directly in the database:

```sql
SELECT 
  user_id,
  display_name,
  bio,
  major,
  graduation_year,
  academic_year,
  is_dating_enabled,
  is_friends_enabled,
  dating_gender_preference,
  friends_gender_preference,
  min_age_preference,
  max_age_preference,
  max_distance_km,
  show_me_in_discovery,
  location_lat,
  location_lon,
  location_description,
  interests,
  photos,
  affiliations,
  updated_at
FROM profiles
WHERE user_id = YOUR_USER_ID;
```

## Expected Results

### ✅ Successful Tests Should Show:

1. **GET /profiles/me** returns all 21 fields
2. **PATCH /profiles/me** accepts all fields and returns updated profile
3. **Partial updates** work for individual fields
4. **Validation** rejects invalid data (e.g., minAge > maxAge, invalid enums)

### ❌ Common Issues to Check:

- Missing fields in GET response → Check DAO SELECT query
- Fields not updating → Check service layer mapping
- Validation errors → Check validation schema
- Type mismatches → Check TypeScript interfaces

## Field Mapping Reference

| Database Column | API Field (camelCase) | Type |
|----------------|----------------------|------|
| `user_id` | (from auth) | number |
| `display_name` | `displayName` | string |
| `bio` | `bio` | string |
| `major` | `major` | string |
| `graduation_year` | `graduationYear` | number |
| `academic_year` | `academicYear` | number |
| `is_dating_enabled` | `isDatingEnabled` | boolean |
| `is_friends_enabled` | `isFriendsEnabled` | boolean |
| `dating_gender_preference` | `datingGenderPreference` | enum |
| `friends_gender_preference` | `friendsGenderPreference` | enum |
| `min_age_preference` | `minAgePreference` | number |
| `max_age_preference` | `maxAgePreference` | number |
| `max_distance_km` | `maxDistanceKm` | number |
| `show_me_in_discovery` | `showMeInDiscovery` | boolean |
| `location_lat` | `locationLat` | string |
| `location_lon` | `locationLon` | string |
| `location_description` | `locationDescription` | string |
| `interests` | `interests` | string[] |
| `photos` | `photos` | string[] |
| `affiliations` | `affiliations` | string[] |
| `updated_at` | (auto-managed) | string |

## Quick Validation Test

Test that validation works correctly:

```bash
# Should fail: minAge > maxAge
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"minAgePreference": 30, "maxAgePreference": 20}'
# Expected: 400 Bad Request

# Should fail: invalid enum
curl -X PATCH http://localhost:4000/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"datingGenderPreference": "invalid"}'
# Expected: 400 Bad Request
```

