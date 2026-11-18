<!--
@component
An in-content button/link for docs — wraps the ui `Button` (whose `onClick` accepts a URL string).
Use inside a doc:
  <script>import { FaIconType } from '@5argon/arkham-life-ui'</script>
  <DocButton href="/database" label="Save your database" icon={FaIconType.Export} />
-->
<script lang="ts">
	import { Button, type FaIconType } from '@5argon/arkham-life-ui';

	let { href, label, icon }: { href: string; label: string; icon?: FaIconType } = $props();
</script>

<div class="my-4">
	<Button {label} {icon} onClick={href} />
</div>
