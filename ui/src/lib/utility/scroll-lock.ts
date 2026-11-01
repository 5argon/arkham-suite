import type { Attachment } from 'svelte/attachments';

let locks = 0;

/**
 * Attach to a full-screen overlay: the page behind it stops scrolling for as
 * long as the overlay is in the document. Stacked overlays share one lock.
 */
export const lockPageScroll: Attachment = () => {
	if (locks++ === 0) document.documentElement.style.overflow = 'hidden';
	return () => {
		if (--locks === 0) document.documentElement.style.overflow = '';
	};
};
