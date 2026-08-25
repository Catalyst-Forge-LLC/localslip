import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { familyRole, familyStem, isServeCommand } from './family.js';

describe('familyStem', () => {
	it('strips one suffix then folds hyphens', () => {
		assert.equal(familyStem('dictawhisper'), 'dictawhisper');
		assert.equal(familyStem('dictawhisper-api'), 'dictawhisper');
		assert.equal(familyStem('dictawhisper-site'), 'dictawhisper');
		assert.equal(familyStem('temper-pass'), 'temperpass');
		assert.equal(familyStem('temperpass-site'), 'temperpass');
	});

	it('does not treat file as filepress', () => {
		assert.notEqual(familyStem('file'), familyStem('filepress'));
		assert.notEqual(familyStem('file-site'), familyStem('filepress'));
	});

	it('labels roles from the suffix', () => {
		assert.equal(familyRole('dictawhisper'), 'ui');
		assert.equal(familyRole('dictawhisper-api'), 'api');
		assert.equal(familyRole('temperpass-site'), 'site');
	});

	it('treats missing command as pnpm serve', () => {
		assert.equal(isServeCommand(null), true);
		assert.equal(isServeCommand('pnpm start'), false);
	});
});
