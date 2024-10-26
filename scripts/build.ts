import esbuild from 'esbuild';
import { TscWatchClient } from 'tsc-watch/client';

import { copyFiles } from './copy';

const isDevelopment = process.env.NODE_ENV === 'development';

(async () => {
  const tscWatch = new TscWatchClient();
  // Improve type checking because `tsc --watch` clears a terminal
  if (isDevelopment) {
    tscWatch.start('--noEmit', '--noClear');
  }

  /* eslint-disable @typescript-eslint/naming-convention */
  const copyWatchers = await copyFiles({
    'src/manifest.json': 'dist/manifest.json',
    'src/options/index.html': 'dist/options/index.html',
  }, isDevelopment);
  /* eslint-enable @typescript-eslint/naming-convention */

  const plugins: esbuild.Plugin[] = [{
    name: 'display-message',
    setup(build) {
      build.onEnd((result) => {
        console.log('builded: %o', result);
      });
    },
  }];

  const context = await esbuild.context({
    entryPoints: [
      'src/background.ts',
      'src/options/index.ts',
    ],
    outdir: 'dist',
    bundle: true,
    minify: !isDevelopment,
    target: ['es2023'],
    plugins,
  }).catch(() => {
    tscWatch.kill();
    for (const watcher of copyWatchers) {
      watcher.close();
    }
    process.exit(1);
  });

  await context.watch();

  if (isDevelopment) {
    return;
  }

  await context.dispose();
})();
