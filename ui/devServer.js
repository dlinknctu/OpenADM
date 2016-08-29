var path = require('path');
var express = require('express');
var app = express();

var webpack = require('webpack');
var config = require('./webpack.config');
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/src/index.html'));
  });

if(process.env.NODE_ENV === 'production') {
  console.log('production mode');
  app.use(express.static(__dirname + '/build'))
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/build/index.html'));
  });
}

app.listen(8000, '0.0.0.0', function(err) {
  if (err) {
        console.log(err);
        return;
      }
  console.log('Listening at http://0.0.0.0:8000');
});
