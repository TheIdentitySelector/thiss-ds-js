const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const DotEnv = require("dotenv-webpack");

module.exports = {
  resolve: {
    alias: {
        'node_modules': path.join(__dirname, 'node_modules'),
        'bower_modules': path.join(__dirname, 'bower_modules'),
    }
  },
  entry: {
      'thiss-ds': ['./src/clients.js'],
      'demo': ['./src/demo.js'],
  },
  plugins: [
      new DotEnv({systemvars: true}),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
          filename: 'index.html',
          inject: true,
          chunks: ['demo'],
          template: '!ejs-loader!src/index.html'
      }),
  ],
  output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: "/",
      libraryTarget: 'umd',
      library: '[name]',
      globalObject: 'this'
  },
  module: {
     rules: [
         {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                }
            }
       }
     ]
   }
};
