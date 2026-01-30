// src/core/sort.js

function sortHooks(hooks) {
  return hooks
    .map((hook, index) => ({ ...hook, __index: index }))
    .sort((a, b) => {
      if (a.packagePath !== b.packagePath) {
        // Root first, then lexicographic
        if (a.packagePath === '.') return -1;
        if (b.packagePath === '.') return 1;
        return a.packagePath.localeCompare(b.packagePath);
      }

      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return a.__index - b.__index;
    })
    .map(({ __index, ...hook }) => hook);
}

module.exports = { sortHooks };
