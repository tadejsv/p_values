const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    '2player': './src/2player.js',
    'ring': './src/ring.js',
    'about': './src/about.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new CleanWebpackPlugin(['js'], {
      root: path.resolve(__dirname, '../p_values/static')
    }),
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
       $: 'jquery',
       Popper: ['popper.js', 'default'],
       Util: 'exports-loader?Util!bootstrap/js/dist/util'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../p_values/static/js')
  },
};
