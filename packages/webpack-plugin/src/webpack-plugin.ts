import type webpack from 'webpack';
import type { StatsOptions, WebpackPluginInstance } from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import opener from 'opener';
import chalk from 'chalk';

const publicDir = path.resolve(__dirname, '../public');

const DEFAULT_OPTIONS = {
  outDir: '',
  open: true,
  /**
   * Modify your own filename
   * @default `webpack-stats-viewer-${hash}.html`
   */
  filename: '',
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

type Options = typeof DEFAULT_OPTIONS;

export class WebpackStatsViewerPlugin implements WebpackPluginInstance {
  options: Options;
  constructor(options?: Partial<Options>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  apply(compiler: webpack.Compiler) {
    const done = (stats: webpack.Stats, callback: () => void) => {
      this.generateReport(stats).then(() => callback());
    };

    if (compiler.hooks) {
      compiler.hooks.done.tapAsync(PLUGIN_NAME, done);
    } else {
      // webpack4
      // @ts-ignore
      compiler.plugin('done', done);
    }
  }

  async generateReport(stats: webpack.Stats) {
    const { outDir } = this.options;
    const compilation = stats.compilation;

    const logger = compilation.getLogger(PLUGIN_NAME);
    const source = compilation.getStats().toJson(this.options.stats);

    let html = await fs.readFile(path.resolve(publicDir, './index.html'), {
      encoding: 'utf8',
    });

    html = html.replace(
      '<!-- window.stats -->',
      `<script type="module">window.stats = ${JSON.stringify(source)};</script>`
    );
    html = html.replace(
      /\.\/assets/g,
      `${path.resolve(publicDir, './assets')}`
    );
    const filename = path.join(
      outDir,
      this.options.filename ||
        `${PLUGIN_NAME}-${source.hash ?? Date.now()}.html`
    );

    const generatedFilePath = path.resolve(
      compilation.outputOptions.path ?? '',
      filename
    );

    await fs.ensureDir(path.dirname(generatedFilePath));
    await fs.writeFile(generatedFilePath, html);

    logger.info(
      `${chalk.bold(PLUGIN_NAME)} saved stats file to ${chalk.bold(
        generatedFilePath
      )}`
    );

    if (this.options.open) {
      const uri = `file://${generatedFilePath}`;
      opener(uri);
    }
  }
}
