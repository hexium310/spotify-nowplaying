import { browser } from 'webextension-polyfill-ts';
import { authenticate } from './utils/authenticate';

import { client_id } from '../config.json';

chrome.action.onClicked.addListener(async () => {
  const { expiresIn } = await browser.storage.local.get('expiresIn') as Storage;
  if (!expiresIn || expiresIn < Date.now()) {
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
  browser.windows.create({
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    type: 'popup',
    width: 550,
    height: 450,
  });
});
