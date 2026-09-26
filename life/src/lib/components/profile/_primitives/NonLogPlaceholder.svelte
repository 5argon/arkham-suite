<!-- @component Replaces a widget's body in log-only mode when all of it needs non-log data. -->
<script lang="ts">
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div
	class="text-primary-400 dark:text-primary-500 flex items-center gap-2 px-1 py-3 text-sm italic"
>
	<FaIcon icon={FaIconType.WidgetRequiresExtra} class="text-amber-500/70 dark:text-amber-400/70" />
	<span>{m.framework_non_log_needed()}</span>
</div>
