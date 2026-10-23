import { getCollection } from 'astro:content';
import { u } from '../lib/site';
const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/〔[\d,，、–\-\s]+〕/g, '').replace(/^#+\s*(.+)$/gm, '$1。').replace(/[*>`]+/g, '').replace(/\s+/g, ' ');
export async function GET() {
  const out: any[] = [];
  const add = async (c: string, label: string) => {
    for (const e of await getCollection(c as any)) {
      const d: any = e.data;
      out.push({ u: u(`/${c}/${d.slug}/`), c: label, t: d.fullTitle ?? d.title, k: `${d.title} ${d.tcmName ?? ''} ${d.lede} ${d.answer ?? ''}`, b: strip(e.body ?? '').slice(0, 6000) });
    }
  };
  await add('conditions', '慢病專題'); await add('teas', '茶性'); await add('remedies', '茶方'); await add('safety', '安全');
  return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json' } });
}
