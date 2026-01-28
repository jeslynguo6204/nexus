import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  cognitoUserPoolId: requireEnv("COGNITO_USER_POOL_ID"),
  cognitoAppClientId: requireEnv("COGNITO_APP_CLIENT_ID"),
};
