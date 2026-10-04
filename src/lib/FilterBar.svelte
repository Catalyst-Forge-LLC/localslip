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
			<span class="fl">Listen</span>
			<div class="flex flex-wrap gap-1.5">
				<button type="button" class="chip" aria-pressed={filters.listening === true} onclick={() => setListening(true)}>
					Listening
				</button>
				<button type="button" class="chip" aria-pressed={filters.listening === false} onclick={() => setListening(false)}>
					Quiet
				</button>
			</div>
		</div>
	{/if}
	<div class="flex flex-col gap-1" role="group" aria-label="Bind">
		<span class="fl">Bind</span>
		<div class="flex flex-wrap gap-1.5">
			<button type="button" class="chip" aria-pressed={filters.lan === true} onclick={() => setLan(true)}>
				LAN
			</button>
			<button type="button" class="chip" aria-pressed={filters.lan === false} onclick={() => setLan(false)}>
				Loopback
			</button>
		</div>
	</div>
	{#if variant === 'leases'}
		<div class="flex flex-col gap-1" role="group" aria-label="Lease">
			<span class="fl">Lease</span>
			<div class="flex flex-wrap gap-1.5">
				<button type="button" class="chip" aria-pressed={Boolean(filters.conflict)} onclick={toggleConflict}>
					Conflict
				</button>
				<button type="button" class="chip" aria-pressed={Boolean(filters.ephemeral)} onclick={toggleEphemeral}>
					Ephemeral
				</button>
			</div>
		</div>
		<div class="flex flex-col gap-1" role="group" aria-label="Firewall">
			<span class="fl">Firewall</span>
			<div class="flex flex-wrap gap-1.5">
				<button type="button" class="chip" aria-pressed={filters.firewall === 'applied'} onclick={() => setFirewall('applied')}>
					Allowed
				</button>
				<button
					type="button"
					class="chip"
					aria-pressed={filters.firewall === 'needs-elevation'}
					onclick={() => setFirewall('needs-elevation')}
				>
					Needs admin
				</button>
				<button type="button" class="chip" aria-pressed={filters.firewall === 'skipped'} onclick={() => setFirewall('skipped')}>
					Private
				</button>
				<button type="button" class="chip" aria-pressed={filters.firewall === 'wanted'} onclick={() => setFirewall('wanted')}>
					Pending
				</button>
			</div>
		</div>
	{/if}
	{#if filtersActive(filters)}
		<span class="tone-dim pb-0.5 text-xs tabular-nums">{shown} of {total}</span>
	{/if}
</div>
