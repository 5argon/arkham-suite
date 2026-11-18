<!-- @component Shown on a Cards / Investigators URL while "campaign categories only" hides them. -->
<script lang="ts">
	import { BorderedContainer, HelpParagraph } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="mt-6">
	<BorderedContainer>
		<div class="p-8"><HelpParagraph>{m.framework_category_hidden()}</HelpParagraph></div>
	</BorderedContainer>
</div>
