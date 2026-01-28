import { fetchAuthSession } from 'aws-amplify/auth';

export async function getIdToken() {
  try {
    const session = await fetchAuthSession();
    return session?.tokens?.idToken?.toString() || null;
  } catch (error) {
    return null;
  }
}

export async function getAccessToken() {
  try {
    const session = await fetchAuthSession();
    return session?.tokens?.accessToken?.toString() || null;
  } catch (error) {
    return null;
  }
}

export async function authHeaders() {
  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}
