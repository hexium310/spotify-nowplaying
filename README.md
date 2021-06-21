# Spotify NowPlaying

A Chrome extension that tweet a song you are listening on Spotify

## Installation

1. Clone this repository and cd it
1. Create Spotify app from [Spotify dashboard](https://developer.spotify.com/dashboard) and copy client id
1. Rename a file `config.ts.orig` to `config.ts` and edit it to insert your app client id into `''`
    ```sh
    mv config.ts{.orig,}
    # Edit config.ts with your editor
    vim config.ts
    ```
1. Build project by following command:
    ```sh
    yarn && yarn build
    ```
1. Open `chrome://extensions/` in Google Chrome and load `dist` directory.
  Click `load unpacked` to select `dist` or drag and drop `dist` on the page.
1. Copy the extension ID in the box for added extension
  ![image](https://user-images.githubusercontent.com/10758173/122782335-9aba9a00-d2eb-11eb-925c-6cdc948337db.png)
1. Open your Spotify app settings to input `https://<copied-extension-id>.chromiumapp.org/` to `Redirect URIs` and save settings  
  Replace `<copied-extension-id>` by the extension id you copied just now. For example: when the extension id is `ehjnkeeomghenaiaaioaabggalacbfbg`, the URL you input is `https://ehjnkeeomghenaiaaioaabggalacbfbg.chromiumapp.org/`.
1. Excellent! By clicking the `[S]` icon on toolbar, you can tweet a song you are listening on Spotify!  
  A tweet page `https://twitter.com/intet/tweet` with a song information will be opened. Also, the authorization page where permission is requested to access your account data will be opened at first.
