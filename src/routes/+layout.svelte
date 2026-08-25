<script lang="ts">
	import '../app.css';
	import 'tippy.js/dist/tippy.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>LocalBerth</title>
</svelte:head>

<div class="h-full">
	{@render children()}
</div>
