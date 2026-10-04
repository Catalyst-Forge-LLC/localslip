<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import BoardHeader from '$lib/BoardHeader.svelte';
	import BoardShell from '$lib/BoardShell.svelte';
	import FilterBar from '$lib/FilterBar.svelte';
	import RowDetail from '$lib/RowDetail.svelte';
	import SortHead from '$lib/SortHead.svelte';
	import VisitorTile from '$lib/VisitorTile.svelte';
	import { nextSort, viewRows, type BoardFilters, type SortKey, type SortState } from '$lib/board-view';
	import Tooltip from '$lib/Tooltip.svelte';
	import { OPEN_TARGET, rowOpenUrl, visitorHttpUrl } from '$lib/dashboard-url';
	import { firewallLabel, firewallTip } from '$lib/firewall-label';
	import { rowBindDisplay } from '$lib/row-detail';
	import type { BoardRow } from '$lib/types';
	import type { VisitorSnapshot } from '$lib/visitor';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let expanded = $state<string | null>(null);
	let peekLine = $state<Record<string, string>>({});
	let visitorFeed = $state<VisitorSnapshot | null>(null);
	let tab = $state<'leases' | 'observed'>('leases');
	let leaseFilters = $state<BoardFilters>({});
	let observedFilters = $state<BoardFilters>({});
	let leaseSort = $state<SortState>({ key: 'name', dir: 1 });
	let observedSort = $state<SortState>({ key: 'port', dir: 1 });

	const leaseView = $derived(viewRows(data.leaseRows, leaseFilters, leaseSort));
	const observedView = $derived(viewRows(data.observedRows, observedFilters, observedSort));

	const visitorMachine = $derived(visitorFeed ?? data.machine);
	const visitorTiles = $derived(visitorFeed?.tiles ?? data.visitorTiles);

	function fwTone(status: string | undefined): string {
		if (status === 'wanted' || status === 'needs-elevation') return 'tone-wait';
		return 'tone-dim';
	}

	function rowId(row: BoardRow): string {
		if (row.lease) return `lease:${row.lease.name}`;
		return `obs:${row.observed?.port ?? ''}:${row.observed?.bind ?? ''}`;
	}

	async function toggle(row: BoardRow, event: MouseEvent) {
		if ((event.target as HTMLElement | null)?.closest('a')) return;
		const key = rowId(row);
		if (expanded === key) {
			expanded = null;
			return;
		}
		expanded = key;
		if (!row.listening) {
			peekLine[key] = 'Not listening.';
			return;
		}
		const port = row.lease?.port ?? row.observed?.port;
		if (!port) {
			peekLine[key] = 'Not listening.';
			return;
		}
		peekLine[key] = 'Peeking…';
		const res = await fetch(`/api/peek?port=${port}`);
		const body = (await res.json()) as { line?: string };
		if (expanded === key) peekLine[key] = body.line || 'Not HTTP.';
	}

	onMount(() => {
		if (data.face === 'visitor') {
			const id = setInterval(() => {
				void fetch('/api/visitor')
					.then((res) => res.json() as Promise<VisitorSnapshot>)
					.then((body) => {
						visitorFeed = body;
					});
			}, 8000);
			return () => clearInterval(id);
		}
		const id = setInterval(() => {
			void invalidateAll();
		}, 8000);
		return () => clearInterval(id);
	});
</script>

