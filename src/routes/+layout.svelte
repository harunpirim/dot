<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$themes/global.css';

	import { config } from '../../moire.config';

	let { children } = $props();
	const siteUrl = config.url.replace(/\/$/, '');
	const socialImageUrl = `${siteUrl}/icon.svg`;
	const pageTitle = config.description ? `${config.title} | ${config.description}` : config.title;

	$effect(() => {
		document.body.classList.add(config.theme);
		return () => document.body.classList.remove(config.theme);
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={config.description} />
	<meta name="author" content={config.author} />
	<meta name="keywords" content={config.keywords} />
	<link rel="icon" href={favicon} />
  <link rel="canonical" href={siteUrl} />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={siteUrl} />
  <meta property="og:title" content={config.title} />
  <meta property="og:description" content={config.description} />
  <meta property="og:image" content={socialImageUrl} />

  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={siteUrl} />
  <meta property="twitter:title" content={config.title} />
  <meta property="twitter:description" content={config.description} />
  <meta property="twitter:image" content={socialImageUrl} />

</svelte:head>

{@render children()}
