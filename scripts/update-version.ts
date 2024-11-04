import { writeFile } from 'node:fs/promises';
import { env, exit } from 'node:process';

import manifest from '../src/manifest.json' with { type: 'json' };

const version = env.npm_package_version;

if (version === undefined) {
  exit(1);
}

const {
  browser_specific_settings: {
    gecko: {
      id,
    },
  },
} = manifest;

const updates = {
  addons: {
    [id]: {
      updates: [
        {
          version,
          /* eslint-disable-next-line @typescript-eslint/naming-convention */
          update_link: `https://github.com/hexium310/spotify-nowplaying/releases/download/${version}/spotify-nowplaying.xpi`,
        },
      ],
    },
  },
};

manifest.version = version;

const files = [
  {
    json: updates,
    file: new URL('../updates.json', import.meta.url),
  },
  {
    json: manifest,
    file: new URL('../src/manifest.json', import.meta.url),
  },
];

await Promise.all(files.map(async ({ json, file }) => {
  writeFile(file, JSON.stringify(json, null, 2).concat('\n'))
    .then(() => console.log(`${file} was updated.`))
    .catch((e) => {
      console.error(e);
    });
}));
