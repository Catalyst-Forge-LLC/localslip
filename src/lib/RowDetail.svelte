<script lang="ts">
	import { rowDetailFields } from '$lib/row-detail';
	import type { BoardRow } from '$lib/types';

	let { row, peek }: { row: BoardRow; peek: string } = $props();
	const fields = $derived(rowDetailFields(row));
	const log = $derived(row.logTail ?? null);
</script>

<dl class="m-0 grid grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-x-7 gap-y-2.5">
	{#each fields as field}
		<div class={field.wide || field.label === 'Notes' ? 'min-w-0 sm:col-span-2' : 'min-w-0'}>
			<dt class="text-[0.68rem] tracking-wide uppercase">{field.label}</dt>
			<dd class="mt-1 {field.warn ? (field.label === 'Recipe health' ? 'tone-alarm' : 'tone-wait') : ''} {field.wrap ? 'break-all font-mono text-[0.78rem] leading-snug' : ''}">{field.value}</dd>
		</div>
	{/each}
	<div class="col-span-full min-w-0">
		<dt class="text-[0.68rem] tracking-wide uppercase">HTTP</dt>
		<dd class="tone-live mt-1">{peek}</dd>
	</div>
	{#if log}
		<div class="col-span-full min-w-0">
			<dt class="text-[0.68rem] tracking-wide uppercase">Log</dt>
			{#if log.text}
				<dd class="mt-1">
					<pre class="tone-dim m-0 max-h-56 overflow-auto whitespace-pre-wrap break-all text-[0.78rem] leading-snug">{log.text}</pre>
				</dd>
			{:else}
				<dd class="tone-dim mt-1">{log.preview}</dd>
			{/if}
		</div>
	{/if}
</dl>
