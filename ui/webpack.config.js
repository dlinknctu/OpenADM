var Path = require('path');
var webpack = require('webpack');
var WebpackNotifierPlugin = require('webpack-notifier');
var rucksack = require('rucksack-css');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index.html',
    './src/boot.js',
  ],
  output: {
    path: Path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  externals: {
    'nx': 'window.nx',
  },
  module: {
    loaders: [{
      test: /\.(jsx|js)$/,
      exclude: /node_modules/,
      loaders: ['babel-loader'],
      include: Path.join(__dirname, 'src/')
    }, {
      test: /\.css$/,
      include: /src/,
      loaders: [
        'style-loader',
        'css-loader?sourceMap',
        'postcss-loader'
      ]
    }, {
        test: /\.css$/,
        exclude: /src/,
        loader: 'style!css'
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.(ttf|eot|png|gif|jpg|woff|woff2|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "url-loader?limit=8192"
    }, {
      test: /\.(png|html)$/,
      loader: "file?name=[path][name].[ext]&context=./src"
    }]
  },
  postcss: [
    rucksack({
      autoprefixer: true
    })
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new WebpackNotifierPlugin(),
  ],
};
