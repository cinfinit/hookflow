const path = require('path');
const fs = require('fs');
const { normalizeHook } = require('./model');
const { sortHooks } = require('./sort');
const { runCommand } = require('../executor/run');

async function runHooks(config, hookType) {
  const collected = [];

  for (const [packagePath, hooksByType] of Object.entries(config.packages)) {
    const hooks = hooksByType[hookType];
    if (!hooks) continue;

    hooks.forEach((hook, index) => {
      collected.push({
        packagePath,
        hookType,
        ...normalizeHook(hook, index),
      });
    });
  }

  const ordered = sortHooks(collected);

  for (const hook of ordered) {
    const cwd =
      hook.packagePath === '.'
        ? process.cwd()
        : path.join(process.cwd(), hook.packagePath);

    if (!fs.existsSync(cwd)) {
      console.error(
        `[HOOK-FAILED] ${hook.packagePath} :: ${hook.hookType}`
      );
      console.error(`Directory does not exist: ${cwd}`);
      if (!hook.continueOnError) process.exit(1);
      else continue;
    }

    console.log(`[HOOK] ${hook.packagePath} :: ${hook.hookType} → ${hook.cmd}`);

    try {
      const result = await runCommand({ cmd: hook.cmd, cwd });
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    } catch (err) {
      console.error(`[HOOK-FAILED] ${hook.packagePath} :: ${hook.hookType}`);
      console.error(`Command: ${hook.cmd}`);
      console.error(`Exit code: ${err.code}`);
      if (err.stderr) console.error(err.stderr);

      if (!hook.continueOnError) process.exit(err.code || 1);
    }
  }
}

module.exports = { runHooks };
