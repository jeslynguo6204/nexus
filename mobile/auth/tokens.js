import { fetchAuthSession } from 'aws-amplify/auth';

export async function getIdToken(options = {}) {
  try {
    const session = await fetchAuthSession({
      forceRefresh: Boolean(options.forceRefresh),
    });
    return session?.tokens?.idToken?.toString() || null;
  } catch (error) {
    return null;
  }
}

export async function getAccessToken(options = {}) {
  try {
    const session = await fetchAuthSession({
      forceRefresh: Boolean(options.forceRefresh),
    });
    return session?.tokens?.accessToken?.toString() || null;
  } catch (error) {
    return null;
  }
}

export async function authHeaders(options = {}) {
  const token = await getIdToken(options);
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}
