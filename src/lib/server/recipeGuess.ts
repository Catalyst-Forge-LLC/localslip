import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type RecipeGuess = {
	cwd: string;
	command: string;
};

export type RecipeGuessOpts = {
	roots?: string[];
};

type PkgScripts = Record<string, string>;

function workspaceRoots(extra: string[] = []): string[] {
	const fromEnv = [
		process.env.LOCALBERTH_WORKSPACE,
		process.env.LOCALHELM_CWD,
		process.cwd()
	];
	const out: string[] = [];
	for (const raw of [...extra, ...fromEnv]) {
		const dir = raw?.trim();
		if (!dir) continue;
		const abs = path.resolve(dir);
		if (!out.includes(abs)) out.push(abs);
		const parent = path.dirname(abs);
		if (parent !== abs && !out.includes(parent)) out.push(parent);
	}
	return out;
}

function folderNames(leaseName: string): string[] {
	const names = [leaseName];
	if (leaseName.endsWith('-site') && leaseName.length > 5) {
		names.push(leaseName.slice(0, -5));
	}
	return names;
}

function readScripts(dir: string): PkgScripts | null {
	const file = path.join(dir, 'package.json');
	if (!existsSync(file)) return null;
	try {
		const pkg = JSON.parse(readFileSync(file, 'utf8')) as { scripts?: PkgScripts };
		return pkg.scripts && typeof pkg.scripts === 'object' ? pkg.scripts : {};
	} catch {
		return null;
	}
}

function commandFor(scripts: PkgScripts, leaseName: string): string | null {
	if (leaseName.endsWith('-site') && scripts['site:dev']) return 'pnpm site:dev';
	if (scripts.serve) return 'pnpm serve';
	if (scripts.dev) return 'pnpm dev';
	return null;
}

/** Guess cwd + command from a sibling folder. Does not write the lease. */
export function proposeRecipe(leaseName: string, opts: RecipeGuessOpts = {}): RecipeGuess | null {
	const name = leaseName.trim().toLowerCase();
	if (!name) return null;
	for (const root of workspaceRoots(opts.roots)) {
		for (const folder of folderNames(name)) {
			const cwd = path.join(root, folder);
			const scripts = readScripts(cwd);
			if (!scripts) continue;
			const command = commandFor(scripts, name);
			if (!command) continue;
			return { cwd, command };
		}
	}
	return null;
}
