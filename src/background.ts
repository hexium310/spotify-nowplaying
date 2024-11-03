import { getStorage, login, refleshAccessToken } from '~utils';

// statuses of changeInfo after tweet is posted
const acceptedStatuses = [
  // In Firefox, changeInfo is { status: 'complete', url: 'https://x.com/' }
  'complete',
  // In Google Chrome, changeInfo is { status: 'loading', url: 'https://x.com/' }
  'loading',
];

chrome.action.onClicked.addListener(async () => {
  const { expiresAt, refreshToken } = await getStorage(['expiresAt', 'refreshToken']);

  if (expiresAt === undefined || refreshToken === undefined) {
    await login();
  } else if (expiresAt < Date.now()) {
    await refleshAccessToken(refreshToken);
  }

  const { accessToken } = await getStorage('accessToken');
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
    url: `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
    type: 'popup',
    width: 550,
    height: 450,
  });

  const tabId = tweetWindow.tabs && tweetWindow.tabs[0].id;
  const onUpdated: Parameters<chrome.tabs.TabUpdatedEvent['addListener']>[0] = (id, changeInfo) => {
    if (id !== tabId) {
      return;
    }

    if (acceptedStatuses.includes(changeInfo.status || '') && changeInfo.url === 'https://x.com/') {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.remove(id);
    }
  };

  chrome.tabs.onUpdated.addListener(onUpdated);
});
