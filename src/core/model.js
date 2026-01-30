// src/core/model.js

const HOOK_TYPES = [
  'preinstall',
  'postinstall',
  'prebuild',
  'postbuild',
];

function normalizeHook(hook, index) {
  return {
    id: hook.id ?? `hook-${index}`,
    cmd: hook.cmd,
    priority: hook.priority ?? 0,
    continueOnError: hook.continueOnError ?? false,
  };
}

module.exports = {
  HOOK_TYPES,
  normalizeHook,
};
