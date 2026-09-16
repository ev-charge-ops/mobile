import { createContext, use } from 'react';

import type { AuthSession, AuthUser } from '@/features/auth/api/auth-api';
import type { SessionStatus } from '@/features/auth/session/session-store';

export type SessionContextValue = {
  status: SessionStatus;
  user: AuthUser | null;
  startSession: (session: AuthSession) => Promise<void>;
  endSession: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const context = use(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
