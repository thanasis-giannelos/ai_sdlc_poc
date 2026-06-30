import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  entry: './src/main.tsx',
  output: {
    filename: '[name].[contenthash].js',
    publicPath: 'http://localhost:3001/',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        use: { loader: 'builtin:swc-loader', options: { jsc: { parser: { syntax: 'typescript', tsx: true } } } },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [rspack.CssExtractRspackPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: './index.html' }),
    new rspack.CssExtractRspackPlugin(),
    new ModuleFederationPlugin({
      name: 'catalogRemote',
      filename: 'remoteEntry.js',
      exposes: {
        './CatalogApp': './src/App',
      },
      shared: {
        react:                   { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom':             { singleton: true, requiredVersion: '^18.3.0' },
        'react-router-dom':      { singleton: true, requiredVersion: '^6.23.0' },
        zustand:                 { singleton: true, requiredVersion: '^4.5.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
      },
    }),
  ],
  devServer: {
    port: 3001,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});
