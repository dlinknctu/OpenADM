var ReactTools = require('react-tools');


module.exports = {
  process: function(src, path) {
    
    return ReactTools.transform(src);
    
  }
};
