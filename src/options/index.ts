import { SpotifyNowplayingStorage } from '~types';
import { login } from '~utils';

const loginElement = document.getElementById('login') as HTMLElement;
loginElement.addEventListener('click', async () => {
  await login();
  chrome.tabs.reload();
});

const redirectUrl = chrome.identity.getRedirectURL();
const redirectUrlElement = document.getElementById('redirectUrl') as HTMLSpanElement;
redirectUrlElement.insertAdjacentText('afterbegin', redirectUrl);

const { userName, isPremium } = await chrome.storage.local.get(['userName', 'isPremium']) as SpotifyNowplayingStorage;

if (userName && !isPremium) {
  const element = document.getElementById('notPremium') as HTMLParagraphElement;
  element.style.display = 'initial';
}

if (userName) {
  const element = document.getElementById('userName') as HTMLParagraphElement;
  element.style.display = 'initial';
  element.insertAdjacentText('beforeend', userName);
}
