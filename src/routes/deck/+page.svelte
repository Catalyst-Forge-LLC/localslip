<script lang="ts">
	import DeckFace from '$lib/DeckFace.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>LocalSlip</title>
</svelte:head>

<DeckFace
	hostname={data.machine.hostname}
	addresses={data.machine.addresses}
	tiles={data.tiles}
	hostHeader={data.hostHeader}
	pageHost={data.pageHost}
	boardLink={data.boardLink}
/>
