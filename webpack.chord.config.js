/* eslint-disable */
const $path = require('path');

module.exports = {
  devtool: 'source-map',

  entry: {
    index: './charts/chordDiagram/index.js',
  },

  output: {
    path: $path.resolve(__dirname, './charts/chordDiagram/build'),
    filename: '[name].js',
    chunkFilename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      {
        test: /.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
};
