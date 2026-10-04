<script lang="ts">
	import { addressCaption } from '$lib/address';
	import BrandMark from '$lib/BrandMark.svelte';
	import { copyText } from '$lib/copy-text';
	import type { Snippet } from 'svelte';

	let {
		hostname,
		addresses,
		deck = false,
		children
	}: {
		hostname: string;
		addresses: string[];
		deck?: boolean;
		children?: Snippet;
	} = $props();

	let copied = $state<string | null>(null);
	let copiedTimer = $state<ReturnType<typeof setTimeout> | null>(null);

	async function copy(value: string) {
		if (!(await copyText(value))) return;
		if (copiedTimer) clearTimeout(copiedTimer);
		copied = value;
		copiedTimer = setTimeout(() => {
			copied = null;
		}, 1200);
	}
</script>

<header class="slip-header hud-frame">
	<div class="ident">
		<span class="brand">
			<BrandMark class="h-10 w-auto" />
			{#if deck}
				<span class="slip-word">Deck</span>
			{:else}
				<span class="slip-lockup" aria-label="LocalSlip">
					<span class="local">local</span>
					<span class="slip">SLIP</span>
				</span>
			{/if}
		</span>
		<button type="button" class="copy host" onclick={() => copy(hostname)}>
			{copied === hostname ? 'Copied' : hostname}
		</button>
		{#each addresses as addr}
			<span class="dot" aria-hidden="true">·</span>
			<button type="button" class="copy addrs" onclick={() => copy(addr)}>
				{copied === addr ? 'Copied' : addressCaption(addr)}
			</button>
		{/each}
		{#if children}
			<span class="dot" aria-hidden="true">·</span>
			<span class="meta">
				{@render children()}
			</span>
		{/if}
	</div>
</header>
