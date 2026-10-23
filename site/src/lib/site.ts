export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (p = '/') => `${BASE}${p.startsWith('/') ? p : '/' + p}`;
export const SITE_NAME = '茶療知識庫';
export const GROUPS = ['代謝', '心血管', '腦與情緒', '消化', '骨與泌尿', '細胞與腫瘤'] as const;
export const LEVEL = { 4: '強', 3: '中', 2: '弱', 1: '不足' } as Record<number, string>;
export const LEVEL_DESC: Record<number, string> = {
  4: '多個隨機對照試驗的薈萃分析結果一致，效果方向清楚。',
  3: '大型前瞻性世代研究結果一致，或試驗有效但效果細小。',
  2: '研究數量少、結果不一致，或只見於部分人群。',
  1: '主要來自細胞或動物實驗，未有可靠人體證據。',
};
export const NAV = [
  { href: '/conditions/', label: '慢病專題' },
  { href: '/teas/', label: '茶性' },
  { href: '/constitution/', label: '體質' },
  { href: '/remedies/', label: '茶方' },
  { href: '/safety/', label: '安全' },
  { href: '/method/', label: '讀研究' },
  { href: '/search/', label: '搜尋' },
];
export const FAMILY = [
  { href: 'https://teabonvivant.github.io/tang-wei-tea/', label: '唐老師' },
  { href: 'https://teabonvivant.github.io/tang-wei-tea/courses/', label: '茶藝課程' },
  { href: 'https://teabonvivant.github.io/puer-tea-knowledge/', label: '普洱茶知識庫' },
  { href: 'https://teabonvivant.github.io/six-tea-knowledge/', label: '六大茶知識庫' },
];
export const LIQUOR: Record<string, string> = {
  代謝: 'var(--l-oolong)', 心血管: 'var(--l-black)', 腦與情緒: 'var(--l-green)', 消化: 'var(--l-white)', 骨與泌尿: 'var(--l-yellow)', 細胞與腫瘤: 'var(--l-dark)',
};
export const maxLevel = (ev: { level: number }[]) => Math.max(0, ...ev.map((e) => e.level));
export const fmtDate = (d?: Date) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '');
