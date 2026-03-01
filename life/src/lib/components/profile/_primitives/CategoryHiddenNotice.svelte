<!--
@component
Shown in place of the Cards / Investigators category content when the profile is in
"show only campaign categories" mode. Those categories are entirely deck-derived, so a
profile with no imported decks has nothing there. Normally unreachable — the home nav
drops these categories — this only surfaces on direct-URL access.
-->
<script lang="ts">
	import { BorderedContainer, HelpParagraph } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="mt-6">
	<BorderedContainer>
		<div class="p-8"><HelpParagraph>{m.framework_category_hidden()}</HelpParagraph></div>
	</BorderedContainer>
</div>
