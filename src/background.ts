import { SpotifyNowplayingStorage } from '~types';
import { login, refleshAccessToken } from '~utils';

chrome.action.onClicked.addListener(async () => {
  const { expiresAt } = await chrome.storage.local.get('expiresAt') as SpotifyNowplayingStorage;

  if (!expiresAt) {
    await login();
  }

  if (expiresAt < Date.now()) {
    const { refreshToken } = await chrome.storage.local.get('refreshToken') as SpotifyNowplayingStorage;
    await refleshAccessToken(refreshToken);
  }

  const { accessToken } = await chrome.storage.local.get('accessToken') as SpotifyNowplayingStorage;
  if (!accessToken) {
    return;
  }

  const { item } = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept-Language': 'en;q=1.0, *;q=0.9',
    },
  }).then((response) => response.json()).then((data) => data);

  if (!item) {
    return;
  }

  const artists = item.artists.map(({ name }: { name: string }) => name).join(', ');
  const song = item.name;
  const externalUrl = item.external_urls.spotify || '';
  const text = [
    `${artists} - ${song}`,
    `${externalUrl}`,
    '#NowPlaying',
  ].filter((v) => v).join('\n');
  const tweetWindow = await chrome.windows.create({
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    type: 'popup',
    width: 550,
    height: 450,
  });

  const tabId = tweetWindow.tabs && tweetWindow.tabs[0].id;
  const onUpdated: Parameters<chrome.tabs.TabUpdatedEvent["addListener"]>[0] = (id, changeInfo) => {
    if (id !== tabId) {
      return;
    }

    if (changeInfo.status === 'loading' && changeInfo.url === `https://twitter.com/`) {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.remove(id);
    }
  };

  chrome.tabs.onUpdated.addListener(onUpdated);
});
