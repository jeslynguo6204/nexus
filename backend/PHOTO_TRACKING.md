# Photo Tracking Implementation Guide

## Overview
Photo tracking has been implemented to track when users view, like, or pass on photos. The backend now supports three metrics:
- `seen_count`: Increments when a user views a photo on a profile card
- `like_count`: Increments when a user swipes right/likes on that photo
- `pass_count`: Increments when a user swipes left/passes on that photo

## Backend Endpoints

All endpoints require authentication (Bearer token).

### 1. Track Photo View
**Endpoint:** `POST /photos/:photoId/view`
**Description:** Increments the `seen_count` for a photo when it's viewed on a profile card

**Example:**
```javascript
POST http://localhost:4000/photos/123/view
Authorization: Bearer <token>
```

**Response:**
```json
{ "success": true }
```

### 2. Track Photo Like
**Endpoint:** `POST /photos/:photoId/like`
**Description:** Increments the `like_count` for a photo when the user swipes right on that photo

**Example:**
```javascript
POST http://localhost:4000/photos/456/like
Authorization: Bearer <token>
```

**Response:**
```json
{ "success": true }
```

### 3. Track Photo Pass
**Endpoint:** `POST /photos/:photoId/pass`
**Description:** Increments the `pass_count` for a photo when the user swipes left on that photo

**Example:**
```javascript
POST http://localhost:4000/photos/789/pass
Authorization: Bearer <token>
```

**Response:**
```json
{ "success": true }
```

## Mobile Integration

### Where to Call These Endpoints

#### 1. Track Photo Views
Call the view endpoint when a user sees a photo on a profile card. This should be triggered in:

**File:** `mobile/features/home/components/ProfileCardNew.js`

Add tracking when photos are displayed or changed:

```javascript
// In ProfileCardNew component
useEffect(() => {
  // Track view when photo is displayed
  if (currentUri && safePhotos[photoIndex]?.id) {
    trackPhotoView(safePhotos[photoIndex].id);
  }
}, [photoIndex]); // Track when photo index changes
```

#### 2. Track Photo Likes
Call the like endpoint when a user swipes right. This should be in:

**File:** `mobile/features/home/screens/HomeScreenNew.js`

```javascript
async function handleSwipeRight(profile) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Not signed in');
    
    console.log(`✅ Profile ${myUserId} LIKED profile ${profile?.user_id}`);
    
    // Track the like on the current photo being viewed
    if (profile?.photos && profile.photos.length > 0) {
      const currentPhotoId = profile.photos[0].id; // or track which photo was visible
      await trackPhotoLike(token, currentPhotoId);
    }
  } catch (e) {
    console.warn(e);
    Alert.alert('Error', String(e.message || e));
  }
}
```

#### 3. Track Photo Passes
Call the pass endpoint when a user swipes left. This should be in:

**File:** `mobile/features/home/screens/HomeScreenNew.js`

```javascript
async function handleSwipeLeft(profile) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Not signed in');
    
    console.log(`⏭️  Profile ${myUserId} PASSED ON profile ${profile?.user_id}`);
    
    // Track the pass on the current photo being viewed
    if (profile?.photos && profile.photos.length > 0) {
      const currentPhotoId = profile.photos[0].id; // or track which photo was visible
      await trackPhotoPass(token, currentPhotoId);
    }
  } catch (e) {
    console.warn(e);
    Alert.alert('Error', String(e.message || e));
  }
}
```

### API Helper Functions

Create these helper functions in `mobile/api/photosAPI.js`:

```javascript
// Track when a photo is viewed
export async function trackPhotoView(token, photoId) {
  const response = await fetch(`${API_URL}/photos/${photoId}/view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to track photo view');
  }
  
  return response.json();
}

// Track when a photo is liked (swipe right)
export async function trackPhotoLike(token, photoId) {
  const response = await fetch(`${API_URL}/photos/${photoId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to track photo like');
  }
  
  return response.json();
}

// Track when a photo is passed (swipe left)
export async function trackPhotoPass(token, photoId) {
  const response = await fetch(`${API_URL}/photos/${photoId}/pass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to track photo pass');
  }
  
  return response.json();
}
```

## Implementation Notes

1. **Which photo to track**: You need to determine which photo was being viewed when the swipe occurred. Options:
   - Track only the first/primary photo
   - Pass the current `photoIndex` from `ProfileCardNew` up to the swipe handlers
   - Store the current photo ID in state when the user views a profile

2. **Photo viewing logic**: The view tracking should fire when:
   - A profile card is first displayed
   - The user cycles through photos on a card (tapping left/right zones)
   - Consider debouncing to avoid excessive API calls

3. **Error handling**: All tracking calls should fail silently (catch errors but don't show alerts) to avoid disrupting the user experience.

4. **Performance**: These are fire-and-forget calls - don't wait for them to complete before proceeding with the swipe action.

## Example: Tracking Current Photo on Swipe

To properly track which photo was visible when swiping, you can:

1. Lift the `photoIndex` state from `ProfileCardNew` to `SwipeDeckNew`
2. Pass the current photo ID when calling swipe handlers:

```javascript
// In SwipeDeckNew.js
function animateOut(isRight, topProfile, currentPhotoIndex) {
  // ... animation code ...
  if (isRight) onSwipeRight?.(topProfile, currentPhotoIndex);
  else onSwipeLeft?.(topProfile, currentPhotoIndex);
  // ...
}

// In HomeScreenNew.js
async function handleSwipeRight(profile, photoIndex = 0) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Not signed in');
    
    if (profile?.photos && profile.photos[photoIndex]) {
      const photoId = profile.photos[photoIndex].id;
      await trackPhotoLike(token, photoId);
    }
  } catch (e) {
    console.warn('Failed to track photo like:', e);
    // Don't show alert - fail silently
  }
}
```

## Testing

Test the endpoints using curl:

```bash
# Get your auth token first
TOKEN="your-jwt-token-here"

# Track a photo view
curl -X POST http://localhost:4000/photos/1/view \
  -H "Authorization: Bearer $TOKEN"

# Track a photo like
curl -X POST http://localhost:4000/photos/1/like \
  -H "Authorization: Bearer $TOKEN"

# Track a photo pass
curl -X POST http://localhost:4000/photos/1/pass \
  -H "Authorization: Bearer $TOKEN"
```
