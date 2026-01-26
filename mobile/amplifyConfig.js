import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra || {};

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: extra.cognitoUserPoolId,
      userPoolClientId: extra.cognitoAppClientId,
    },
  },
};

if (!amplifyConfig.Auth.Cognito.userPoolId || !amplifyConfig.Auth.Cognito.userPoolClientId) {
  // Helps surface env/config issues early in Expo.
  console.warn('Amplify config missing Cognito settings. Check mobile/.env and Expo config.');
}

export default amplifyConfig;
