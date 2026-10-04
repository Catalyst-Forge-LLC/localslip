import { resolve } from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/** SvelteKit's allow list is src and node_modules. The mark lives in site/static. */
function allowSiteStatic(): Plugin {
	const site = resolve('site').replace(/\\/g, '/');
	return {
		name: 'allow-site-static',
		configResolved(config) {
			const allow = config.server.fs.allow;
			if (!allow.some((dir) => dir.replace(/\\/g, '/') === site)) allow.push(site);
		}
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	for (const [key, value] of Object.entries(env)) {
		if (process.env[key] === undefined) process.env[key] = value;
	}
	const host = env.HOST?.trim() || process.env.HOST?.trim() || '0.0.0.0';
	const port = Number(env.PORT || process.env.PORT || 54321);

	return {
		plugins: [tailwindcss(), sveltekit(), allowSiteStatic()],
		server: {
			host,
			port: Number.isFinite(port) ? port : 54321,
			strictPort: true,
			// Phone / Tailscale MagicDNS (*.ts.net). IPs are already allowed.
			allowedHosts: true
		},
		ssr: {
			external: ['better-sqlite3']
		},
		optimizeDeps: {
			exclude: ['better-sqlite3']
		}
	};
});
