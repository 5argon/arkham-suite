/**
 * Shared keyboard navigation logic for dropdown components.
 * Handles Arrow keys, Enter, and Escape.
 */

export interface KeyboardNavigationConfig<T> {
	/**
	 * Current selected index.
	 */
	selectedIndex: number;

	/**
	 * Array of items for navigation bounds.
	 */
	items: T[];

	/**
	 * Whether the popup is currently visible.
	 */
	isPopupVisible: boolean;

	/**
	 * Callback when selected index changes (Arrow Up/Down).
	 */
	onIndexChange: (newIndex: number) => void;

	/**
	 * Callback when Enter is pressed on selected item.
	 */
	onSelect: (item: T) => void;

	/**
	 * Callback when Escape is pressed.
	 */
	onEscape: () => void;
}

/**
 * Creates a keyboard event handler for dropdown navigation.
 * @returns A function that handles KeyboardEvent for dropdown navigation.
 */
export function createKeyboardNavigationHandler<T>(
	config: KeyboardNavigationConfig<T>
): (e: KeyboardEvent) => void {
	return (e: KeyboardEvent) => {
		if (!config.isPopupVisible) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const newIndex = Math.min(config.selectedIndex + 1, config.items.length - 1);
			config.onIndexChange(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(config.selectedIndex - 1, 0);
			config.onIndexChange(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (config.items[config.selectedIndex]) {
				config.onSelect(config.items[config.selectedIndex]);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			config.onEscape();
		}
	};
}
