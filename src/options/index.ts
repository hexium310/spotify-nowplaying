import { browser } from 'webextension-polyfill-ts';
import { authenticate } from '../utils/authenticate';

import { client_id } from '../../config.json';

(async () => {
  const { userName, isPremium } = await browser.storage.local.get(['userName', 'isPremium']) as Storage;

  const mainElement = document.getElementById('main') as HTMLElement;
  if (userName && !isPremium) {
    mainElement.insertAdjacentHTML(
      'afterbegin',
      `<p class="notPremium alert alert-danger">
        ログイン中のユーザーは Spotify Premium ではありません。<br>
        Spotify-NowPlaying は Spotify Premium でのみ動作します。
      </p>`
    );
  }

  if (userName) {
    mainElement.insertAdjacentHTML(
      'afterbegin',
      `<p><i class="fas fa-user"></i> ${userName}</p>`
    );
  }
})();

const loginElement = document.getElementById('login') as HTMLElement;
loginElement.addEventListener('click', async () => {
  await authenticate(client_id).then(() => {
    browser.tabs.reload();
  });
});
