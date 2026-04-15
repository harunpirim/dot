<script lang="ts">
    import type { PageData } from './$types';
    import { config } from '../../moire.config';
    
    let { data }: { data: PageData } = $props();
    let ThemeComponent = $state<any>(null);
    const siteUrl = config.url.replace(/\/$/, '');

    // __MOIRE_THEME__ is replaced at build time by Vite define (from moire.config.ts)
    // Only the matching branch survives dead-code elimination
    let loader: () => Promise<any>;
    if (__MOIRE_THEME__ === 'receipt') {
        loader = () => import('$themes/receipt/index.svelte');
    } else if (__MOIRE_THEME__ === 'cyberpunk') {
        loader = () => import('$themes/cyberpunk/index.svelte');
    } else if (__MOIRE_THEME__ === 'academic') {
        loader = () => import('$themes/academic/index.svelte');
    } else if (__MOIRE_THEME__ === 'bento') {
        loader = () => import('$themes/bento/index.svelte');
    } else if (__MOIRE_THEME__ === 'pixel') {
        loader = () => import('$themes/pixel/index.svelte');
    } else if (__MOIRE_THEME__ === 'classic') {
        loader = () => import('$themes/classic/index.svelte');
    } else {
        loader = () => import('$themes/receipt/index.svelte');
    }
    
    loader().then(module => {
        ThemeComponent = module.default;
    });

    const schema = $derived({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": config.title,
        "description": config.description,
        "url": siteUrl,
        "author": {
            "@type": "Person",
            "name": config.author
        },
        "blogPost": data.memos.map(memo => ({
            "@type": "BlogPosting",
            "headline": memo.slug, // Using slug as headline since there's no title
            "datePublished": memo.date instanceof Date ? memo.date.toISOString() : memo.date,
            "url": `${siteUrl}/#${memo.slug}`,
            "articleBody": memo.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...', // Strip HTML for summary
            "keywords": memo.tags.join(', ')
        }))
    });
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

{#if ThemeComponent}
    <ThemeComponent {data} {config} />
{:else}
    <!-- Simple loading state to avoid flash -->
    <div class="min-h-screen flex items-center justify-center">Loading...</div>
{/if}
