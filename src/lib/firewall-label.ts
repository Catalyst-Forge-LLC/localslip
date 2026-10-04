import { isLoopbackBind } from './binds.js';

/** Board words for the stored firewall status. The database value stays put. */
export function firewallLabel(status: string | undefined, bind?: string | null): string {
	if (!status) return '—';
	if (status === 'applied') return 'allowed';
	if (status === 'wanted') return 'pending';
	if (status === 'needs-elevation') return 'needs admin';
	if (status === 'skipped') {
		if (bind && !isLoopbackBind(bind)) return 'no rule';
		return 'private';
	}
	return status;
}

export function firewallTip(status: string | undefined, bind?: string | null): string {
	if (status === 'applied') return 'Inbound allow is installed.';
	if (status === 'wanted') return 'Inbound allow is not applied yet. Run localslip firewall sync.';
	if (status === 'needs-elevation') {
		return 'Inbound allow needs an Administrator terminal. Run localslip firewall sync.';
	}
	if (status === 'skipped' && bind && !isLoopbackBind(bind)) {
		return 'No inbound rule for this claim.';
	}
	if (status === 'skipped') return 'Loopback claim. No inbound rule.';
	return '';
}
