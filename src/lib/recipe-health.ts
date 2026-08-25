import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type RecipeHealthStatus = 'ok' | 'no-recipe' | 'cwd-missing' | 'pkg-missing' | 'script-missing';

export type RecipeHealth = {
	status: RecipeHealthStatus;
	detail: string;
	script?: string;
};

function scriptFromCommand(command: string | null | undefined): string | null {
	const value = (command || 'pnpm serve').trim();
	const run = value.match(/^pnpm(?:\.cmd)?(?:\s+run)?\s+(\S+)/);
	return run?.[1] ?? null;
}

/** cwd / package.json / script — show this before Start, not after it fails. */
export function recipeHealth(input: { startCwd?: string | null; startCommand?: string | null }): RecipeHealth {
	const cwd = input.startCwd?.trim();
	if (!cwd) {
		return { status: 'no-recipe', detail: 'No start recipe. Save a guess or set cwd.' };
	}
	if (!existsSync(cwd)) {
		return { status: 'cwd-missing', detail: `Folder missing: ${cwd}` };
	}
	const pkgPath = path.join(cwd, 'package.json');
	if (!existsSync(pkgPath)) {
		return { status: 'pkg-missing', detail: `No package.json in ${cwd}` };
	}
	let scripts: Record<string, string> = {};
	try {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { scripts?: unknown };
		if (pkg.scripts && typeof pkg.scripts === 'object' && !Array.isArray(pkg.scripts)) {
			scripts = pkg.scripts as Record<string, string>;
		}
	} catch {
		return { status: 'pkg-missing', detail: `Unreadable package.json in ${cwd}` };
	}
	const script = scriptFromCommand(input.startCommand);
	if (script && !scripts[script]) {
		return {
			status: 'script-missing',
			detail: `No "${script}" script in ${cwd}`,
			script,
		};
	}
	return {
		status: 'ok',
		detail: `${input.startCommand || 'pnpm serve'} in ${cwd}`,
		script: script ?? undefined,
	};
}
