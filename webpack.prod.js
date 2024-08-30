const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');


module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.EnvironmentPlugin({
      COMPONENT_URL: 'https://use.thiss.io/cta/',
      LOGLEVEL: 'error'
    })
  ]
});
