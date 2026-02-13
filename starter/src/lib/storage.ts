/**
 * Local storage helper utilities for arkham-starter.com
 */

import { browser } from '$app/environment';

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
	THEME: 'arkham-starter-theme'
} as const;

/**
 * Get a value from local storage
 */
export function getFromStorage<T = string>(key: string, defaultValue: T): T {
	if (!browser) {
		return defaultValue;
	}

	try {
		const item = localStorage.getItem(key);
		if (item === null) {
			return defaultValue;
		}
		// Try to parse as JSON, fallback to string
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

/**
 * Save a value to local storage
 */
export function saveToStorage<T>(key: string, value: T): void {
	if (!browser) {
		return;
	}

	try {
		const serialized = typeof value === 'string' ? value : JSON.stringify(value);
		localStorage.setItem(key, serialized);
	} catch (error) {
		console.warn(`Failed to save item to localStorage: ${key}`, error);
	}
}

/**
 * Remove a value from local storage
 */
export function removeFromStorage(key: string): void {
	if (!browser) {
		return;
	}

	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.warn(`Failed to remove item from localStorage: ${key}`, error);
	}
}

/**
 * Clear all items from local storage
 */
export function clearStorage(): void {
	if (!browser) {
		return;
	}

	try {
		localStorage.clear();
	} catch (error) {
		console.warn('Failed to clear localStorage', error);
	}
}

/**
 * Theme-specific helper functions
 */
export const themeStorage = {
	get(): 'light' | 'dark' {
		return getFromStorage(STORAGE_KEYS.THEME, 'light') as 'light' | 'dark';
	},
	set(theme: 'light' | 'dark'): void {
		saveToStorage(STORAGE_KEYS.THEME, theme);
	}
};
