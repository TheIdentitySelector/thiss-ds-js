const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");
const path = require('path');

module.exports = merge(common, {
   mode: 'development',
   devtool: 'inline-source-map',
   plugins: [new webpack.EnvironmentPlugin({
       BASE_URL: 'http://localhost:9000/',
       COMPONENT_URL: 'http://localhost:9000/cta/',
       MDQ_URL: '/entities/',
       PERSISTENCE_URL: 'http://localhost:9000/ps/',
       SEARCH_URL: '/entities/',
       STORAGE_DOMAIN: 'localhost:9000',
       LOGLEVEL: 'warn'
  })]
});
