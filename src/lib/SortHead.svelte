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

<th aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
	<button type="button" onclick={() => onsort(col)}>
		{label}
		{#if active}
			<span aria-hidden="true">{sort.dir === 1 ? '↑' : '↓'}</span>
		{/if}
	</button>
</th>
