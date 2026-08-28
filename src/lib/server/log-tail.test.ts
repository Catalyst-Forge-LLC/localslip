import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

const home = mkdtempSync(join(tmpdir(), 'localslip-log-'));
process.env.LOCALSLIP_HOME = home;

const { readLogTail } = await import('./log-tail.js');

describe('readLogTail', () => {
	it('says start once when the file is missing or empty', () => {
		assert.equal(readLogTail('missing').preview, 'No log yet — start once.');
		assert.equal(readLogTail('missing').exists, false);
		mkdirSync(join(home, 'logs'), { recursive: true });
		writeFileSync(join(home, 'logs', 'empty.log'), '');
		assert.equal(readLogTail('empty').preview, 'No log yet — start once.');
		assert.equal(readLogTail('empty').exists, true);
	});

	it('returns the last lines and a short preview', () => {
		mkdirSync(join(home, 'logs'), { recursive: true });
		const lines = Array.from({ length: 50 }, (_, i) => `line ${i + 1}`);
		writeFileSync(join(home, 'logs', 'demo.log'), `${lines.join('\n')}\n`);
		const tail = readLogTail('demo');
		assert.equal(tail.lines.length, 40);
		assert.equal(tail.lines[0], 'line 11');
		assert.equal(tail.preview, 'line 50');
	});

	after(() => {
		rmSync(home, { recursive: true, force: true });
	});
});
