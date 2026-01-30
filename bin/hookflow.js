#!/usr/bin/env node

const { run, list, add, remove } = require('../src/cli/commands');

// ----------------- Helper -----------------
function parseArgs(args) {
    const result = { _: [] }; // positional args
    let skipNext = false;

    for (let i = 0; i < args.length; i++) {
        if (skipNext) {
            skipNext = false;
            continue;
        }

        const arg = args[i];

        if (arg.startsWith('--')) {
            const key = arg.slice(2).replace(/-/g, '');
            const next = args[i + 1];

            // Boolean flags (like --continue-on-error)
            if (!next || next.startsWith('--')) {
                result[key] = true;
            } else {
                result[key] = next;
                skipNext = true;
            }
        } else if (arg.startsWith('-')) {
            const key = arg.slice(1);
            const next = args[i + 1];
            result[key] = next;
            skipNext = true;
        } else {
            result._.push(arg);
        }
    }

    return result;
}

// ----------------- Main -----------------
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: hookflow <command> [options]');
        console.log('Commands: run, list, add, remove , update');
        process.exit(0);
    }

    const parsed = parseArgs(args);
    const command = parsed._[0];

    try {
        switch (command) {
            case 'run':
                await run({
                    type: parsed.type || parsed.t || 'postinstall',
                    package: parsed.package || parsed.p,
                });
                break;

            case 'list':
                const hooks = list();
                hooks.forEach((h) =>
                    console.log(
                        `id :${h.id} [${h.package}] ${h.type} → ${h.cmd} (priority: ${h.priority}, continueOnError: ${h.continueOnError})`
                    )
                );
                break;

            case 'add':
                const cmdToAdd = parsed._[1];
                if (!cmdToAdd) throw new Error('You must provide a command string to add');
                add({
                    cmd: cmdToAdd,
                    id: parsed.id, // 👈 forward ID
                    type: parsed.type || parsed.t || 'postinstall',
                    package: parsed.package || parsed.p || '.',
                    priority: parsed.priority || 0,
                    continueOnError: parsed.continueonerror || false,
                });
                console.log(
                    `Added hook: [${parsed.package || '.'}] ${parsed.type || 'postinstall'} → ${cmdToAdd} (priority: ${parsed.priority || 0}, continueOnError: ${parsed.continueonerror || false})`
                );
                break;

            case 'remove': {
                const id = parsed.id;
                const index = parsed.index !== undefined ? Number(parsed.index) : undefined;

                if (!id && index === undefined) {
                    throw new Error('You must provide --id or --index to remove a hook');
                }

                remove({
                    id,
                    index,
                    type: parsed.type || parsed.t || 'postinstall',
                    package: parsed.package || parsed.p || '.',
                });

                break;
            }
            case 'update': {
                const id = parsed.id;
                const index = parsed.index !== undefined ? Number(parsed.index) : undefined;

                if (!id && index === undefined) {
                    throw new Error('You must provide --id or --index to update a hook');
                }

                update({
                    id,
                    index,
                    cmd: parsed.cmd,
                    priority: parsed.priority,
                    continueOnError: parsed.continueonerror,
                    type: parsed.type || parsed.t || 'postinstall',
                    package: parsed.package || parsed.p || '.',
                });

                break;
            }


            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (err) {
        console.error('HookFlow error:', err.message);
        process.exit(1);
    }
}

main();
