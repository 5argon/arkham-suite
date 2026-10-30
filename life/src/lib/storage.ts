import { browser } from '$app/env';

const THEME_KEY = 'arkham-life-theme';

function getFromStorage<T = string>(key: string, defaultValue: T): T {
	if (!browser) return defaultValue;
	try {
		const item = localStorage.getItem(key);
		if (item === null) return defaultValue;
		try {
			return JSON.parse(item) as T;
		} catch {
			return item as T;
		}
	} catch (error) {
		console.warn(`Failed to get item from localStorage: ${key}`, error);
		return defaultValue;
	}
}

function saveToStorage<T>(key: string, value: T): void {
	if (!browser) return;
	try {
		localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
	} catch (error) {
		console.warn(`Failed to save item to localStorage: ${key}`, error);
	}
}

export const themeStorage = {
	get(): 'light' | 'dark' {
		return getFromStorage(THEME_KEY, 'light') as 'light' | 'dark';
	},
	set(theme: 'light' | 'dark'): void {
		saveToStorage(THEME_KEY, theme);
	}
};
