/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */
'use strict';
var webpack = require('webpack');
var Path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var rucksack = require('rucksack-css');

module.exports = {
  entry: {
    bundle: [
      Path.resolve(__dirname, 'src/index.html'),
      Path.resolve(__dirname, 'src/boot.js'),
    ],
  },
  output: {
    path: Path.resolve(__dirname, 'build'),
    filename: '[name].js',
    publicPath: '/build'
  },
  debug: false,
  devtool: false,
  stats: {
    colors: true,
    reasons: false,
    progress: true,
  },
  // require without Filename Extension
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [{
      test: /\.(jsx|js)$/,
      exclude: /node_modules/,
      loaders: ['babel-loader'],
      include: Path.join(__dirname, 'src/'),
    }, {
      test: /\.css$/,
      include: /src/,
      loaders: [
        'style-loader',
        'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
        'postcss-loader',
      ],
    }, {
      test: /\.css$/,
      exclude: /src/,
      loader: 'style!css',
    }, {
      test: /\.json$/,
      loader: 'json',
    }, {
      test: /\.(ttf|eot|png|gif|jpg|woff|woff2|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=8192',
    }, {
      test: /\.(png|html)$/,
      loader: 'file?name=[path][name].[ext]&context=./src',
    }],
  },
  postcss: [
    rucksack({
      autoprefixer: true,
    }),
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
};
