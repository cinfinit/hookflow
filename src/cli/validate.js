const { SUPPORTED_HOOK_TYPES } = require('./constants');

function normalizeHookType(inputType) {
  if (!inputType) return 'postinstall';

  const lower = inputType.toLowerCase();

  if (SUPPORTED_HOOK_TYPES.includes(lower)) {
    if (lower !== inputType) {
      console.warn(
        `[HookFlow] Warning: Normalizing hook type "${inputType}" → "${lower}"`
      );
    }
    return lower;
  }

  throw new Error(
    `Invalid hook type "${inputType}". Supported types: ${SUPPORTED_HOOK_TYPES.join(', ')}`
  );
}

module.exports = { normalizeHookType };
