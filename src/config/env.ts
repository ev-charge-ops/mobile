import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url().default('http://localhost:3000'),
});

const result = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
}

export const env = {
  apiUrl: result.data.EXPO_PUBLIC_API_URL,
} as const;
