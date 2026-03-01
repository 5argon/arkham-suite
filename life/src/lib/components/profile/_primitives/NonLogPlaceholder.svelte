<!--
@component
The body shown in place of a fully non-log widget (`nonLog: 'full'`) when the profile
is in Log-only mode (global, per-campaign, or this widget's own "Ignore non-log data"
toggle). The widget's card frame/header is kept — only the body is replaced — signalling
that this widget needs data BEYOND the campaign log (the Extra tab or imported decks),
which a log-only player can never provide.
-->
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
