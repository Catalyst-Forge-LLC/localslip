import { defineFilepressConfig } from 'getfilepress';

export default defineFilepressConfig({
	title: 'LocalSlip',
	description: 'Named local port registry for development apps.',
	url: 'https://localslip.dev',
	author: 'Catalyst Forge, LLC',
	tagline: 'Named local port registry',
	lede: 'Vite hands out 5173, then 5174. Reboot, and they swap. Name the port so they do not.',
	logo: '/logo.png',
	ogImage: '/logo.png',
	homePage: 'home',
	nav: [
		{ label: 'Home', href: '/' },
		{ label: 'Docs', href: '/docs' },
		{ label: 'Notes', href: '/writing' },
		{ label: 'Install', href: '/install' },
		{ label: 'npm', href: 'https://www.npmjs.com/package/localslip' },
		{ label: 'LocalHelm', href: 'https://localhelm.dev' }
	],
	footerLinks: [
		{ label: 'Docs', href: '/docs' },
		{ label: 'Notes', href: '/writing' },
		{ label: 'Install', href: '/install' },
		{ label: 'npm', href: 'https://www.npmjs.com/package/localslip' },
		{ label: 'LocalHelm', href: 'https://localhelm.dev' },
		{ label: 'AppFacts', href: 'https://appfacts.dev/v#af1.eNpNUkFu2zAQ_ArBUwtIdprefGphIEhaJUCj3IqioKiNxJgiGe5KjmDk71lSqt2TgOHszOyOTnKSuy-FdGoAuZPWa2XRmiALSXNI0BEaoUIQn-r68TPDSIpG5AelyUzAiDUaHCbu96B0D-X15moh6oPcnaRVrhtVlwhPrFnraAIVop7AEhTih5rUP2xf1_zQg7WFuH26r1gmjo5MDvfgW9i8IGPPkeMefWR5ucj8NJQtZ2tcl4yUsUfj2qTID60i1aicsf5VGUqxe4-0kPPW8p1pEHiz3yfpGP2GWfkFt4csHtZjnM3Fs4-CehCtwr7xKrasscw2QASxxFfLXl_X4QARDRI4Ekg-8kWyQvCRhAVOh-d5WuNrxHV4XU2MZFhzvjDxbWVcbivgDTQTvcsG--pOYH5ggz-FbEZj21QMt3XgFH8H5fgTU0QXhlQ9ICXPfICSK-UiC6kNY6NrDWrrEdK2fMQBwtJtTxRwt92e_6FNC1MqEIJHwwvP_5E6Q_3YbLQftnvuxs5I5Y2PHZRVtb9IyPcPZOHjHg' }
	],
	topics: [{ label: 'Notes', tag: 'notes' }],
	paths: [{ url: '/docs', dir: 'docs/dist' }]
});
