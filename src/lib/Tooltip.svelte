<script lang="ts">
	import { onMount } from 'svelte';
	import type { Instance, Placement } from 'tippy.js';

	function appendToBody(): HTMLElement {
		return document.body;
	}

	let {
		title,
		placement = 'top',
		delay = 80,
		children,
	}: {
		title: string;
		placement?: Placement;
		delay?: number | [number, number];
		children: import('svelte').Snippet;
	} = $props();

	let el: HTMLSpanElement | undefined;
	let instance = $state<Instance | null>(null);

	onMount(() => {
		let cancelled = false;
		let tip: Instance | null = null;
		void import('tippy.js').then(({ default: tippy }) => {
			if (cancelled || !el || !title.trim()) return;
			tip = tippy(el, {
				content: title,
				placement,
				delay,
				arrow: true,
				theme: 'berth',
				appendTo: appendToBody,
				zIndex: 80,
			});
			instance = tip;
		});
		return () => {
			cancelled = true;
			tip?.destroy();
			instance = null;
		};
	});

	$effect(() => {
		void title;
		instance?.setContent(title);
	});
</script>

<span class="contents">
	<span bind:this={el} class="inline-flex max-w-full">
		{@render children()}
	</span>
</span>
