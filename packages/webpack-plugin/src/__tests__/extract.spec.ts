import { extractData } from '../extract';

describe('extract', () => {
  test('extractData', () => {
    const stats = require('./fixtures/stats.json');

    const data = extractData(stats);

    expect(1 + 1).toBe(2);
    console.log(JSON.stringify(data.entrypoints));

    console.log(data.chunks.find((chunk) => chunk.id === 4826));
  });
});
