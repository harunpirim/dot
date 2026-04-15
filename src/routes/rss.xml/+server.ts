
import { config } from '../../../moire.config';
import { getMemos } from '$lib/server/memos';

export const prerender = true;

export async function GET({ url }: { url: URL }) {
  const memos = await getMemos();
  const configUrl = config.url.replace(/\/$/, '');
  const siteUrl = url.origin && url.origin !== 'http://sveltekit-prerender' ? url.origin : configUrl;

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${ config.title }${ config.description ? ` | ${ config.description }` : '' }</title>
    <description>${ config.description }</description>
    <link>${ siteUrl }</link>
    <atom:link href="${ siteUrl }/rss.xml" rel="self" type="application/rss+xml"/>
    ${ memos
      .map(
        (memo) => `
      <item>
        <guid isPermaLink="true">${ siteUrl }/#${ memo.slug }</guid>
        <title>${ memo.slug }</title>
        <link>${ siteUrl }/#${ memo.slug }</link>
        <description><![CDATA[${ memo.content }]]></description>
        <pubDate>${ memo.date.toUTCString() }</pubDate>
      </item>
    `
      )
      .join('') }
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      'Cache-Control': 'max-age=0, s-maxage=3600',
      'Content-Type': 'application/xml'
    }
  });
}
