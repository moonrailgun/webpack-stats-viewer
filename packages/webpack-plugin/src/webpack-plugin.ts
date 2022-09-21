import webpack from 'webpack';
import path from 'path';
import process from 'process';
import { merge } from 'lodash';
import { extractData } from './extract';

const DEFAULT_OPTIONS = {
  compare: true,
  baseline: Boolean(process.env.BUNDLE_STATS_BASELINE),
  html: true,
  json: false,
  outDir: '',
  silent: false,
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
  // const { compare, baseline, html, json, outDir } = options;
  const newAssets = {};

  const logger = (compilation as any).getInfrastructureLogger
    ? (compilation as any).getInfrastructureLogger(PLUGIN_NAME)
    : console;
  const source = compilation.getStats().toJson(options.stats);
  const outputPath = compilation?.options?.output?.path;

  const { entrypoints, chunks } = extractData(source);

  console.table(entrypoints);
  console.table(
    chunks.map((chunk) => ({
      id: chunk.id,
      initial: chunk.initial,
      entry: chunk.entry,
      size: chunk.size,
      files: (chunk.files ?? []).join(','),
      origins: JSON.stringify(chunk.origins),
    }))
  );
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

            // Object.entries(newAssets).forEach(([filename, source]) => {
            //   compilation.emitAsset(filename, new webpack.sources.RawSource(source), {
            //     development: true,
            //   });
            // });
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
