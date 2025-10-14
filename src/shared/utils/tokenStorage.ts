// Helper for storing access and refresh tokens in localStorage

import { sendAccessTokenToNative } from "./sendAccessTokenToNative";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function setTokens({ accessToken, refreshToken }: Tokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  // 🔥 CRITICAL: Send access token to React Native for push notifications
  sendAccessTokenToNative(accessToken);
}
export function getAccessToken() {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    return accessToken;
  }
  return null;
}

export function getRefreshToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (refreshToken) {
    return refreshToken;
  }
  return null;
}

export function getTokens(): Tokens | null {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
