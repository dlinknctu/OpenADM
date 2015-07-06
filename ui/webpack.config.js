var Path = require('path');
var webpack = require('webpack');
var WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {

    entry: {
        "bundle": [
            Path.resolve(__dirname, 'src/index.html'),
            Path.resolve(__dirname, 'src/boot.js'),
            'webpack-dev-server/client?http://localhost:8080',
            'webpack/hot/only-dev-server',
        ]
    },
    output: {
        path: Path.resolve(__dirname, 'build'),
        filename: '[name].js',
        publicPath: "/build/"
    },
    stats: {
        colors: true,
        reasons: true,
    },
    // require without Filename Extension
    resolve: {
        extensions: ['', '.js', '.jsx'],
        /**
         * if you require something in library module, you can alias it
         * and require without path
         */
        // alias: {
        //      'angular': 'angular/angular',
        //      'lodash': 'lodash/dist/lodash'
        // },
    },
    module: {
        // preLoaders:[{
        //       test:    /\.jsx?$/,
        //       exclude: /node_modules/,
        //       include: Path.resolve(__dirname, 'src'),
        //       loaders: ['eslint-loader']
        // }],
        loaders: [
            {
                test: /\.(jsx|js)$/,
                exclude: /node_modules/,
                loaders: ['react-hot', 'babel?stage=1'],
                include: Path.join(__dirname, 'src/')
            },
            {
                test: /\.css$/, loader: 'style!css'
            },
            {
                test: /\.less$/, loader: 'style!css!autoprefixer!less'

            },
            {
                test: /\.json$/, loader: 'json'
            },
            {
                test: /\.(ttf|eot|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=8192"
            },
            {
                test: /\.(html|png)$/,
                loader: "file?name=[path][name].[ext]&context=./src"
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new WebpackNotifierPlugin(),
    ],

    /**
     * For webpack-dev-server parameter
     */
    devtool: 'eval', //'#source-map'
    devServer: {
        host: '0.0.0.0',
        port: '8000',
        hot: true,
        contentBase: Path.resolve(__dirname, "./build"),
        filename: '[name].js',
        publicPath: '/',
        outputPath: '/',
        inline: true,
        historyApiFallback: true,
        // webpack-dev-middleware options
        noInfo: true,
        lazy: false,
        stats: {
            colors: true,
            cached: false,
            cachedAssets: false
        },
    }
};
