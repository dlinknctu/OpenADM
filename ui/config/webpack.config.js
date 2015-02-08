 module.exports = {
    entry: {
      app: ["webpack/hot/dev-server", "./src/scripts/main.js"]
    },
    output: {
      path: "./build",
      filename: "bundle.js"
    },
    plugins: [],
    resolve: {
      // modulesDirectories: ['node_modules']
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loader: "jsx-loader?harmony" },
            { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
            {
              test: /\.(html|png)$/,
              loader: "file?name=[path][name].[ext]&context=./src"
            },
            { test: /\.(ttf|eot|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=8192" }
        ]
    }
};

