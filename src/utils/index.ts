import { UndefinedStorageItemError } from './errors';
import { SpotifyNowplayingStorage } from '~types';
import { authorize, getToken } from '~utils/authenticate';

export const login = async (): Promise<void> => {
  const { clientId } = await getStorage('clientId');
  if (clientId === undefined || clientId === '') {
    throw new UndefinedStorageItemError('clientId is undefined');
  }

  const authorizationCode = await authorize(clientId);
  const { codeVerifier } = await getStorage('codeVerifier');
  if (codeVerifier === undefined) {
    throw new UndefinedStorageItemError('codeVerifier is undefined');
  }

  const { expiresIn, accessToken, refreshToken } = await getToken({
    clientId,
    grantType: 'authorization_code',
    code: authorizationCode,
    redirectUri: chrome.identity.getRedirectURL(),
    codeVerifier,
  });

  const user = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => response.json()).then((data) => {
    return {
      userName: data.display_name,
      isPremium: data.product === 'premium',
    };
  });

  chrome.storage.local.set<SpotifyNowplayingStorage>({
    ...user,
    accessToken,
    refreshToken,
    expiresAt: Date.now() + Number(expiresIn) * 1000,
  });
};

export const refreshAccessToken = async (refreshToken: string): Promise<void> => {
  const { clientId } = await getStorage('clientId');
  if (clientId === undefined) {
    throw new UndefinedStorageItemError('clientId is undefined');
  }

  const { expiresIn, accessToken, refreshToken: newRefreshToken } = await getToken({
    clientId,
    grantType: 'refresh_token',
    refreshToken: refreshToken,
  });
  chrome.storage.local.set<SpotifyNowplayingStorage>({
    accessToken,
    refreshToken: newRefreshToken,
    expiresAt: Date.now() + Number(expiresIn) * 1000,
  });
};

export const getStorage = async (keys: keyof SpotifyNowplayingStorage | (keyof SpotifyNowplayingStorage)[]): Promise<Partial<SpotifyNowplayingStorage>> => {
  return await chrome.storage.local.get<SpotifyNowplayingStorage>(keys);
};
