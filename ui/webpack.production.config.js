/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

'use strict';

var webpack = require('webpack');
var Path = require('path');

module.exports = {

  entry: [
      Path.resolve(__dirname, 'src/index.html'),
      Path.resolve(__dirname, 'src/boot.js')
    ],
  output: {
      path: Path.resolve(__dirname, 'build'),
      filename: 'bundle.js'
  },

  debug: false,
  devtool: false,

  stats: {
    colors: true,
    reasons: false,
    progress: true
  },

  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ],

  module: {
    loaders: [
      {
          test: /\.(jsx|js)$/,
          exclude: /node_modules/,
          loaders: ['react-hot', 'babel'],
          include: Path.join(__dirname, 'src/')
      },
      {
          test: /\.css$/, loader: 'style!css'
      },
      {
          test: /\.less$/, loader: 'style!css!autoprefixer!less'

      },
      {
        test: /\.(html|png)$/,
        loader: "file?name=[path][name].[ext]&context=./src"
      },
      {
        test: /\.(ttf|eot|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=8192"
      }
    ]
  },
};
