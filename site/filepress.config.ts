import { defineFilepressConfig } from 'getfilepress';

export default defineFilepressConfig({
	title: 'LocalSlip',
	description: 'Named local port registry for development apps.',
	url: 'https://localslip.dev',
	author: 'Catalyst Forge, LLC',
	tagline: 'A named registry for local ports.',
	lede: 'Claim · lookup · same port',
	logo: '/logo.png',
	ogImage: '/logo.png',
	homePage: 'home',
	nav: [
		{ label: 'Home', href: '/' },
		{ label: 'Docs', href: '/docs' },
		{ label: 'Notes', href: '/writing' },
		{ label: 'Install', href: '/install' },
		{ label: 'npm', href: 'https://www.npmjs.com/package/localslip' },
		{ label: 'GitHub', href: 'https://github.com/Catalyst-Forge-LLC/localslip', icon: 'github' },
		{ label: 'LocalHelm', href: 'https://localhelm.dev' }
	],
	footerLinks: [
		{ label: 'See the rest of the Catalyst Forge shelf.', href: 'https://catalystforge.com/tools/' },
		{ label: 'Docs', href: '/docs' },
		{ label: 'Notes', href: '/writing' },
		{ label: 'Install', href: '/install' },
		{ label: 'npm', href: 'https://www.npmjs.com/package/localslip' },
		{ label: 'LocalHelm', href: 'https://localhelm.dev' },
		{ label: 'AppFacts', href: 'https://appfacts.dev/v#af1.eNpNUU2P0zAQ_SvWnEBy2wVuOYEqIRYCEmRvCKGJM5vM1rGNZ9JuVPW_I6dhy9V-X_PeGY5QvbEQcCSooI4OfeM5gQWdU3k6UWswJfOqaX68BguiqJNABeiUjwQWPDsKUrAfErqBNm-3d1egO0B1Bo-hn7AvgIc5UeMyJ7WmOZJXsuYzHvHf275prGkG8t6aTw9fa7CQp6C8hPsWO9o-CVh4zDjSKeYDVHCV-cK6WM6eQ1-MkP2JQ1cUwUKHii0uGZvvNWuJPUTRK9iXq-FioaMkUP08Q4AK3sui_CS7wyKe1jJezM1jzEYHMh3K0EbMHVzslduSKuWN_PGs9G4lJ8rCohTUiMaMPS0KKWY1nlBIXvi6xnciK3k9zUzKnnW-IeV5Rdy6NfRMblKOYTHY1_dGlg-Byy8L7cS-K8MkdAfs6feIAXvKJWJIY5meRIvnUsDGDeQOYMExVDCFjsX5KFSuhSGOlK7bDqpJqt1uaVM8p21HxzIgpSisMc__gXrWYWq3Lo67PSr6WXTzMeaeNnW9v0nA5S_A8uLe' }
	],
	topics: [{ label: 'Notes', tag: 'notes' }],
	paths: [{ url: '/docs', dir: 'docs/dist' }]
});
