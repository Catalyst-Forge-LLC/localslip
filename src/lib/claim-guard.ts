/** Decide whether `claim --port` may adopt a socket something else already holds. */

export type ListenerIdentity = {
	cwd?: string | null;
	command?: string | null;
	process?: string | null;
};

function norm(p: string): string {
	return p.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
}

function related(a: string, b: string): boolean {
	const left = norm(a);
	const right = norm(b);
	if (!left || !right) return false;
	return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

/** Folders implied by a command line that runs out of `node_modules`. */
export function commandProjectHints(listener: ListenerIdentity): string[] {
	const command = (listener.command ?? '').replace(/\\/g, '/');
	const chunks = command.split('/node_modules/');
	const hints: string[] = [];
	for (let i = 0; i < chunks.length - 1; i++) {
		const match = (chunks[i] ?? '').match(/([A-Za-z]:\/.*|\/.*)$/);
		if (match?.[1]) hints.push(match[1]);
	}
	return hints;
}

export function listenerBelongsTo(
	listener: ListenerIdentity,
	claimDir: string
): 'match' | 'mismatch' | 'unknown' {
	const cwd = listener.cwd?.trim();
	if (cwd) return related(cwd, claimDir) ? 'match' : 'mismatch';
	const hints = commandProjectHints(listener);
	if (hints.length === 0) return 'unknown';
	return hints.some((hint) => related(hint, claimDir)) ? 'match' : 'mismatch';
}

function where(listener: ListenerIdentity): string {
	const cwd = listener.cwd?.trim();
	if (cwd) return listener.process ? `${listener.process} in ${cwd}` : cwd;
	const hint = commandProjectHints(listener)[0];
	if (hint && listener.process) return `${listener.process} in ${hint}`;
	return hint || listener.process || 'another app';
}

/**
 * Null means the claim may proceed.
 * `--force` names the socket anyway. `--or-next` moves to a free port.
 * A listener with no cwd and no project path is left alone (we cannot tell).
 */
export function foreignListenerMessage(opts: {
	port: number;
	listeners: ListenerIdentity[];
	claimDir: string;
	force?: boolean;
	orNext?: boolean;
}): string | null {
	if (opts.listeners.length === 0 || opts.force || opts.orNext) return null;
	const verdicts = opts.listeners.map((row) => listenerBelongsTo(row, opts.claimDir));
	if (verdicts.includes('match') || verdicts.every((verdict) => verdict === 'unknown')) return null;
	const foreign = opts.listeners.find((_, i) => verdicts[i] === 'mismatch');
	const who = foreign ? where(foreign) : 'another app';
	return `port ${opts.port} is already in use by ${who}. Pass --force to name it anyway, or --or-next for a free port.`;
}
