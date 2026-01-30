
// src/index.js
const { discoverConfigs } = require('./config/load');
const { runHooks } = require('./core/orchestrator');

const config = discoverConfigs(); // automatically scans root + packages

runHooks(config, 'postinstall');