<script lang="ts">
	import type { SortKey, SortState } from './board-view';

	let {
		label,
		col,
		sort,
		onsort
	}: {
		label: string;
		col: SortKey;
		sort: SortState;
		onsort: (key: SortKey) => void;
	} = $props();

	const active = $derived(sort.key === col);
</script>

<th
	class="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--bg-elevated)] px-3.5 py-2.5"
	aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
>
	<button
		type="button"
		class="inline-flex items-center gap-1 text-left hover:text-[var(--text)]"
		onclick={() => onsort(col)}
	>
		{label}
		{#if active}
			<span class="normal-case tracking-normal" aria-hidden="true">{sort.dir === 1 ? '↑' : '↓'}</span>
		{/if}
	</button>
</th>
