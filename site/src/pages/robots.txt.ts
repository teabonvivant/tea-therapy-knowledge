import { u } from '../lib/site';
export const GET = ({ site }: any) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(u('/sitemap.xml'), site).href}\n`);
