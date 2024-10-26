import { SpotifyNowplayingStorage } from '~types';
import { login } from '~utils';

const { userName, isPremium } = await chrome.storage.local.get(['userName', 'isPremium']) as SpotifyNowplayingStorage;

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
    `<p>
      <i class="bi-person-fill-check">
      </i>
      ${userName}
    </p>`
  );
}

const loginElement = document.getElementById('login') as HTMLElement;
loginElement.addEventListener('click', async () => {
  await login();
  chrome.tabs.reload();
});

const redirectUrl = chrome.identity.getRedirectURL();
const redirectUrlElement = document.getElementById('redirectUrl') as HTMLSpanElement;
redirectUrlElement.innerText = redirectUrl;
