# Spotify NowPlaying

A Chrome extension that tweets the song you are listening to on Spotify

## For Firefox

### Installation

This web extension is unsigned, so you cannot install it the stable version of Firefox. See below.

> Unsigned extensions can be installed in the Developer Edition, Nightly, and ESR versions of Firefox,
after toggling the xpinstall.signatures.required preference in about:config.
https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/

1. Download `spotify-nowplaying.xpi` from [releases][releases-latest] and install it

### Usage

#### Set up

1. Create a Spotify app from [Spotify dashboard][spotify-dashboard] and copy the client id
1. Paste the client id into Client ID in the option page of this extension
1. Add the redirect URL displayed in the option page of this extension into Redirect URIs in [Spotify dashboard][spotify-dashboard]
1. Click Login button in the option page of this extension

After setup is complete, click the extension icon on toolbar to tweet the song you are listening to on Spotify.

## For Google Chrome

Use [5.1][]

## Build

```sh
yarn && yarn build
```

[releases-latest]: https://github.com/hexium310/spotify-nowplaying/releases/latest
[spotify-dashboard]: https://developer.spotify.com/dashboard
[5.1]: https://github.com/hexium310/spotify-nowplaying/blob/0.5.1/README.md
