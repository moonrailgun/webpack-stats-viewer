# webpack-stats-viewer

A website for checkout webpack stats info.

Many same webpack analyzer tools can show summary, but as a developer, when i try go deep into, and think why those file bundled into those chunk, this tools make me powerless. So i develop this tool, no magic, just plain data. I think i need it.


## Feature

- Easy to read
  - No more magic. Just show you more detail
- Found why bundle it
  - By modules, we can checkout everyone, No lose.
- Single file
  - Record a static report which can read it later.
- Website and Plugin
  - Ease to use.
  
## Usage in webpack

```bash
npm install webpack-stats-viewer-plugin
```

*webpack.config.js*:
```ts
import { WebpackStatsViewerPlugin } from 'webpack-stats-viewer-plugin';

export default {
  // ...
  plugins: [
    // ...
    new WebpackStatsViewerPlugin(),
  ]
  // ...
}
```

## About webpack stats

https://webpack.js.org/api/stats/

## Screenshot

![](./docs/screenshot.png)

![](./docs/screenshot2.png)

## Online Viewer

- [Online Viewer](https://webpack-stats-viewer.moonrailgun.com/) (you should generate `stats.json` by yourself)