{#if data.face === 'visitor'}
	<BoardShell>
		{#snippet header()}
			<BoardHeader deck hostname={visitorMachine.hostname} addresses={visitorMachine.addresses} />
		{/snippet}
		{#if visitorTiles.length === 0}
			<p class="tone-dim text-sm">
				Nothing listening past loopback. Claim with
				<code>--lan</code>
				or start the app on all interfaces.
			</p>
		{:else}
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{#each visitorTiles as tile (tile.name)}
					<VisitorTile
						name={tile.name}
						port={tile.port}
						title={tile.title}
						icon={tile.icon}
						href={data.pageHost ? visitorHttpUrl(data.pageHost, tile.port) : null}
					/>
				{/each}
			</div>
		{/if}
	</BoardShell>
{:else}
	<BoardShell fill>
		{#snippet header()}
	<BoardHeader hostname={data.machine.hostname} addresses={data.machine.addresses}>
		:54321 ·
		{#if data.showSystem}
			<a href="/">Hide system ports</a>
		{:else}
			<a href="/?system=1">
				Show {data.hiddenSystem} system port{data.hiddenSystem === 1 ? '' : 's'}
			</a>
		{/if}
	</BoardHeader>
		{/snippet}

	<div class="flex min-h-0 flex-1 flex-col">
		<div class="mb-3 flex shrink-0 gap-1" role="tablist" aria-label="Board">
			<button
				type="button"
				class="station"
				role="tab"
				id="tab-leases"
				aria-controls="pane-leases"
				aria-selected={tab === 'leases'}
				onclick={() => (tab = 'leases')}
			>
				Leases
				<span class="n">{data.leaseRows.length}</span>
			</button>
			<button
				type="button"
				class="station"
				role="tab"
				id="tab-observed"
				aria-controls="pane-observed"
				aria-selected={tab === 'observed'}
				onclick={() => (tab = 'observed')}
			>
				Observed
				<span class="n">{data.observedRows.length}</span>
			</button>
		</div>

		{#if tab === 'leases'}
			<div id="pane-leases" role="tabpanel" aria-labelledby="tab-leases" class="flex min-h-0 flex-1 flex-col">
				<FilterBar bind:filters={leaseFilters} variant="leases" shown={leaseView.length} total={data.leaseRows.length} />
				<div class="slip-panel hud-frame min-h-0 flex-1 overflow-auto">
				<table>
					<thead>
						<tr>
							<SortHead label="Name" col="name" sort={leaseSort} onsort={(key: SortKey) => (leaseSort = nextSort(leaseSort, key))} />
							<SortHead label="Port" col="port" sort={leaseSort} onsort={(key: SortKey) => (leaseSort = nextSort(leaseSort, key))} />
							<SortHead label="Bind" col="bind" sort={leaseSort} onsort={(key: SortKey) => (leaseSort = nextSort(leaseSort, key))} />
							<SortHead label="Listening" col="listening" sort={leaseSort} onsort={(key: SortKey) => (leaseSort = nextSort(leaseSort, key))} />
							<SortHead label="Process" col="process" sort={leaseSort} onsort={(key: SortKey) => (leaseSort = nextSort(leaseSort, key))} />
							<SortHead label="Firewall" col="firewall" sort={leaseSort} onsort={(key: SortKey) => (leaseSort = nextSort(leaseSort, key))} />
							<th class="go"></th>
						</tr>
					</thead>
					<tbody>
						{#each leaseView as row}
							{@const href = rowOpenUrl(row)}
							{@const key = rowId(row)}
							<tr
								class="slip-row {row.conflict ? 'conflict' : ''} {expanded === key ? 'open' : ''}"
								onclick={(event) => toggle(row, event)}
							>
								<td>
									<Tooltip title={row.recipe?.detail ?? row.lease?.name ?? ''}>
										{row.lease?.name}
									</Tooltip>
								</td>
								<td class="num">{row.lease?.port}</td>
								<td class="tone-dim">{rowBindDisplay(row)}</td>
								<td>
									{#if row.listening}
										<span class="tone-live">yes</span>
									{:else}
										<span class="tone-dim">no</span>
									{/if}
								</td>
								<td class="tone-dim">
									{row.observed?.process ?? '—'}
									{#if row.observed?.pid}
										<span class="text-xs">({row.observed.pid})</span>
									{/if}
								</td>
								<td class={fwTone(row.lease?.firewall)}>
									<Tooltip title={firewallTip(row.lease?.firewall, row.lease?.bind)}>
										{firewallLabel(row.lease?.firewall, row.lease?.bind)}
									</Tooltip>
								</td>
								<td class="go">
									{#if href}
										<Tooltip title={`Open ${href}`}>
											<a
												href={href}
												target={OPEN_TARGET}
												rel="noopener"
												aria-label="Open"
											>
												<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
													<path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" />
													<path d="M9 2h5v5" />
													<path d="M14 2 8 8" />
												</svg>
											</a>
										</Tooltip>
									{/if}
								</td>
							</tr>
							<tr class="detail">
								<td class="p-0" colspan="7">
									<div class="grid transition-[grid-template-rows] duration-200 {expanded === key ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}">
										<div class="min-h-0 overflow-hidden">
											<div class="px-4 pb-3.5 pt-2.5 text-sm {expanded === key ? '' : 'invisible'}">
												<RowDetail
													{row}
													peek={peekLine[key] ?? (row.listening ? 'Peeking…' : 'Not listening.')}
												/>
											</div>
										</div>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td class="tone-dim" colspan="7">
									{data.leaseRows.length === 0 ? 'No leases.' : 'No leases match.'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				</div>
			</div>
		{:else}
			<div id="pane-observed" role="tabpanel" aria-labelledby="tab-observed" class="flex min-h-0 flex-1 flex-col">
				<FilterBar bind:filters={observedFilters} variant="observed" shown={observedView.length} total={data.observedRows.length} />
				<div class="slip-panel hud-frame min-h-0 flex-1 overflow-auto">
				<table>
					<thead>
						<tr>
							<SortHead label="Port" col="port" sort={observedSort} onsort={(key: SortKey) => (observedSort = nextSort(observedSort, key))} />
							<SortHead label="Bind" col="bind" sort={observedSort} onsort={(key: SortKey) => (observedSort = nextSort(observedSort, key))} />
							<SortHead label="Process" col="process" sort={observedSort} onsort={(key: SortKey) => (observedSort = nextSort(observedSort, key))} />
							<th class="go"></th>
						</tr>
					</thead>
					<tbody>
						{#each observedView as row}
							{@const href = rowOpenUrl(row)}
							{@const key = rowId(row)}
							<tr
								class="slip-row {expanded === key ? 'open' : ''}"
								onclick={(event) => toggle(row, event)}
							>
								<td class="num">{row.observed?.port}</td>
								<td class="tone-dim">{row.observed?.bind}</td>
								<td class="tone-dim">
									{row.observed?.process ?? '—'}
									{#if row.observed?.pid}
										<span class="text-xs">({row.observed.pid})</span>
									{/if}
								</td>
								<td class="go">
									{#if href}
										<Tooltip title={`Open ${href}`}>
											<a
												href={href}
												target={OPEN_TARGET}
												rel="noopener"
												aria-label="Open"
											>
												<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
													<path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" />
													<path d="M9 2h5v5" />
													<path d="M14 2 8 8" />
												</svg>
											</a>
										</Tooltip>
									{/if}
								</td>
							</tr>
							<tr>
								<td class="p-0" colspan="4">
									<div class="grid transition-[grid-template-rows] duration-200 {expanded === key ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}">
										<div class="min-h-0 overflow-hidden">
											<div class="px-4 pb-3.5 pt-2.5 text-sm {expanded === key ? '' : 'invisible'}">
												<RowDetail
													{row}
													peek={peekLine[key] ?? (row.listening ? 'Peeking…' : 'Not listening.')}
												/>
											</div>
										</div>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td class="tone-dim" colspan="4">
									{data.observedRows.length === 0
										? 'Nothing extra listening (system ports hidden).'
										: 'Nothing matches.'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				</div>
			</div>
		{/if}

		<p class="tone-dim mt-3 shrink-0 text-sm">
			<code>localslip claim name --port N</code>
			·
			<code>localslip get name</code>
			·
			<code>localslip release name</code>
			·
			<code>localslip serve</code>
		</p>
	</div>
	</BoardShell>
{/if}
