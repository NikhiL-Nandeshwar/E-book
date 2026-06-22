// Constants

import { API_BASE_URL, API_ENDPOINTS } from '@/src/constants/api.constants';
import { clearAuthSession, getAuthToken, getRefreshToken, getTokenExpiry, saveAuthSession } from '@/src/lib/auth-api';

import { ApiResponse } from '@/src/types/api.types';

// Types

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

let refreshPromise: Promise<void> | null = null;

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${normalizedPath}`;
}

function expireSession() {
  const hadToken = !!getAuthToken();
  clearAuthSession();

  if (
    hadToken &&
    typeof window !== 'undefined'
  ) {
    window.dispatchEvent(
      new CustomEvent('session-expired')
    );
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    expireSession();
    throw new Error('Session expired.');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(
          buildUrl(API_ENDPOINTS.auth.refresh),
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken,
            }),
          }
        );

        if (!response.ok) {
          expireSession();
          throw new Error('Session expired.');
        }

        const payload = await response.json();

        if (!payload?.success) {
          expireSession();
          throw new Error('Session expired.');
        }

        saveAuthSession(payload.data);
      } finally {
        refreshPromise = null;
      }
    })();
  }

  await refreshPromise;
}

async function ensureValidToken() {
  const expiry = getTokenExpiry();

  if (!expiry) return;

  const currentTime = Math.floor(Date.now() / 1000);

  if (currentTime < expiry - 60) {
    return;
  }

  await refreshAccessToken();
}

export class ApiError extends Error {
  statusCode: number;
  errors: ApiResponse<unknown>['errors'];

  constructor(
    message: string,
    statusCode: number,
    errors: ApiResponse<unknown>['errors'] = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Sends a request to the backend API and unwraps the shared response envelope.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  isRetry = false
) {
  const { body, headers, ...requestOptions } = options;

  await ensureValidToken();

  const authToken = getAuthToken();
  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path), {
    ...requestOptions,

    credentials: 'include',

    headers: {
      Accept: 'application/json',

      ...(authToken
        ? {
          Authorization: `Bearer ${authToken}`,
        }
        : {}),

      ...(isFormData
        ? {}
        : body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),

      ...headers,
    },

    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (
    response.status === 401 &&
    !isRetry &&
    getRefreshToken()
  ) {
    try {
      await refreshAccessToken();

      return apiRequest<T>(
        path,
        options,
        true
      );
    } catch {
      expireSession();

      throw new ApiError(
        'Session expired.',
        401,
        null
      );
    }
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message || 'Request failed. Please try again.',
      payload?.statusCode || response.status,
      payload?.errors ?? null,
    );
  }

  return payload;
}