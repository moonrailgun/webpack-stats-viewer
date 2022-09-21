const { WebpackStatsViewerPlugin } = require('../../../src/index');

module.exports = {
  mode: 'production',
  context: __dirname,
  plugins: [
    new WebpackStatsViewerPlugin(),
  ],
};
