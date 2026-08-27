<script lang="ts">
	import '../app.css';
	import 'tippy.js/dist/tippy.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>LocalSlip</title>
</svelte:head>

<div class="h-full">
	{@render children()}
</div>
