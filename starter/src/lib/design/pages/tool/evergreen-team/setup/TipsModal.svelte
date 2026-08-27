<script lang="ts">
	import { Modal, TextParagraph } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
	}
	const { isOpen, onClose }: Prop = $props();
</script>

<Modal {isOpen} {onClose} maxWidth="md" title={m.tool_evergreen_team_tips_title()}>
	<div class="flex flex-col gap-3">
		<TextParagraph>
			{m.tool_evergreen_team_tips_1()}
		</TextParagraph>
		<TextParagraph>
			{m.tool_evergreen_team_tips_2()}
		</TextParagraph>
		<TextParagraph>
			{m.tool_evergreen_team_tips_3()}
		</TextParagraph>
	</div>
</Modal>
