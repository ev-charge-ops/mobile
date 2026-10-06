import { z } from 'zod';

const email = z.string().trim().min(1, 'Informe seu e-mail').pipe(z.email('Informe um e-mail válido'));
const newPassword = z.string().min(8, 'A senha deve ter pelo menos 8 caracteres');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe seu nome'),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    acceptTerms: z.boolean().refine((accepted) => accepted, 'Aceite os termos para continuar'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const acceptInviteSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe seu nome'),
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
});

export function createChangePasswordSchema(requiresCurrentPassword: boolean) {
  return z
    .object({
      currentPassword: z.string(),
      password: newPassword,
      confirmPassword: z.string().min(1, 'Confirme sua senha'),
    })
    .refine((values) => !requiresCurrentPassword || values.currentPassword.length > 0, {
      message: 'Informe sua senha atual',
      path: ['currentPassword'],
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    });
}

export const emailSchema = z.object({ email });

export const emailCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Informe o código de 6 dígitos'),
});

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>;
export type EmailValues = z.infer<typeof emailSchema>;
export type EmailCodeValues = z.infer<typeof emailCodeSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;
