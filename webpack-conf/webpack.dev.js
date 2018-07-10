const merge = require('webpack-merge');
const base = require('./webpack.base.js');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new BrowserSyncPlugin(
      {
        host: 'localhost',
        port: 3000,
        proxy: 'localhost:8000/'
      }
    )
  ]
});
