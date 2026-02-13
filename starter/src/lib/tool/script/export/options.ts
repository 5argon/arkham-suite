export function binaryToUrlString(a: Uint8Array): string {
	const c = btoa(String.fromCharCode(...a));
	return encodeURIComponent(c);
}

export function base64ToBinary(a: string): Uint8Array {
	const b = new Uint8Array(
		atob(a)
			.split('')
			.map(function (c) {
				return c.charCodeAt(0);
			})
	);
	return b;
}
