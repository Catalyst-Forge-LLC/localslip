export const DEFAULT_DASHBOARD_HOST = '0.0.0.0';

/** `--host` wins, then `HOST`, then all interfaces. */
export function resolveDashboardHost(explicit?: string): string {
	const fromOpt = explicit?.trim();
	if (fromOpt) return fromOpt;
	const fromEnv = process.env.HOST?.trim();
	if (fromEnv) return fromEnv;
	return DEFAULT_DASHBOARD_HOST;
}

export function dashboardListenLine(host: string, port: number): string {
	if (host === '0.0.0.0' || host === '::' || host === '*') {
		return `LocalSlip dashboard  http://127.0.0.1:${port}/  (all interfaces)`;
	}
	return `LocalSlip dashboard  http://${host}:${port}/`;
}
