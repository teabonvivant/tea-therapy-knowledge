export const srcLabel = (url: string) => {
  try {
    const x = new URL(url); const h = x.hostname.replace(/^www\./, '');
    const pm = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/); if (pm) return `PubMed ${pm[1]}`;
    const pmc = url.match(/(PMC\d+)/); if (pmc) return pmc[1];
    if (h === 'doi.org') return `DOI ${decodeURIComponent(x.pathname.slice(1))}`;
    if (h.endsWith('wikisource.org')) return `維基文庫：${decodeURIComponent(x.pathname.split('/').pop() || '')}`;
    return h;
  } catch { return '連結'; }
};
