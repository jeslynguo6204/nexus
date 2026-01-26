export default {
  expo: {
    name: "Six Degrees",
    slug: "six-degrees",
    android: {
      package: "com.anonymous.sixdegrees",
    },
    ios: {
      bundleIdentifier: "com.anonymous.sixdegrees",
    },
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      cognitoUserPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
      cognitoAppClientId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
      eas: {
        projectId: "67f082ac-8a77-4269-b117-a3b26235f3bd",
      },
    },
  },
};
