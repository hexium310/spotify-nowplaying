import queryString from 'query-string';
import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

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

const redirect_uri = browser.identity.getRedirectURL();
const scope = 'user-read-private user-read-email user-read-currently-playing';
const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const loginElement = document.getElementById('login') as HTMLElement;
loginElement.addEventListener('click', async () => {
  const { access_token: accessToken } = await browser.identity.launchWebAuthFlow({
    url: 'https://accounts.spotify.com/authorize?' + queryString.stringify({
      client_id,
      response_type: 'token',
      redirect_uri,
      state,
      scope,
    })
  }).then(responseUrl => {
    const url = new URL(responseUrl);
    return queryString.parse(url.hash);
  });
  browser.storage.local.set({ accessToken });

  axios.get('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }).then(({ data }) => {
    browser.storage.local.set({
      userName: data.display_name,
      isPremium: data.product === 'premium',
    });
  }).then(() => {
    browser.tabs.reload();
  });
});
