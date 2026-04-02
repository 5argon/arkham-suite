import { getContext, setContext, untrack } from 'svelte';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
	message: string;
	type: ToastType;
	/** Incremented each time toast is shown so the component can reset its animation */
	key: number;
	visible: boolean;
}

export class ToastContext {
	private _state = $state<ToastState | null>(null);
	private _timer: ReturnType<typeof setTimeout> | null = null;

	get state() {
		return this._state;
	}

	show(message: string, type: ToastType = 'info', durationMs = 3500) {
		// Clear any pending auto-dismiss
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}

		// untrack prevents reading _state from registering as a reactive dependency,
		// which would cause infinite loops when show() is called from a $effect.
		const prevKey = untrack(() => this._state?.key ?? 0);

		// Setting visible to false first then back triggers the animation reset
		this._state = { message, type, key: prevKey + 1, visible: true };

		this._timer = setTimeout(() => {
			const cur = untrack(() => this._state);
			if (cur) {
				this._state = { ...cur, visible: false };
			}
			this._timer = null;
		}, durationMs);
	}

	success(message: string, durationMs?: number) {
		this.show(message, 'success', durationMs);
	}

	error(message: string, durationMs?: number) {
		this.show(message, 'error', durationMs);
	}

	info(message: string, durationMs?: number) {
		this.show(message, 'info', durationMs);
	}

	dismiss() {
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
		const cur = untrack(() => this._state);
		if (cur) {
			this._state = { ...cur, visible: false };
		}
	}
}

const TOAST_CONTEXT_KEY = Symbol('toast');

export function createToastContext(): ToastContext {
	const ctx = new ToastContext();
	setContext(TOAST_CONTEXT_KEY, ctx);
	return ctx;
}

export function getToastContext(): ToastContext {
	const ctx = getContext<ToastContext>(TOAST_CONTEXT_KEY);
	if (!ctx) {
		throw new Error(
			'Toast context not found. Make sure <ToastHost> is mounted in your layout above this component.',
		);
	}
	return ctx;
}
