
---

# HookFlow 🪝⚡

[![NPM version](https://img.shields.io/npm/v/hookflow.svg?style=flat)](https://www.npmjs.com/package/hookflow) [![NPM downloads](https://img.shields.io/npm/dm/hookflow.svg?style=flat)](https://npmjs.org/package/hookflow)

> The hook orchestration system your monorepo didn’t know it desperately needed.

HookFlow is **not just another script helper**. It’s a deterministic, multi-package **hook orchestration system** for monorepos — capable of handling `preinstall`, `postinstall`, and `postbuild` hooks safely, predictably, and without conflicts.

Whether you’re juggling **Husky, Prisma, Patch-package**, or any custom scripts, HookFlow makes sure your hooks **run in the right order, in the right place, every time**.

---

## Why HookFlow Exists

If you’ve ever had multiple tools trying to run hooks in your monorepo, you know the pain:

* Husky overwriting other postinstall scripts.
* Prisma `generate` failing silently.
* Patch-package running before dependencies are installed.

HookFlow solves this by:

* **Centralizing hooks** across root + packages.
* **Deterministic execution** with optional priority.
* **Safe error handling** for CI/CD (`fail-fast` or `continueOnError`).
* **Future-ready architecture** for multiple hook types and per-package orchestration.

In short: **no conflicts, no surprises, hooks just work.**

---

## Features

* ✅ Multi-hook type support: `preinstall`, `postinstall`, `postbuild`
* ✅ Monorepo-friendly: define hooks per package, including root
* ✅ CLI commands: `add`, `remove`, `list`, `run`
* ✅ Hook priorities and deterministic ordering
* ✅ Optional `continueOnError` per hook
* ✅ Auto-generated or user-defined **hook IDs**
* ✅ Fully production-ready, zero runtime dependencies (Node.js only)

---

## Installation

```bash
npm install --save-dev hookflow
```

Or run without installing:

```bash
npx hookflow
```

---

## Configuration (just for info , so that you dont delete hookflowrc.json accidently :| )
 
HookFlow stores its configuration in **`.hookflowrc.json`** at the root of your repo. Don't hack it , not recommended . You can try though and face the mess ;) . Here’s a **future-proof schema**:

```json
{
  "schemaVersion": 1,
  "packages": {
    ".": {
      "postinstall": [
        { "id": "root-1", "cmd": "husky install", "priority": 10, "continueOnError": true },
        { "id": "root-2", "cmd": "patch-package", "priority": 20 }
      ]
    },
    "packages/api": {
      "postinstall": [
        { "id": "api-1", "cmd": "prisma generate", "priority": 5 }
      ]
    }
  }
}
```

**Notes:**

* `.` → root package
* `packages/api` → relative path to a package
* `priority` → optional, default `0`
* `continueOnError` → optional, default `false`
* `id` → unique hook ID (auto-generated if missing)

---

## CLI Usage

### Add a Hook

```bash
# Add root hook (auto ID)
npx hookflow add "echo root hook"

# Add root hook with priority & continue-on-error
npx hookflow add "echo important hook" --priority 10 --continue-on-error

# Add package-specific hook
npx hookflow add "echo api hook" --package packages/api --priority 5

# Add with custom hook ID
npx hookflow add "echo migration hook" --id migrate-api --package packages/api
```

---

### Update a Hook

```bash
# Update a hook by its ID
npx hookflow update --id migrate-api --cmd "prisma migrate deploy" --priority 8
```

---

### Remove a Hook

```bash
# Remove a hook by ID
npx hookflow remove --id migrate-api

```

---

### List Hooks

```bash
npx hookflow list
```

Sample output:

```
id :hf_773a0483 [.] preinstall → echo hi (priority: 0, continueOnError: false)
id :important-root [.] postinstall → echo important hook (priority: 0, continueOnError: false)
id :api-1 [packages/api] postinstall → echo api hook (priority: 0, continueOnError: false)
```

---

### Run Hooks

```bash
# Run all postinstall hooks
npx hookflow run

# Run a specific hook type
npx hookflow run --type preinstall
```

* Hooks execute **per package**, with `cwd` set correctly.
* Fails fast by default.
* Optional `--continue-on-error` allows selective continuation.

---

## Error Handling

HookFlow provides clear, CI-friendly output:

```
[HOOK-FAILED] packages/api :: postinstall
Command: prisma generate
Exit code: 1
Stdout: ...
Stderr: ...
```

* `continueOnError: true` → HookFlow will continue to the next hook
* Exit codes reflect failures for CI/CD pipelines

---

---

## Wiring HookFlow into npm Lifecycle Scripts

HookFlow **does not replace npm’s lifecycle** — it aligns with it.

You explicitly decide **which hooks run at which lifecycle stage** by wiring HookFlow into your `package.json` scripts.

### Recommended setup

```json
{
  "scripts": {
    "preinstall": "hookflow run --type preinstall",
    "postinstall": "hookflow run --type postinstall"
  }
}
```

### What this means

| npm lifecycle | What runs                                             |
| ------------- | ----------------------------------------------------- |
| `preinstall`  | All `preinstall` hooks defined in `.hookflowrc.json`  |
| `postinstall` | All `postinstall` hooks defined in `.hookflowrc.json` |

HookFlow:

* Runs hooks **only for the specified type**
* Preserves npm’s lifecycle semantics
* Avoids accidental or out-of-order execution

---

### Why this is explicit (and intentional)

HookFlow will **never guess** which hooks to run.

This avoids dangerous behavior like:

* Running `preinstall` hooks *after* dependencies are installed
* Mixing lifecycle phases unintentionally
* Breaking CI installs with unexpected commands

If you don’t wire a lifecycle — **those hooks simply won’t run**.

---

### Advanced usage (optional)

If you want to run hooks manually:

```bash
# Run only postinstall hooks
hookflow run --type postinstall

# Run only preinstall hooks
hookflow run --type preinstall
```

Or, for advanced users only:

```bash
# Run all hook types explicitly
hookflow run --all
```

⚠️ Running all hook types is **never the default** and must be opt-in.

---


## Use Cases

1. **Monorepo dependency setup** – install dependencies + generate Prisma models + apply patches in one flow.
2. **CI/CD pipelines** – deterministic hook execution ensures reliable builds.
3. **Custom developer workflows** – precommit lint, postinstall scripts, custom postbuild tasks.
4. **Multi-package orchestration** – each package can have its own hooks, but all coordinated via a single CLI.

---

## Contributing

HookFlow is **open-source and welcomes contributions**.

```bash
git clone https://github.com/cinfinit/hookflow.git
```
---

## TL;DR

HookFlow = 🪝 + ⚡ + 😌

* Centralizes hooks for monorepos
* Deterministic, safe, CI-friendly
* Easy CLI to add, remove, list, and run hooks
* Future-ready for multiple hook types & packages

---

## About the Author 🧑‍💻

HookFlow was created by [**Cinfinit**](https://github.com/cinfinit) — a self-proclaimed hook whisperer, monorepo wrangler, and accidental shell script poet. Had to write something , 
then thought why not something different this time ;)

When not orchestrating hooks across packages or debugging `ENOENT` errors, Cinfinite enjoys:

* Writing JavaScript that doesn’t make you want to cry
* Turning `postinstall` chaos into deterministic harmony
* Inventing witty names for developer tools (HookFlow, obviously 😉)
* Pretending that “priority 10” in JSON is the same as “priority life goals”

philosophy: **“If your hooks aren’t flowing, neither are you.”**
MAY BE , may be not :| 

---


### TL;DR

> **npm controls *when***
> **HookFlow controls *what and how***

You wire them together explicitly — no magic, no surprises.

---
