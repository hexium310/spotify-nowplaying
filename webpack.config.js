const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const loaders = {
  typescript: {
    loader: 'ts-loader',
  },
};

module.exports = {
  entry: {
    background: ['./src/background.ts'],
    'options/index': ['./src/options/index.ts'],
  },
  resolve: {
    extensions: ['.js', '.ts',],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        exclude: /node_modules/,
        use: [loaders.typescript],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'options/index.html',
      template: 'src/options/index.html',
    }),
  ],
};
