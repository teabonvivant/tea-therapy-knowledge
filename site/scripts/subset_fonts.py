#!/usr/bin/env python3
"""建置後字體處理：按每頁實際用字，把標題字體（昭源宋體 Medium，OFL）切成小型 woff2，並寫入該頁 <head>。
正文用系統字體，所以每頁字體傳輸只有幾 KB 至數十 KB。
用法：python3 -I scripts/subset_fonts.py <dist> [--font fonts-src/ChironSungHK-M-hk.ttf]
需要：pip install fonttools brotli
"""
import argparse, hashlib, io, os, re, sys
from html.parser import HTMLParser
from fontTools import subset
from fontTools.ttLib import TTFont

ap = argparse.ArgumentParser()
ap.add_argument('dist'); ap.add_argument('--base', default=os.environ.get('BASE', '/tea-therapy-knowledge'))
ap.add_argument('--font', default=os.path.join(os.path.dirname(__file__), '..', 'fonts-src', 'ChironSungHK-M-hk.ttf'))
a = ap.parse_args()
BASE = a.base.rstrip('/')
FAMILY = 'TeaSerif'
HEADINGS = {'h1', 'h2', 'h3', 'h4'}
SERIF_CLASSES = {'wordmark', 'serif', 'num', 'tcm-name'}
SERIF_DESC = [('prose', 'blockquote')]
ALWAYS = ''.join(chr(c) for c in range(0x20, 0x7F)) + '，。、；：？！「」『』（）《》·…％'

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []  # (tag, classes, serif?)
        self.text = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'template'):
            self.skip += 1
        if tag in ('br', 'img', 'meta', 'link', 'input', 'hr', 'path', 'ellipse', 'source'):
            return
        cls = set((dict(attrs).get('class') or '').split())
        ancestors = set().union(*[s[1] for s in self.stack]) if self.stack else set()
        serif = tag in HEADINGS or bool(cls & SERIF_CLASSES) or any(ac in ancestors and tag == t for ac, t in SERIF_DESC)
        inherited = bool(self.stack) and bool(self.stack[-1][2])
        self.stack.append((tag, cls, bool(serif) or inherited))
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'template'):
            self.skip = max(0, self.skip - 1)
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break
    def handle_data(self, data):
        if self.skip or not self.stack:
            return
        if self.stack[-1][2]:
            self.text.append(data)

cache = {}
src = TTFont(a.font)
def make(chars: str) -> str:
    h = hashlib.sha1(chars.encode()).hexdigest()[:10]
    name = f'h-{h}.woff2'
    path = os.path.join(a.dist, 'fonts', name)
    if h in cache:
        return name
    os.makedirs(os.path.dirname(path), exist_ok=True)
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['kern', 'locl', 'vert', 'vrt2']; opts.name_IDs = [0, 1, 2, 13, 14]; opts.notdef_outline = True; opts.hinting = False
    f = TTFont(a.font)
    s = subset.Subsetter(opts); s.populate(text=chars); s.subset(f)
    f.flavor = 'woff2'; f.save(path)
    cache[h] = os.path.getsize(path)
    return name

total = n = 0
for root, _, files in os.walk(a.dist):
    for fn in files:
        if not fn.endswith('.html'):
            continue
        p = os.path.join(root, fn)
        html = open(p, encoding='utf-8').read()
        parser = P(); parser.feed(html)
        chars = ''.join(sorted(set(''.join(parser.text) + ALWAYS) - set(' \n\t\r')))
        chars = ''.join(c for c in chars if ord(c) > 0x20)
        name = make(chars + ' ')
        url = f'{BASE}/fonts/{name}'
        inject = (f'<link rel="preload" href="{url}" as="font" type="font/woff2" crossorigin>'
                  f'<style>@font-face{{font-family:{FAMILY};src:url({url}) format("woff2");font-weight:500;font-display:swap}}</style>')
        html = html.replace('</head>', inject + '</head>', 1)
        open(p, 'w', encoding='utf-8').write(html)
        n += 1
        total += cache[name.split('-')[1].split('.')[0]]
print(f'字體處理完成：{n} 頁，{len(cache)} 個子集，平均每頁 {total // max(n,1) / 1024:.1f} KB，最大 {max(cache.values()) / 1024:.1f} KB')
