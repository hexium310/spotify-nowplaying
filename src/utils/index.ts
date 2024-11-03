import { AuthorizationError, SpotifyNowplayingStorage, UnmatchStateError } from '~types';
import { authenticate, exchangeForToken } from '~utils/authenticate';

export const login = async (): Promise<void> => {
  const { clientId } = await getStorage('clientId');
  const data = await authenticate(clientId ?? '');

  if (data instanceof AuthorizationError) {
    console.log(data.message);
    return;
  }

  if (data instanceof UnmatchStateError) {
    console.log(data.message);
    return;
  }

  const { expiresIn, accessToken, refreshToken } = data;

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

export const refleshAccessToken = async (refreshToken: string): Promise<void> => {
  const { clientId } = await getStorage('clientId');
  if (clientId === undefined) {
    return;
  }

  const { expiresIn, accessToken, refreshToken: newRefreshToken } = await exchangeForToken({
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
