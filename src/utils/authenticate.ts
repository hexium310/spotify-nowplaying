import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

import { AuthorizationError, UnmatchStateError } from '~types';

interface AuthorizationQueryParameter {
  clientId: string;
  responseType: 'code';
  redirectUri: string;
  codeChallengeMethod: 'S256';
  codeChallenge: string;
  state?: string;
  scope?: string;
}

interface RedirectQueryParameter {
  code?: string;
  error?: string;
  state?: string;
}

interface RefleshedTokenRequestBody extends Record<string, string> {
  clientId: string;
  grantType: 'refresh_token';
  refreshToken: string;
}

interface TokenRequestBody extends Record<string, string> {
  clientId: string;
  grantType: 'authorization_code';
  code: string;
  redirectUri: string;
  codeVerifier: string;
}

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresIn: string;
  refreshToken: string;
}

type AuthenticationError = AuthorizationError | UnmatchStateError;

export const encodeToBase64 = (buffer: ArrayBuffer): string => {
  return window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const escapeForUrl = (base64: string): string => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const generateCodeVerifier = (): string => {
  return escapeForUrl(encodeToBase64(new Uint8Array(32)));
};

export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return escapeForUrl(encodeToBase64(buffer));
};

export const authorize = async (params: AuthorizationQueryParameter): Promise<RedirectQueryParameter> => {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({
      url: 'https://accounts.spotify.com/authorize?' + new URLSearchParams(snakecaseKeys(params as Required<AuthorizationQueryParameter>)).toString(),
      interactive: true,
    }, (responseUrl) => {
      if (responseUrl === undefined) {
        reject();
        return;
      }
      const url = new URL(responseUrl);
      resolve(Object.fromEntries(url.searchParams));
    });
  });
};

export const exchangeForToken = async (params: TokenRequestBody | RefleshedTokenRequestBody): Promise<TokenResponse> => {
  const body = new URLSearchParams(snakecaseKeys(params));

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body,
  }).then((response) => response.json()).then((data) => {
    return camelcaseKeys(data);
  });
};

export const authenticate = async (clientId: string): Promise<TokenResponse | AuthenticationError> => {
  const redirectUri = chrome.identity.getRedirectURL();
  const scope = 'user-read-private user-read-currently-playing';
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const { code, error, state: responseState } = await authorize({
    clientId,
    responseType: 'code',
    redirectUri: redirectUri,
    codeChallengeMethod: 'S256',
    codeChallenge: codeChallenge,
    state,
    scope,
  });

  if (error || code === undefined) {
    return new AuthorizationError(error);
  }

  if (state !== responseState) {
    return new UnmatchStateError('The `state` value of the response is not match the stored `state` value.');
  }

  return await exchangeForToken({
    clientId,
    grantType: 'authorization_code',
    code,
    redirectUri: redirectUri,
    codeVerifier: codeVerifier,
  });
};
