import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

import { AuthorizationError, InvalidStateError, UnexpectedError } from './errors';
import { SpotifyNowplayingStorage } from '~types';

interface AuthorizationQueryParameter {
  clientId: string;
  responseType: 'code';
  redirectUri: string;
  codeChallengeMethod: 'S256';
  codeChallenge: string;
  state?: string;
  scope?: string;
}

interface AuthorizationSuccessResponse {
  code: AuthorizationCode;
  state: string;
}

interface AuthorizationFailureResponse {
  error: string;
  state: string;
}

interface RefreshTokenRequestBody {
  clientId: string;
  grantType: 'refresh_token';
  refreshToken: string;
}

interface TokenRequestBody {
  clientId: string;
  grantType: 'authorization_code';
  code: AuthorizationCode;
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

type AuthorizationCode = string;
type AuthorizationResponse = AuthorizationSuccessResponse | AuthorizationFailureResponse;

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

export const requestAuthorization = async (params: AuthorizationQueryParameter): Promise<AuthorizationResponse> => {
  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: 'https://accounts.spotify.com/authorize?' + new URLSearchParams(snakecaseKeys(params as Required<AuthorizationQueryParameter>)).toString(),
    interactive: true,
  });

  if (responseUrl === undefined) {
    throw new AuthorizationError('failed to authorize');
  }

  const responseParams = new URL(responseUrl).searchParams;

  if (responseParams.get('code') !== null) {
    return Object.fromEntries(responseParams) as unknown as AuthorizationSuccessResponse;
  }

  if (responseParams.get('error') !== null) {
    return Object.fromEntries(responseParams) as unknown as AuthorizationFailureResponse;
  }

  throw new UnexpectedError('unexpected error occured');
};

export const getToken = async (params: TokenRequestBody | RefreshTokenRequestBody): Promise<TokenResponse> => {
  const body = new URLSearchParams(snakecaseKeys({ ...params }));

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body,
  }).then((response) => response.json()).then((data) => {
    return camelcaseKeys(data);
  });
};

export const authorize = async (clientId: string): Promise<AuthorizationCode> => {
  const scope = 'user-read-private user-read-currently-playing';
  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  await chrome.storage.local.set<SpotifyNowplayingStorage>({ codeVerifier });

  const response = await (async () => {
    try {
      return await requestAuthorization({
        clientId,
        responseType: 'code',
        redirectUri: chrome.identity.getRedirectURL(),
        codeChallengeMethod: 'S256',
        codeChallenge: codeChallenge,
        state,
        scope,
      });
    } catch (e) {
      if (e instanceof AuthorizationError) {
        throw e;
      } else {
        throw new UnexpectedError('unexpected error occured');
      }
    }
  })();

  if ('error' in response) {
    throw new AuthorizationError(response.error);
  }

  if (state !== response.state) {
    throw new InvalidStateError('The `state` value of the response is not match the stored `state` value.');
  }

  return response.code;
};
