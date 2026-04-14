<script lang="ts">
	interface Props {
		slug: string;
	}

	const { slug }: Props = $props();
</script>

<div class="mx-auto max-w-4xl px-4 py-6">
	<p>Precon page for: {slug}</p>
	<!-- Article content will go here -->
</div>
