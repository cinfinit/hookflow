const path = require('path');
const fs = require('fs');
const { discoverConfigs } = require('../config/load');
const { runHooks } = require('../core/orchestrator');
const { normalizeHookType } = require('./validate');
const { generateHookId } = require('../utils/ids');

// ---------------- RUN ----------------
async function run({ type = 'postinstall', package: pkg } = {}) {
  const config = discoverConfigs(process.cwd());
  let filteredConfig = config;

  if (pkg) {
    const pkgKey = pkg;
    if (!config.packages[pkgKey]) {
      throw new Error(`Package ${pkgKey} not found`);
    }
    filteredConfig = { packages: { [pkgKey]: config.packages[pkgKey] } };
  }

  await runHooks(filteredConfig, type);
}

// ---------------- LIST ----------------
function list() {
  const config = discoverConfigs(process.cwd());
  const output = [];
  for (const [pkg, hooksByType] of Object.entries(config.packages)) {
    for (const [type, hooks] of Object.entries(hooksByType)) {
      hooks.forEach((h, i) => {
        output.push({
          package: pkg,
          type,
          index: i,
          cmd: h.cmd,
          priority: h.priority || 0,
          id: h.id,
          continueOnError: !!h.continueOnError
        });
      });
    }
  }
  return output;
}

function add({ cmd, type, package: pkg = '.', priority = 0, continueOnError = false, id }) {
  const normalizedType = normalizeHookType(type);

  const configPath = path.join(process.cwd(), '.hookflowrc.json');
  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath))
    : { schemaVersion: 1, packages: {} };

  if (!config.packages[pkg]) config.packages[pkg] = {};
  if (!config.packages[pkg][normalizedType]) config.packages[pkg][normalizedType] = [];

  // Generate ID if not provided
  const hookId = id || generateHookId();

  // Ensure uniqueness
  if (config.packages[pkg][normalizedType].some(h => h.id === hookId)) {
    throw new Error(`Hook ID "${hookId}" already exists in package "${pkg}" and type "${normalizedType}"`);
  }

  config.packages[pkg][normalizedType].push({
    id: hookId,
    cmd,
    priority: Number(priority),
    continueOnError: !!continueOnError
  });

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`[HookFlow] Added hook: [${pkg}] ${normalizedType} :: ${hookId} → ${cmd}`);
}


function remove({ id, index, type, package: pkg = '.' }) {
  const normalizedType = normalizeHookType(type);
  const configPath = path.join(process.cwd(), '.hookflowrc.json');
  if (!fs.existsSync(configPath)) throw new Error('No .hookflowrc.json found');

  const config = JSON.parse(fs.readFileSync(configPath));
  const hooks = config.packages?.[pkg]?.[normalizedType];

  if (!hooks || hooks.length === 0) throw new Error(`No hooks found in package "${pkg}" type "${normalizedType}"`);

  let removed;
  if (id) {
    const idx = hooks.findIndex(h => h.id === id);
    if (idx === -1) throw new Error(`Hook with ID "${id}" not found`);
    removed = hooks.splice(idx, 1)[0];
  } else if (index !== undefined) {
    removed = hooks.splice(index, 1)[0];
  } else {
    throw new Error('Must provide either --id or --index to remove a hook');
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`[HookFlow] Removed hook: [${pkg}] ${normalizedType} :: ${removed.id}`);
}

function update({ id, index, cmd, priority, continueOnError, type, package: pkg = '.' }) {
  const normalizedType = normalizeHookType(type);

  const configPath = path.join(process.cwd(), '.hookflowrc.json');
  if (!fs.existsSync(configPath)) throw new Error('No .hookflowrc.json found');

  const config = JSON.parse(fs.readFileSync(configPath));
  const hooks = config.packages?.[pkg]?.[normalizedType];

  if (!hooks || hooks.length === 0) throw new Error(`No hooks found in package "${pkg}" type "${normalizedType}"`);

  // Prefer ID if provided
  let hook;
  if (id) {
    hook = hooks.find(h => h.id === id);
    if (!hook) throw new Error(`Hook with ID "${id}" not found`);
  } else if (index !== undefined) {
    hook = hooks[index];
    if (!hook) throw new Error(`Hook at index ${index} not found`);
  } else {
    throw new Error('Must provide either --id or --index to update a hook');
  }

  if (cmd !== undefined) hook.cmd = cmd;
  if (priority !== undefined) hook.priority = Number(priority);
  if (continueOnError !== undefined) hook.continueOnError = !!continueOnError;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`[HookFlow] Updated hook: [${pkg}] ${normalizedType} :: ${hook.id}`);
}


module.exports = { run, list, add, remove, update };
