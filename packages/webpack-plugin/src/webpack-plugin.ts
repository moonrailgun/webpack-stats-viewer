import webpack from 'webpack';
import path from 'path';
import { merge } from 'lodash';
import { extractData } from './extract';
import fs from 'fs-extra';

const publicDir = path.resolve(__dirname, '../public');

const DEFAULT_OPTIONS = {
  outDir: '',
  stats: {
    assets: true,
    chunks: true,
    modules: true,
    hash: true,
    builtAt: true,
  },
};

const PLUGIN_NAME = 'webpack-stats-viewer';

const isWebpack5 = parseInt(webpack.version, 10) === 5;

type Options = typeof DEFAULT_OPTIONS;

const generateReports = async (
  compilation: webpack.Compilation,
  options: Options
) => {
  const { outDir } = options;

  // const logger = (compilation as any).getInfrastructureLogger
  //   ? (compilation as any).getInfrastructureLogger(PLUGIN_NAME)
  //   : console;
  const source = compilation.getStats().toJson(options.stats);

  let html = await fs.readFile(path.resolve(publicDir, './index.html'), {
    encoding: 'utf8',
  });

  html = html.replace(
    '<!-- window.stats -->',
    `<script type="module">window.stats = ${JSON.stringify(source)};</script>`
  );
  html = html.replace(/\.\/assets/g, `${path.resolve(publicDir, './assets')}`);

  return [
    {
      filename: path.join(
        outDir,
        `webpack-stats-viewer-${source.hash ?? Date.now()}.html`
      ),
      source: html,
    },
  ];
};

export class WebpackStatsViewerPlugin {
  options: Options;
  constructor(options: Options) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  apply(compiler: webpack.Compiler) {
    const options = merge({}, DEFAULT_OPTIONS, this.options);

    if (isWebpack5) {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: PLUGIN_NAME,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          async () => {
            const newAssets = await generateReports(compilation, options);

            newAssets.forEach(({ filename, source }) => {
              compilation.emitAsset(
                filename,
                new webpack.sources.RawSource(source),
                {
                  development: true,
                }
              );
            });
          }
        );
      });

      return;
    }

    // For webpack 4
    //
    // compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
    //   const newAssets = await generateReports(compilation, options);

    //   Object.entries(newAssets).forEach(([filename, source]) => {
    //     // eslint-disable-next-line no-param-reassign
    //     compilation.assets[filename] = {
    //       size: () => 0,
    //       source: () => source,
    //     };
    //   });

    //   callback();
    // });
  }
}
