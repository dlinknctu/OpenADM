/* eslint-disable global-require */
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./Root.prod.js');
} else {
  module.exports = require('./Root.dev.js');
}
/* eslint-enable global-require */
