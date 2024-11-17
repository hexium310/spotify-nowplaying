import { SpotifyNowplayingStorage } from '~types';
import { getStorage, login } from '~utils';

const clientIdElement = document.getElementById('clientId') as HTMLInputElement;
clientIdElement.value = (await getStorage('clientId')).clientId ?? '';
clientIdElement.addEventListener('input', (event) => {
  if (!(event.currentTarget instanceof HTMLInputElement)) {
    return;
  }

  chrome.storage.local.set<SpotifyNowplayingStorage>({
    clientId: event.currentTarget.value,
  });
});

const loginElement = document.getElementById('login') as HTMLElement;
loginElement.addEventListener('click', async () => {
  await login();
  chrome.tabs.reload();
});

const redirectUrl = chrome.identity.getRedirectURL();
const redirectUrlElement = document.getElementById('redirectUrl') as HTMLSpanElement;
redirectUrlElement.insertAdjacentText('afterbegin', redirectUrl);

const { userName, isPremium } = await getStorage(['userName', 'isPremium']);

if (userName && !isPremium) {
  const element = document.getElementById('notPremium') as HTMLParagraphElement;
  element.style.setProperty('display', 'initial', 'important');
}

if (userName) {
  const element = document.getElementById('userName') as HTMLParagraphElement;
  element.style.setProperty('display', 'initial', 'important');
  element.insertAdjacentText('beforeend', userName);
}
