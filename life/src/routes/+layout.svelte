<script lang="ts">
	import { HeaderBar, Body } from '@5argon/arkham-life-ui';
	import '../app.css';
	let { children } = $props();
</script>

<Body theme="dark">
	<HeaderBar siteName="arkham.life" />
	{@render children()}
</Body>
