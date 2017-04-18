path =require('path')
module.exports = {
  entry: __dirname + '/static/scripts/jsx/main.jsx',
  output: {
    path: __dirname + '/static/scripts/build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/, // A regexp to test the require path. accepts either js or jsx
      loader: ['babel-loader'], // The module to load.
    }]
  }
};

