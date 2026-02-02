export default {
  expo: {
    name: "Six Degrees",
    slug: "six-degrees",
    icon: "./assets/Number 6 with Degree Symbol.png",
    android: {
      package: "com.sixdegrees.sixdegreesapp",
      adaptiveIcon: {
        foregroundImage: "./assets/Number 6 with Degree Symbol.png",
        backgroundColor: "#4A90E2",
      },
    },
    ios: {
      bundleIdentifier: "com.sixdegrees.sixdegreesapp",
      infoPlist: {
        NSAppTransportSecurity: {
          NSExceptionDomains: {
            "sixdegrees.dev": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSIncludesSubdomains: true,
            },
          },
        },
      },
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
