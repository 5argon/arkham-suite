<script context="module" lang="ts">
	const regex = new RegExp(/!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g);
</script>

<script lang="ts">
	export let raw: string;
	export let text: string;
	let url: string = '';
	$: {
		regex.lastIndex = 0;
		const result = regex.exec(raw);
		if (result !== null && result.length > 1) {
			const u = result[1];
			const subStart = u.indexOf('/image/documentation/');
			url = u.substring(subStart);
		}
	}
</script>

<div>
	<img alt={text} src={url} />
</div>

<style>
	div {
		display: flex;
		justify-content: center;
	}

	img {
		max-width: 600px;
		max-height: 400px;
		box-shadow: 1px 2px 3px 1px rgba(0, 0, 0, 0.2);
	}
</style>
