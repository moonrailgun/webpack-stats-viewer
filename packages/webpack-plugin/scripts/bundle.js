const fs = require('fs-extra');
const pathUtil = require('path');
const os = require('os');
const datauri = require('datauri');

/**
 * build single html which can easy to open/manage
 */

const distPath = pathUtil.resolve(__dirname, '../../html-reportor/dist');

(async () => {
  const originHTML = await fs.readFile(
    pathUtil.resolve(distPath, 'index.html'),
    {
      encoding: 'utf8',
    }
  );

  const parsedHTML = await replaceAsync(
    originHTML,
    /"\.\/assets\/(.*?)"/g,
    async (match, p1) => {
      const uri = await datauri(pathUtil.resolve(distPath, `assets/${p1}`));

      return `"${uri}"`;
    }
  );

  await fs.writeFile(
    pathUtil.resolve(__dirname, '../public/index.html'),
    parsedHTML
  );

  console.log('Bundle single html template success.');
})();

async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}
