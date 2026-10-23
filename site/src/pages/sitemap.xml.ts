import { getCollection } from 'astro:content';
import { u } from '../lib/site';
export async function GET({ site }: any) {
  const p = ['/', '/conditions/', '/teas/', '/constitution/', '/remedies/', '/safety/', '/method/', '/classics/', '/about/', '/sources/', '/search/'];
  for (const c of ['conditions', 'teas', 'remedies', 'safety']) for (const e of await getCollection(c as any)) p.push(`/${c}/${(e.data as any).slug}/`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${p.map((x) => `<url><loc>${new URL(u(x), site).href}</loc></url>`).join('')}</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml' } });
}
