const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");
const path = require('path');

module.exports = merge(common, {
   mode: 'development',
   devtool: 'inline-source-map',
   plugins: [new webpack.EnvironmentPlugin({
       COMPONENT_URL: 'http://localhost:9000/cta/',
       LOGLEVEL: 'warn'
  })]
});
