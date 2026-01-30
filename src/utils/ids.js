const crypto = require('crypto');

/**
 * Generates a short unique ID for a hook
 * Example: hf_3f92a8c1
 */
function generateHookId() {
  return 'hf_' + crypto.randomBytes(4).toString('hex');
}

module.exports = { generateHookId };
