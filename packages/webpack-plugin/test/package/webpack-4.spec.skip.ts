// @ts-ignore
import webpack4 from 'webpack4';
import MemoryFS from 'memory-fs';
import { advanceTo } from 'jest-date-mock';

jest.mock('webpack', () => require('./node_modules/webpack4')); // eslint-disable-line

const config = require('./app/webpack.config');

advanceTo(new Date(2020, 10, 30));

jest.setTimeout(10 * 1000);

describe('webpack plugin package', () => {
  test('webpack4', (done) => {
    expect.assertions(3);

    const compiler = webpack4(config);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error: any, stats: any) => {
      expect(error).toEqual(null);
      expect(stats.hasErrors()).toBe(false);
      expect(
        stats.toJson({ source: false, assets: true }).assets
      ).toMatchSnapshot();
      done();
    });
  });
});
