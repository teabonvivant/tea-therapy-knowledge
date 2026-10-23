# raw PNG → public/img/*.webp（統一紙色：輕微暖調、去偏白）
import glob, os
from PIL import Image, ImageOps, ImageEnhance
RAW = '../_work/img/raw'; OUT = 'public/img'
os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(f'{RAW}/*.png')):
    n = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert('RGB')
    im = ImageEnhance.Contrast(im).enhance(1.03)
    for tag, w in (('l', min(1200, im.width)), ('s', 640)):
        h = round(im.height * w / im.width)
        out = f'{OUT}/{n}-{tag}.webp'
        if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(f): continue
        im.resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=82, method=6)
    print(n)
