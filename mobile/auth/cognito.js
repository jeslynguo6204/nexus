import {
  confirmResetPassword,
  confirmSignUp,
  deleteUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signUp,
  signOut,
} from 'aws-amplify/auth';
import { checkEmail, cleanupSignup } from '../api/authAPI';

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

export async function deleteSignupUser(email, password) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw new Error('Missing account credentials');
  }

  try {
    try {
      await signOut();
    } catch (error) {
      // Ignore if there's no active session.
    }
    let signedIn = true;
    try {
      await signIn({
        username: normalizedEmail,
        password,
      });
    } catch (error) {
      const name = error?.name || error?.__type || '';
      const message = String(error?.message || error);
      if (name === 'UserAlreadyAuthenticatedException') {
        await signOut();
        await signIn({
          username: normalizedEmail,
          password,
        });
      } else if (name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email before changing your password.');
      } else if (
        name === 'UserNotFoundException' ||
        message.toLowerCase().includes('user does not exist')
      ) {
        signedIn = false;
      } else {
        throw error;
      }
    }
    if (!signedIn) {
      return;
    }
    try {
      await cleanupSignup();
    } catch (error) {
      if (error?.status === 409) {
        throw new Error('Account already completed. Please sign in instead.');
      }

      let canProceed = false;
      try {
        const existsResult = await checkEmail(normalizedEmail);
        if (existsResult?.exists === false) {
          canProceed = true;
        }
      } catch (existsError) {
        // If the backend can't confirm, fall through to the generic error.
      }

      if (!canProceed) {
        if (error?.message?.toLowerCase?.().includes('timeout')) {
          throw new Error('Could not reset signup due to a timeout. Check your connection and try again.');
        }
        throw new Error('Could not reset signup. Please try again.');
      }
    }
    await deleteUser();
    await signOut();
  } catch (error) {
    console.warn('Amplify deleteUser error:', error);
    console.warn('Amplify deleteUser error details:', serializeAuthError(error));
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
