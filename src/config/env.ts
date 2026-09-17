import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url().default('http://localhost:3000'),
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: optionalString,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: optionalString,
});

const result = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
}

export const env = {
  apiUrl: result.data.EXPO_PUBLIC_API_URL,
  googleWebClientId: result.data.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: result.data.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
} as const;
