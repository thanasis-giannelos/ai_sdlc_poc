import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  entry: './src/main.tsx',
  output: {
    filename: '[name].[contenthash].js',
    publicPath: process.env.PUBLIC_URL ?? 'http://localhost:3000/',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        use: { loader: 'builtin:swc-loader', options: { jsc: { parser: { syntax: 'typescript', tsx: true }, transform: { react: { runtime: 'automatic' } } } } },
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
      name: 'host',
      remotes: {
        catalogRemote: `catalogRemote@${process.env.CATALOG_URL ?? 'http://localhost:3001'}/remoteEntry.js`,
        cartRemote:    `cartRemote@${process.env.CART_URL    ?? 'http://localhost:3002'}/remoteEntry.js`,
        accountRemote: `accountRemote@${process.env.ACCOUNT_URL ?? 'http://localhost:3003'}/remoteEntry.js`,
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
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});
