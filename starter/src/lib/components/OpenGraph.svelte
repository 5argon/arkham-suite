<script lang="ts">
	interface Props {
		title: string;
		description: string;
		image: string;
		url?: string;
	}

	let { title, description, image, url }: Props = $props();

	const canonicalUrl = 'https://arkham-starter.com';
	const fullUrl = $derived(url ? `${canonicalUrl}${url}` : canonicalUrl);
	const fullImageUrl = $derived(`${canonicalUrl}/${image}`);
</script>

<svelte:head>
	<title>{title} | Arkham Starter</title>
	<meta content={description} name="description" />

	<!-- Open Graph / Facebook -->
	<meta content="website" property="og:type" />
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
