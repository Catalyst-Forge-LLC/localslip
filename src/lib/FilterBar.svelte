<script lang="ts">
	import { filtersActive, type BoardFilters } from './board-view';
	import type { FirewallStatus } from './types';

	let {
		filters = $bindable(),
		variant,
		shown,
		total
	}: {
		filters: BoardFilters;
		variant: 'leases' | 'observed';
		shown: number;
		total: number;
	} = $props();

	function chip(on: boolean): string {
		return on
			? 'rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs text-[var(--text)]'
			: 'rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--muted)] hover:text-[var(--text)]';
	}

	function setListening(yes: boolean) {
		filters = { ...filters, listening: filters.listening === yes ? undefined : yes };
	}

	function setLan(yes: boolean) {
		filters = { ...filters, lan: filters.lan === yes ? undefined : yes };
	}

	function setFirewall(status: FirewallStatus) {
		filters = { ...filters, firewall: filters.firewall === status ? undefined : status };
	}

	function toggleConflict() {
		filters = { ...filters, conflict: filters.conflict ? undefined : true };
	}

	function toggleEphemeral() {
		filters = { ...filters, ephemeral: filters.ephemeral ? undefined : true };
	}
</script>

<div class="mb-2 flex shrink-0 flex-wrap items-end gap-x-5 gap-y-2" aria-label="Filters">
	{#if variant === 'leases'}
		<div class="flex flex-col gap-1" role="group" aria-label="Listen">
			<span class="text-[0.65rem] font-medium tracking-wide text-[var(--muted)] uppercase">Listen</span>
			<div class="flex flex-wrap gap-1.5">
				<button type="button" class={chip(filters.listening === true)} aria-pressed={filters.listening === true} onclick={() => setListening(true)}>
					Listening
				</button>
				<button type="button" class={chip(filters.listening === false)} aria-pressed={filters.listening === false} onclick={() => setListening(false)}>
					Quiet
				</button>
			</div>
		</div>
	{/if}
	<div class="flex flex-col gap-1" role="group" aria-label="Bind">
		<span class="text-[0.65rem] font-medium tracking-wide text-[var(--muted)] uppercase">Bind</span>
		<div class="flex flex-wrap gap-1.5">
			<button type="button" class={chip(filters.lan === true)} aria-pressed={filters.lan === true} onclick={() => setLan(true)}>
				LAN
			</button>
			<button type="button" class={chip(filters.lan === false)} aria-pressed={filters.lan === false} onclick={() => setLan(false)}>
				Loopback
			</button>
		</div>
	</div>
	{#if variant === 'leases'}
		<div class="flex flex-col gap-1" role="group" aria-label="Lease">
			<span class="text-[0.65rem] font-medium tracking-wide text-[var(--muted)] uppercase">Lease</span>
			<div class="flex flex-wrap gap-1.5">
				<button type="button" class={chip(Boolean(filters.conflict))} aria-pressed={Boolean(filters.conflict)} onclick={toggleConflict}>
					Conflict
				</button>
				<button type="button" class={chip(Boolean(filters.ephemeral))} aria-pressed={Boolean(filters.ephemeral)} onclick={toggleEphemeral}>
					Ephemeral
				</button>
			</div>
		</div>
		<div class="flex flex-col gap-1" role="group" aria-label="Firewall">
			<span class="text-[0.65rem] font-medium tracking-wide text-[var(--muted)] uppercase">Firewall</span>
			<div class="flex flex-wrap gap-1.5">
				<button type="button" class={chip(filters.firewall === 'applied')} aria-pressed={filters.firewall === 'applied'} onclick={() => setFirewall('applied')}>
					Applied
				</button>
				<button
					type="button"
					class={chip(filters.firewall === 'needs-elevation')}
					aria-pressed={filters.firewall === 'needs-elevation'}
					onclick={() => setFirewall('needs-elevation')}
				>
					Needs elevation
				</button>
				<button type="button" class={chip(filters.firewall === 'skipped')} aria-pressed={filters.firewall === 'skipped'} onclick={() => setFirewall('skipped')}>
					Skipped
				</button>
				<button type="button" class={chip(filters.firewall === 'wanted')} aria-pressed={filters.firewall === 'wanted'} onclick={() => setFirewall('wanted')}>
					Wanted
				</button>
			</div>
		</div>
	{/if}
	{#if filtersActive(filters)}
		<span class="pb-0.5 text-xs text-[var(--muted)] tabular-nums">{shown} of {total}</span>
	{/if}
</div>
