'use strict';

const env = require('./env');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const webpackDevServerProxy = require('./webpack-dev-server-proxy');
const ASSETS_DIR = path.resolve(__dirname, '../client/public/assets');


/**
 * Proxy to webpack-dev-server for development
 */
if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  webpackDevServerProxy(app, require('../../webpack.config'));
}

/**
 * Serve static assets
 */
app.use('/assets/', express.static(ASSETS_DIR));

/**
 * Serve /env.js
 * Mimic process.env on the client side
 */
app.get('/env.js', require('./env-handler'));


/**
 * Serve favicon.ico
 */
app.get('/favicon.ico',(req, res) => {
  res.sendFile(path.join(ASSETS_DIR, 'favicon.ico'));
});


/**
 * Proxy tokeninfo to avoid CORS restriction
 */
app.use('/tokeninfo', require('./tokeninfo-handler'));


/**
 * Proxy refresh-token to avoid CORS restriction and do some magic
 */
app.post('/refresh-token', bodyParser.json(), require('./refresh-token-handler'));


/**
 * Proxy zally api to avoid CORS restriction
 */
app.use('/zally-api',  require('./zally-api-handler'));

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    alive: true
  });
});

/**
 * Main entry point to SPA
 */
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public/index.html'));
});

module.exports = app;

