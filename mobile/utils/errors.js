export function formatUserError(error, fallback = 'Something went wrong. Please try again.') {
  const rawMessage = typeof error === 'string'
    ? error
    : error?.response?.error || error?.message || String(error || '');
  const message = String(rawMessage || '').trim();
  const lower = message.toLowerCase();

  if (!message) {
    return fallback;
  }

  if (lower.includes('network') || lower.includes('timeout') || lower.includes('timed out')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (lower.includes('not authenticated') || lower.includes('not authorized') || lower.includes('invalid or expired token')) {
    return 'Your session expired. Please sign in again.';
  }

  if (lower.includes('limit exceeded') || lower.includes('attempt limit') || lower.includes('too many')) {
    return 'Too many attempts. Please wait a bit before trying again.';
  }

  if (lower.includes('invalid code') || lower.includes('expired')) {
    return 'That code expired. Tap Resend to get a new one.';
  }

  if (lower.includes('account already completed')) {
    return 'Account already completed. Please sign in instead.';
  }

  if (lower.includes('user not found') || lower.includes('does not exist')) {
    return 'Account not found. Please check your email.';
  }

  if (lower.includes('incorrect username or password') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password.';
  }

  if (lower.includes('school email')) {
    return 'Please use your .edu email.';
  }

  if (lower.includes("isn't supported") || lower.includes('not supported')) {
    return "That school isn't supported yet.";
  }

  return fallback;
}

export function logAppError(error, context = {}) {
  const payload = {
    message: error?.message || String(error || ''),
    name: error?.name || error?.__type,
    stack: error?.stack,
    context,
  };
  console.warn('APP_ERROR', payload);
}
