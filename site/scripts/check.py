# 建置後檢查：內部連結、圖片、頁內錨點、title/description、禁用語
import os, re, sys, html
from urllib.parse import urlparse, unquote
D = sys.argv[1] if len(sys.argv) > 1 else 'dist'; BASE = '/tea-therapy-knowledge'
bad = []; pages = 0
BANNED = ['先說三件事', '一是', '值得一提', '我認為', '不妨', '總而言之', '綜上所述', '冰箱', '咱們', '一下子', 'lorem']
for root, _, fs in os.walk(D):
    for f in fs:
        if not f.endswith('.html'): continue
        p = os.path.join(root, f); s = open(p, encoding='utf-8').read(); pages += 1
        rel = p[len(D):]
        ids = set(re.findall(r'\sid="([^"]+)"', s))
        if '<title>' not in s or 'name="description"' not in s: bad.append((rel, 'title/description'))
        if s.count('<h1') != 1 and '404' not in rel: bad.append((rel, f'h1 x{s.count("<h1")}'))
        for a in re.findall(r'(?:href|src)="([^"]+)"', s):
            a = html.unescape(a)
            if a.startswith('#'):
                if a[1:] and unquote(a[1:]) not in ids: bad.append((rel, 'anchor ' + a))
                continue
            u = urlparse(a)
            if u.scheme or a.startswith('//') or a.startswith('mailto:') or a.startswith('?'): continue
            path = unquote(u.path)
            if not path.startswith(BASE): bad.append((rel, 'base ' + a)); continue
            t = os.path.join(D, path[len(BASE):].lstrip('/'))
            if path.endswith('/'): t = os.path.join(t, 'index.html')
            if not os.path.exists(t): bad.append((rel, 'missing ' + a))
        text = re.sub(r'<[^>]+>', '', re.sub(r'<(script|style)[^>]*>.*?</\1>', '', s, flags=re.S))
        if '**' in text: bad.append((rel, 'markdown ** 外露'))
        for w in BANNED:
            if w in text and not (w == '一是' and re.search(r'一是(?!…)', text) and '二是' not in text): bad.append((rel, 'banned ' + w))
print(f'{pages} 頁')
for b in bad: print(*b)
print('問題', len(bad))
