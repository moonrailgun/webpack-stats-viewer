import webpack, { StatsOptions } from 'webpack';
import path from 'path';
import { merge } from 'lodash';
import fs from 'fs-extra';
import normalize from 'normalize-path';

const publicDir = path.resolve(__dirname, '../public');

const DEFAULT_OPTIONS = {
  outDir: '',
  stats: {
    assets: true,
    modules: false,
    hash: true,
    builtAt: true,
    chunks: true,
    chunkRelations: true,
    chunkModules: true,
    chunkOrigins: true,
    chunkGroups: false,
    reasons: true,
    optimizationBailout: true,
  } as StatsOptions,
};

const PLUGIN_NAME = 'webpack-stats-viewer';

const isWebpack5 = parseInt(webpack.version, 10) === 5;

type Options = typeof DEFAULT_OPTIONS;

const generateReports = async (
  compilation: webpack.Compilation,
  options: Options
) => {
  const { outDir } = options;

  const logger = compilation.getLogger(PLUGIN_NAME);
  const source = compilation.getStats().toJson(options.stats);

  let html = await fs.readFile(path.resolve(publicDir, './index.html'), {
    encoding: 'utf8',
  });

  html = html.replace(
    '<!-- window.stats -->',
    `<script type="module">window.stats = ${JSON.stringify(source)};</script>`
  );
  html = html.replace(/\.\/assets/g, `${path.resolve(publicDir, './assets')}`);
  const filename = path.join(
    outDir,
    `webpack-stats-viewer-${source.hash ?? Date.now()}.html`
  );

  const generatedFilePath = path.resolve(
    compilation.outputOptions.path ?? '',
    filename
  );
  logger.info('Generate stats file in:', normalize(generatedFilePath));
  logger.info('Open it with:', `file://${normalize(generatedFilePath)}`);

  return [
    {
      filename,
      source: html,
    },
  ];
};

export class WebpackStatsViewerPlugin {
  options: Options;
  constructor(options?: Options) {
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
    // TODO
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
