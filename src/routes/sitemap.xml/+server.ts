import { config } from '../../../moire.config';
import { getMemos } from '$lib/server/memos';

export async function GET() {
  const memos = await getMemos();
  const headers = { 'Content-Type': 'application/xml' };
  const siteUrl = config.url.replace(/\/$/, '');

  const pages: { loc: string; priority: number; changefreq: string; lastmod?: Date }[] = [
    { loc: siteUrl, priority: 1.0, changefreq: 'daily' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${ pages
      .map(
        (page) => `
    <url>
        <loc>${page.loc }</loc>
        <changefreq>${ page.changefreq }</changefreq>
        <priority>${ page.priority }</priority>
        ${ page.lastmod ? `<lastmod>${ new Date(page.lastmod).toISOString() }</lastmod>` : '' }
    </url>`
      )
    .join('')}
</urlset>`;

  return new Response(sitemap, { headers });
}
