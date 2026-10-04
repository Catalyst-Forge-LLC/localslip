import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { foreignListenerMessage, listenerBelongsTo } from './claim-guard.js';

const engram = {
	process: 'node',
	command:
		'node "Z:\\workspace\\engram\\node_modules\\.bin\\..\\.pnpm\\vite@8\\node_modules\\vite\\bin\\vite.js" dev --host'
};

describe('listenerBelongsTo', () => {
	it('matches a command that runs from this project', () => {
		assert.equal(listenerBelongsTo(engram, 'Z:\\workspace\\engram'), 'match');
	});

	it('rejects a claim from a different project', () => {
		assert.equal(listenerBelongsTo(engram, 'Z:\\workspace\\forgetrail\\site'), 'mismatch');
	});

	it('trusts cwd over the command line', () => {
		assert.equal(
			listenerBelongsTo({ cwd: 'Z:\\workspace\\engram', command: engram.command }, 'Z:\\workspace\\engram'),
			'match'
		);
		assert.equal(
			listenerBelongsTo(
				{ cwd: 'Z:\\workspace\\engram', command: engram.command },
				'Z:\\workspace\\forgetrail\\site'
			),
			'mismatch'
		);
	});

	it('does not guess when the command has no project path', () => {
		assert.equal(
			listenerBelongsTo({ process: 'node', command: 'node server.js' }, 'Z:\\workspace\\engram'),
			'unknown'
		);
	});
});

describe('foreignListenerMessage', () => {
	it('blocks a dev script from naming another app’s port', () => {
		const message = foreignListenerMessage({
			port: 5195,
			listeners: [engram],
			claimDir: 'Z:\\workspace\\forgetrail\\site'
		});
		assert.match(message ?? '', /5195/);
		assert.match(message ?? '', /engram/);
		assert.match(message ?? '', /--force/);
	});

	it('allows the same project, an opaque process, --force, and --or-next', () => {
		assert.equal(
			foreignListenerMessage({
				port: 5195,
				listeners: [engram],
				claimDir: 'Z:\\workspace\\engram'
			}),
			null
		);
		assert.equal(
			foreignListenerMessage({
				port: 5432,
				listeners: [{ process: 'postgres', command: 'postgres' }],
				claimDir: 'Z:\\workspace\\engram'
			}),
			null
		);
		assert.equal(
			foreignListenerMessage({
				port: 5195,
				listeners: [engram],
				claimDir: 'Z:\\workspace\\forgetrail\\site',
				force: true
			}),
			null
		);
		assert.equal(
			foreignListenerMessage({
				port: 5195,
				listeners: [engram],
				claimDir: 'Z:\\workspace\\forgetrail\\site',
				orNext: true
			}),
			null
		);
	});
});
