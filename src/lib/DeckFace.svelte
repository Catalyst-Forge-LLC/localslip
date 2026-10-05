<script lang="ts">
	import { onMount } from 'svelte';
	import BoardHeader from '$lib/BoardHeader.svelte';
	import BoardShell from '$lib/BoardShell.svelte';
	import VisitorTile from '$lib/VisitorTile.svelte';
	import { slipShareUrl, visitorHttpUrl } from '$lib/dashboard-url';
	import { emptyBerth } from '$lib/slip-open-page';
	import type { VisitorSnapshot, VisitorTileInfo } from '$lib/visitor';

	let {
		hostname,
		addresses,
		tiles,
		hostHeader,
		pageHost,
		boardLink = false
	}: {
		hostname: string;
		addresses: string[];
		tiles: VisitorTileInfo[];
		hostHeader: string | null;
		pageHost: string | null;
		/** Operator opened /deck from the lease table. */
		boardLink?: boolean;
	} = $props();

	let live = $state<VisitorSnapshot | null>(null);
	const shownHost = $derived(live?.hostname ?? hostname);
	const shownAddresses = $derived(live?.addresses ?? addresses);
	const shownTiles = $derived(live?.tiles ?? tiles);

	onMount(() => {
		const id = setInterval(() => {
			void fetch('/api/visitor')
				.then((res) => res.json() as Promise<VisitorSnapshot>)
				.then((body) => {
					live = body;
				});
		}, 8000);
		return () => clearInterval(id);
	});
</script>

{#snippet boardBack()}
	<a href="/">Board</a>
{/snippet}

<BoardShell>
	{#snippet header()}
		<BoardHeader
			deck
			hostname={shownHost}
			addresses={shownAddresses}
			children={boardLink ? boardBack : undefined}
		/>
	{/snippet}
	{#if shownTiles.length === 0}
		<div class="deck-empty">
			{@html emptyBerth()}
			<p>Nothing is listening on this address.</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each shownTiles as tile (tile.name)}
				<VisitorTile
					name={tile.name}
					port={tile.port}
					title={tile.title}
					icon={tile.icon}
					href={slipShareUrl(hostHeader, tile.name)}
					iconHref={pageHost ? visitorHttpUrl(pageHost, tile.port) : null}
				/>
			{/each}
		</div>
	{/if}
</BoardShell>
