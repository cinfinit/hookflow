//id based 
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPPORTED_HOOK_TYPES = new Set([
  'preinstall',
  'postinstall',
  'postbuild'
]);

function normalizePackagePath(pkgPath) {
  if (!pkgPath || pkgPath === '.') return '.';
  return pkgPath.replace(/\\/g, '/').replace(/\/$/, '');
}

// Generate a short unique ID for a hook
function generateHookId() {
  return 'hf_' + crypto.randomBytes(4).toString('hex');
}

function normalizeHook(hook) {
  if (!hook || typeof hook !== 'object') return null;
  if (typeof hook.cmd !== 'string' || !hook.cmd.trim()) return null;

  return {
    id: hook.id || generateHookId(),  // <-- assign ID if missing
    cmd: hook.cmd,
    priority: Number.isFinite(Number(hook.priority)) ? Number(hook.priority) : 0,
    continueOnError: !!hook.continueOnError
  };
}

function discoverConfigs(cwd) {
  const configPath = path.join(cwd, '.hookflowrc.json');

  // -------- Base safe config (NEVER break this) --------
  const safeConfig = {
    schemaVersion: 1,
    packages: {}
  };

  // -------- No config file → safe no-op --------
  if (!fs.existsSync(configPath)) {
    return safeConfig;
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('[HookFlow] Invalid JSON in .hookflowrc.json');
    console.error(err.message);
    return safeConfig;
  }

  // -------- Validate top-level shape --------
  if (!raw || typeof raw !== 'object') {
    console.warn('[HookFlow] Invalid config format, ignoring');
    return safeConfig;
  }

  const packages = raw.packages;
  if (!packages || typeof packages !== 'object' || Array.isArray(packages)) {
    console.warn('[HookFlow] "packages" must be an object, ignoring');
    return safeConfig;
  }

  // -------- Normalize packages --------
  for (const [pkgPath, hooksByType] of Object.entries(packages)) {
    const normalizedPkgPath = normalizePackagePath(pkgPath);

    if (!hooksByType || typeof hooksByType !== 'object') continue;

    for (const [hookType, hooks] of Object.entries(hooksByType)) {
      if (!SUPPORTED_HOOK_TYPES.has(hookType)) continue; // ignore unknown

      if (!Array.isArray(hooks)) continue;

      const normalizedHooks = hooks
        .map(normalizeHook)
        .filter(Boolean)
        .sort((a, b) => a.priority - b.priority);

      if (normalizedHooks.length === 0) continue;

      if (!safeConfig.packages[normalizedPkgPath]) {
        safeConfig.packages[normalizedPkgPath] = {};
      }

      safeConfig.packages[normalizedPkgPath][hookType] = normalizedHooks;
    }
  }

  // -------- Ensure root package exists if any hooks exist --------
  if (!safeConfig.packages['.']) {
    safeConfig.packages['.'] = {};
  }

  return safeConfig;
}

module.exports = { discoverConfigs };
