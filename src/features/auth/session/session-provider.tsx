import { useEffect, useState, useSyncExternalStore, type PropsWithChildren } from 'react';

import { SessionContext } from '@/features/auth/session/session-context';
import { createSessionStore } from '@/features/auth/session/session-store';
import { setAuthTokenHandlers } from '@/lib/api-client';

export function SessionProvider({ children }: PropsWithChildren) {
  const [store] = useState(createSessionStore);
  const { status, user } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    setAuthTokenHandlers(store.tokenHandlers);
    void store.restoreSession();
    return () => setAuthTokenHandlers(null);
  }, [store]);

  return (
    <SessionContext value={{ status, user, startSession: store.startSession, endSession: store.endSession, retryRestore: store.retryRestore }}>
      {children}
    </SessionContext>
  );
}
