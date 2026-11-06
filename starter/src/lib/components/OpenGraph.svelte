<script lang="ts">
	import { siteOrigin, siteUrl } from '$lib/const';

	interface Props {
		title: string;
		description: string;
		/**
		 * Path under the site root, or a full URL for an image hosted elsewhere.
		 */
		image: string;
		url?: string;
		/**
		 * Declares `url` as the page's canonical address. Only for pages whose
		 * `url` is exactly their own path.
		 */
		canonical?: boolean;
		/**
		 * For a page with nothing worth finding yet.
		 */
		noindex?: boolean;
		author?: string;
		/**
		 * schema.org structured data.
		 */
		jsonLd?: object;
	}

	let { title, description, image, url, canonical = false, noindex = false, author, jsonLd }: Props =
		$props();

	const fullUrl = $derived(url ? `${siteOrigin}${url}` : siteOrigin);
	const fullImageUrl = $derived(/^https?:/.test(image) ? image : siteUrl(image));
	// Escaped so text inside the data can't close the script tag.
	const jsonLdText = $derived(jsonLd && JSON.stringify(jsonLd).replaceAll('<', '\\u003c'));
</script>

<svelte:head>
	<title>{title} | arkham-starter.com</title>
	<meta content={description} name="description" />
	{#if author}
		<meta content={author} name="author" />
	{/if}
	{#if canonical}
		<link href={fullUrl} rel="canonical" />
	{/if}
	{#if noindex}
		<meta content="noindex" name="robots" />
	{/if}
	{#if jsonLdText}
		<!-- eslint-disable-next-line svelte/no-at-html-tags, no-useless-escape -->
		{@html `<script type="application/ld+json">${jsonLdText}<\/script>`}
	{/if}

	<!-- Open Graph / Facebook -->
	<meta content="website" property="og:type" />
	<meta content="arkham-starter.com" property="og:site_name" />
	<meta content={fullUrl} property="og:url" />
	<meta content={title} property="og:title" />
	<meta content={description} property="og:description" />
	<meta content={fullImageUrl} property="og:image" />

	<!-- Twitter -->
	<meta content="summary_large_image" property="twitter:card" />
	<meta content={fullUrl} property="twitter:url" />
	<meta content={title} property="twitter:title" />
	<meta content={description} property="twitter:description" />
	<meta content={fullImageUrl} property="twitter:image" />
</svelte:head>
