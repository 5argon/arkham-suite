<script lang="ts">
	import { Button, FaIconType, Modal, TextParagraph } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
	}
	const { isOpen, onClose }: Prop = $props();

	const ffgArticleUrl = 'https://www.fantasyflightgames.com/en/news/2026/2/12/ever-investigating/';
</script>

<Modal {isOpen} {onClose} maxWidth="lg" title={m.tool_evergreen_team_whats_evergreen()}>
	<div class="flex flex-col items-center gap-4">
		<img
			alt={m.tool_evergreen_team_whats_evergreen()}
			class="w-full max-w-[500px] rounded"
			src="/image/tool/evergreen-environment.webp"
		/>
		<TextParagraph>
			{m.tool_evergreen_team_whats_evergreen_text()}
		</TextParagraph>
		<Button
			icon={FaIconType.ExternalLink}
			label={m.tool_evergreen_team_whats_evergreen_link()}
			onClick={ffgArticleUrl}
		/>
	</div>
</Modal>
