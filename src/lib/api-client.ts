import createClient, { type Middleware } from 'openapi-fetch';

import { env } from '@/config/env';
import type { paths } from '@/lib/api-schema';

type MaybePromise<T> = T | Promise<T>;

export type AuthTokenHandlers = {
  getAccessToken: () => MaybePromise<string | null>;
  refreshAccessToken: () => Promise<string | null>;
  onUnauthorized?: () => void;
};

export function createAuthMiddleware(getHandlers: () => AuthTokenHandlers | null): Middleware {
  const pendingRetries = new Map<string, Request>();
  let refreshInFlight: Promise<string | null> | null = null;

  const refreshOnce = (handlers: AuthTokenHandlers) => {
    refreshInFlight ??= handlers.refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  };

  return {
    async onRequest({ request, id }) {
      const handlers = getHandlers();
      if (!handlers) return request;

      const token = await handlers.getAccessToken();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);

      pendingRetries.set(id, request.clone());
      return request;
    },
    async onResponse({ response, id, options }) {
      const retryRequest = pendingRetries.get(id);
      pendingRetries.delete(id);

      const handlers = getHandlers();
      if (response.status !== 401 || !handlers || !retryRequest) return response;

      const newToken = await refreshOnce(handlers).catch(() => null);
      if (!newToken) {
        handlers.onUnauthorized?.();
        return response;
      }

      retryRequest.headers.set('Authorization', `Bearer ${newToken}`);
      return options.fetch(retryRequest);
    },
    onError({ id }) {
      pendingRetries.delete(id);
    },
  };
}

let authHandlers: AuthTokenHandlers | null = null;

export function setAuthTokenHandlers(handlers: AuthTokenHandlers | null) {
  authHandlers = handlers;
}

export const apiClient = createClient<paths>({ baseUrl: env.apiUrl });

apiClient.use(createAuthMiddleware(() => authHandlers));
