import { browser } from 'webextension-polyfill-ts';
import axios, { AxiosResponse } from 'axios';
import queryString from 'query-string';

export const getTokenResponse = (
  client_id: string,
  redirect_uri: string,
  state: string,
  scope: string,
): Promise<queryString.ParsedQuery> => {
  return browser.identity.launchWebAuthFlow({
    url: 'https://accounts.spotify.com/authorize?' + queryString.stringify({
      client_id,
      response_type: 'token',
      redirect_uri,
      state,
      scope,
    }),
    interactive: true,
  }).then(responseUrl => {
    const url = new URL(responseUrl);
    return queryString.parse(url.hash);
  });
};

export const authenticate = async (client_id: string): Promise<AxiosResponse> => {
  const redirect_uri = browser.identity.getRedirectURL();
  const scope = 'user-read-private user-read-currently-playing';
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const {
    access_token: accessToken,
    expires_in: expiresIn
  } = await getTokenResponse(client_id, redirect_uri, state, scope);
  browser.storage.local.set({
    accessToken,
    expiresIn: Date.now() + Number(expiresIn),
  });

  return axios.get('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }).then(response => {
    browser.storage.local.set({
      userName: response.data.display_name,
      isPremium: response.data.product === 'premium',
    });

    return response;
  });
};
