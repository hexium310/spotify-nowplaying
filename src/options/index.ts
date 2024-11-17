import { SpotifyNowplayingStorage } from '~types';
import { getStorage, login } from '~utils';

const showUserName = async (): Promise<void> => {
  const { userName, isPremium } = await getStorage(['userName', 'isPremium']);

  if (userName && !isPremium) {
    const element = document.getElementById('notPremium') as HTMLParagraphElement;
    element.style.setProperty('display', 'initial', 'important');
  }

  if (userName) {
    const element = document.getElementById('userName') as HTMLParagraphElement;
    element.parentElement?.style.setProperty('display', 'initial', 'important');
    element.textContent = userName;
  }
};

const showClientId = async (): Promise<void> => {
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
};

const showLogin = async (): Promise<void> => {
  const loginElement = document.getElementById('login') as HTMLButtonElement;
  loginElement.addEventListener('click', async () => {
    await login()
      .then(showUserName)
      .catch((e) => {
        if (!(e instanceof Error)) {
          return;
        }

        const element = document.getElementById('error') as HTMLParagraphElement;
        element.style.setProperty('display', 'initial', 'important');
        element.textContent = `Failed to login: ${e.message}`;

        console.error(e);
      });
  });
};

const showRedirectUrl = async (): Promise<void> => {
  const redirectUrlElement = document.getElementById('redirectUrl') as HTMLElement;
  redirectUrlElement.textContent = chrome.identity.getRedirectURL();
};

showClientId();
showLogin();
showUserName();
showRedirectUrl();
