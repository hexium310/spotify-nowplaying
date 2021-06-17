import { browser } from 'webextension-polyfill-ts';
import { authenticate } from './utils/authenticate';

import config from '../config.json';
const { client_id } = config;

chrome.action.onClicked.addListener(async () => {
  const { expiresAt } = await browser.storage.local.get('expiresAt') as Storage;
  if (!expiresAt || expiresAt < Date.now()) {
    await authenticate(client_id);
  }

  const { accessToken } = await browser.storage.local.get('accessToken') as Storage;
  if (!accessToken) {
    return;
  }

  const { item } = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }).then((response) => response.json()).then((data) => data);
  if (!item) {
    return;
  }

  const artists = item.artists.map(({ name }: { name: string }) => name).join(', ');
  const song = item.name;
  const text = `${artists} - ${song}\n${item.external_urls.spotify}\n#NowPlaying`;
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
