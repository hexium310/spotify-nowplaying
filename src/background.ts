import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';
import { authenticate } from './utils/authenticate';

import { client_id } from '../config.json';

browser.browserAction.onClicked.addListener(async () => {
  const { expiresIn } = await browser.storage.local.get('expiresIn') as Storage;
  if (!expiresIn || expiresIn < Date.now()) {
    await authenticate(client_id);
  }

  const { accessToken } = await browser.storage.local.get('accessToken') as Storage;
  if (!accessToken) {
    return;
  }

  const { item } = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }).then(({ data }) => data);
  if (!item) {
    return;
  }

  const text = `${item.name} - ${item.artists.map(({ name }: { name: string }) => name).join(', ')}\n${item.external_urls.spotify}\n#NowPlaying`;
  browser.windows.create({
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    type: 'popup',
    width: 550,
    height: 450,
  });
});
