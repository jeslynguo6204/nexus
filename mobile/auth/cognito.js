import {
  confirmResetPassword,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  signIn,
  signUp,
} from 'aws-amplify/auth';

const ALLOWED_EMAIL_DOMAINS = ['.edu'];

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const isAllowedDomain = (email) => {
  if (!email.includes('@')) return false;
  return ALLOWED_EMAIL_DOMAINS.some((domain) => email.endsWith(domain));
};

const formatAuthError = (error) => {
  const name = error?.name || error?.__type || 'AuthError';
  const message = error?.message || 'Unknown error';
  const details = error?.cause?.message ? ` (${error.cause.message})` : '';
  return `${name}: ${message}${details}`;
};

const serializeAuthError = (error) => {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch (e) {
    return String(error);
  }
};

export async function startEmailSignup(email, password) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Please enter your school email');
  }
  if (!isAllowedDomain(normalizedEmail)) {
    throw new Error('Please use your .edu email');
  }
  if (!password) {
    throw new Error('Please enter a password');
  }

  try {
    await signUp({
      username: normalizedEmail,
      password,
      options: {
        userAttributes: {
          email: normalizedEmail,
        },
      },
    });
  } catch (error) {
    console.warn('Amplify signUp error:', error);
    console.warn('Amplify signUp error details:', serializeAuthError(error));
    throw new Error(formatAuthError(error));
  }

  return normalizedEmail;
}

export async function confirmEmailOtp(email, code) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !code?.trim()) {
    throw new Error('Please enter the code from your email');
  }

  try {
    await confirmSignUp({
      username: normalizedEmail,
      confirmationCode: code.trim(),
    });
  } catch (error) {
    console.warn('Amplify confirmSignUp error:', error);
    console.warn('Amplify confirmSignUp error details:', serializeAuthError(error));
    throw new Error(formatAuthError(error));
  }
}

export async function login(email, password) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw new Error('Please enter email and password');
  }

  try {
    return await signIn({
      username: normalizedEmail,
      password,
    });
  } catch (error) {
    console.warn('Amplify signIn error:', error);
    console.warn('Amplify signIn error details:', serializeAuthError(error));
    throw new Error(formatAuthError(error));
  }
}

export async function resendOtp(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Please enter your email');
  }

  try {
    await resendSignUpCode({ username: normalizedEmail });
  } catch (error) {
    console.warn('Amplify resendSignUpCode error:', error);
    console.warn('Amplify resendSignUpCode error details:', serializeAuthError(error));
    throw new Error(formatAuthError(error));
  }
}

export async function startPasswordReset(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Please enter your email');
  }
  if (!isAllowedDomain(normalizedEmail)) {
    throw new Error('Please use your .edu email');
  }

  try {
    await resetPassword({ username: normalizedEmail });
  } catch (error) {
    console.warn('Amplify resetPassword error:', error);
    console.warn('Amplify resetPassword error details:', serializeAuthError(error));
    throw new Error(formatAuthError(error));
  }
}

export async function confirmPasswordReset(email, code, newPassword) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !code?.trim() || !newPassword) {
    throw new Error('Please enter the code and a new password');
  }

  try {
    await confirmResetPassword({
      username: normalizedEmail,
      confirmationCode: code.trim(),
      newPassword,
    });
  } catch (error) {
    console.warn('Amplify confirmResetPassword error:', error);
    console.warn('Amplify confirmResetPassword error details:', serializeAuthError(error));
    throw new Error(formatAuthError(error));
  }
}
