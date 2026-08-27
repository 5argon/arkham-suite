import type { CardCode } from '@5argon/arkham-kohaku';

import type { EvergreenZone } from '$lib/tool/evergreen-team/types';

export type DragSource =
	| {
			kind: 'collection';
			cardCode: CardCode;
			/**
			 * Class pickup mode: the cards this drag sweeps along on drop. The
			 * ghost only ever shows the grabbed card.
			 */
			classGroup?: CardCode[];
	  }
	| {
			kind: 'deck';
			deckIndex: number;
			zone: EvergreenZone;
			cardCode: CardCode;
			/**
			 * Class pickup mode: sweeping works inversely too - returning one
			 * card returns its whole class group from that zone.
			 */
			classGroup?: CardCode[];
	  };

export const DRAG_PREFIX = 'egtb:';
/**
 * Marker type so dragover handlers can tell our drags from stray text/file
 * drags; dataTransfer values are unreadable until drop, but types are not.
 */
export const DRAG_MIME = 'application/x-egtb';

/**
 * Central drag state. Eligibility highlights are driven by `active` (rune
 * state set on dragstart) because dataTransfer payloads cannot be read during
 * dragover; the payload is only parsed on drop as validation.
 */
export class EvergreenDnd {
	active = $state<DragSource | null>(null);
	private ghostCleanup: (() => void) | null = null;

	/**
	 * Marks the drag active and replaces the browser's default drag image with
	 * a stack of `copies` clones of the dragged stack's front card image,
	 * anchored at the exact grab point so the ghost sticks to the cursor
	 * (same clone-into-body technique as CardBlock's dragStartHandler).
	 */
	beginDrag(ev: DragEvent, source: DragSource, stackEl: HTMLElement, copies: number) {
		if (!ev.dataTransfer) return;
		ev.dataTransfer.setData('text/plain', DRAG_PREFIX + JSON.stringify(source));
		ev.dataTransfer.setData(DRAG_MIME, '1');
		ev.dataTransfer.effectAllowed = 'move';

		const images = stackEl.querySelectorAll('img');
		const frontImage = images[images.length - 1] as HTMLImageElement | undefined;
		// The stack's imgs are lazy-loaded; a cloned <img> would not have
		// painted yet when setDragImage snapshots. Drawing the already-decoded
		// element onto a canvas is synchronous, so the ghost is always visible.
		if (frontImage && frontImage.complete && frontImage.naturalWidth > 0) {
			const imageRect = frontImage.getBoundingClientRect();
			const width = Math.round(imageRect.width) || 72;
			const height = Math.round(imageRect.height) || 101;
			const sliver = Math.round(width * 0.13);
			const totalHeight = height + sliver * (copies - 1);
			const dpr = window.devicePixelRatio || 1;
			const canvas = document.createElement('canvas');
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(totalHeight * dpr);
			// Must be in-DOM and rendered (offscreen, never display:none) for
			// setDragImage to snapshot it.
			canvas.style.cssText = `position: fixed; top: -9999px; left: -9999px; width: ${width}px; height: ${totalHeight}px;`;
			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.scale(dpr, dpr);
				ctx.globalAlpha = 0.9;
				for (let i = 0; i < copies; i++) {
					ctx.save();
					if (i > 0) {
						ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
						ctx.shadowBlur = 4;
						ctx.shadowOffsetY = -3;
					}
					const y = i * sliver;
					ctx.beginPath();
					ctx.roundRect(0, y, width, height, 4);
					ctx.clip();
					ctx.drawImage(frontImage, 0, y, width, height);
					ctx.restore();
				}
			}
			document.body.appendChild(canvas);
			// Anchor the ghost at the grab point, clamped inside the ghost, so it
			// tracks the cursor exactly like the element the user picked up.
			const stackRect = stackEl.getBoundingClientRect();
			const offsetX = Math.min(Math.max(ev.clientX - stackRect.left, 0), width);
			const offsetY = Math.min(Math.max(ev.clientY - stackRect.top, 0), totalHeight);
			ev.dataTransfer.setDragImage(canvas, offsetX, offsetY);
			this.ghostCleanup = () => canvas.remove();
		}

		this.active = source;
	}

	/**
	 * Idempotent; called from drop, dragend, and a window-level dragend
	 * backstop (a source element that unmounts mid-drop never fires its own
	 * dragend).
	 */
	endDrag() {
		this.ghostCleanup?.();
		this.ghostCleanup = null;
		this.active = null;
	}

	static parsePayload(dt: DataTransfer | null): DragSource | null {
		if (!dt) return null;
		const raw = dt.getData('text/plain');
		if (!raw.startsWith(DRAG_PREFIX)) return null;
		try {
			const parsed = JSON.parse(raw.slice(DRAG_PREFIX.length));
			if (parsed.kind === 'collection' && typeof parsed.cardCode === 'string') {
				if (
					parsed.classGroup !== undefined &&
					!(
						Array.isArray(parsed.classGroup) &&
						parsed.classGroup.every((c: unknown) => typeof c === 'string')
					)
				) {
					delete parsed.classGroup;
				}
				return parsed as DragSource;
			}
			if (
				parsed.kind === 'deck' &&
				typeof parsed.cardCode === 'string' &&
				typeof parsed.deckIndex === 'number' &&
				(parsed.zone === 'main' || parsed.zone === 'side')
			) {
				if (
					parsed.classGroup !== undefined &&
					!(
						Array.isArray(parsed.classGroup) &&
						parsed.classGroup.every((c: unknown) => typeof c === 'string')
					)
				) {
					delete parsed.classGroup;
				}
				return parsed as DragSource;
			}
			return null;
		} catch {
			return null;
		}
	}
}
