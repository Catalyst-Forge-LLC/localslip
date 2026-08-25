import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type RecipeGuess = {
	cwd: string;
	command: string;
};

export type RecipeGuessOpts = {
	roots?: string[];
};

type PkgInfo = {
	name: string | null;
	scripts: Record<string, string>;
};

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

const FOLDER_SUFFIXES = ['-site', '-api'] as const;

function folderNames(leaseName: string): string[] {
	const names = [leaseName];
	for (const suffix of FOLDER_SUFFIXES) {
		if (leaseName.endsWith(suffix) && leaseName.length > suffix.length) {
			names.push(leaseName.slice(0, -suffix.length));
		}
	}
	return names;
}

function foldName(value: string): string {
	return value.replace(/-/g, '').toLowerCase();
}

function siblingDirs(root: string): string[] {
	try {
		return readdirSync(root, { withFileTypes: true })
			.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules')
			.map((entry) => entry.name);
	} catch {
		return [];
	}
}

function readPkg(dir: string): PkgInfo | null {
	const file = path.join(dir, 'package.json');
	if (!existsSync(file)) return null;
	try {
		const pkg = JSON.parse(readFileSync(file, 'utf8')) as { name?: unknown; scripts?: unknown };
		const scripts =
			pkg.scripts && typeof pkg.scripts === 'object' && !Array.isArray(pkg.scripts)
				? (pkg.scripts as Record<string, string>)
				: {};
		const name = typeof pkg.name === 'string' ? pkg.name.trim().toLowerCase() : null;
		return { name, scripts };
	} catch {
		return null;
	}
}

function commandFor(scripts: Record<string, string>, leaseName: string): string | null {
	if (leaseName.endsWith('-site') && scripts['site:dev']) return 'pnpm site:dev';
	if (leaseName.endsWith('-api') && scripts.start) return 'pnpm start';
	if (scripts.serve) return 'pnpm serve';
	if (scripts.dev) return 'pnpm dev';
	return null;
}

function wantedSet(leaseName: string): { exact: Set<string>; folded: Set<string> } {
	const names = folderNames(leaseName);
	return {
		exact: new Set(names),
		folded: new Set(names.map(foldName))
	};
}

function pkgMatchesLease(pkgName: string | null, wanted: ReturnType<typeof wantedSet>): boolean {
	if (!pkgName) return false;
	return wanted.exact.has(pkgName) || wanted.folded.has(foldName(pkgName));
}

/** Guess cwd + command from a sibling folder. Does not write the lease. */
export function proposeRecipe(leaseName: string, opts: RecipeGuessOpts = {}): RecipeGuess | null {
	const name = leaseName.trim().toLowerCase();
	if (!name) return null;
	const wanted = wantedSet(name);
	for (const root of workspaceRoots(opts.roots)) {
		const tried = new Set<string>();
		const queue: string[] = [];
		for (const folder of wanted.exact) {
			queue.push(path.join(root, folder));
		}
		for (const dir of siblingDirs(root)) {
			if (wanted.folded.has(foldName(dir))) queue.push(path.join(root, dir));
		}
		for (const cwd of queue) {
			if (tried.has(cwd)) continue;
			tried.add(cwd);
			const pkg = readPkg(cwd);
			if (!pkg) continue;
			const command = commandFor(pkg.scripts, name);
			if (!command) continue;
			return { cwd, command };
		}
		for (const dir of siblingDirs(root)) {
			const cwd = path.join(root, dir);
			if (tried.has(cwd)) continue;
			tried.add(cwd);
			const pkg = readPkg(cwd);
			if (!pkg || !pkgMatchesLease(pkg.name, wanted)) continue;
			const command = commandFor(pkg.scripts, name);
			if (!command) continue;
			return { cwd, command };
		}
	}
	return null;
}
