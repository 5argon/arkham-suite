import type { CardResolver } from '@5argon/arkham-kohaku';

export interface ToolbarEvents {
	onAddCardRow: () => void;
	onAddDividerRow: () => void;
	onClear: () => void;
	onExportMarkdown: (resolver: CardResolver) => void;
	onTabooToggle: (tabooOn: boolean) => void;
}
