const ballify = require('ballify');
const fs = require('fs-extra');
const pathUtil = require('path');
const os = require('os');

/**
 * build single html which can easy to open/manage
 */

const distPath = pathUtil.resolve(
  __dirname,
  '../../html-reportor/dist'
);

;(async () => {
  const path = await fs
    .readFile(pathUtil.resolve(distPath, 'index.html'), {
      encoding: 'utf8',
    })
    .then((html) => {
      html = html.replace(
        /\.\/assets/g,
        `${pathUtil.resolve(distPath, './assets')}`
      );
      return html;
    })
    .then(async (html) => {
      const path = pathUtil.join(os.tmpdir(), Date.now().toString());
      console.log('generate tmp path:', path);
      await fs.writeFile(path, html);

      return path;
    });

  ballify(
    path,
    {
      brotli: false,
    },
    async (err, ball) => {
      if (err) {
        console.error('error');
        console.error(err);
        return;
      }

      await fs.writeFile(pathUtil.resolve(__dirname, '../public/index.html'), ball);
    }
  );
})();
