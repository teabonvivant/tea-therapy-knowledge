(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 選單：打開時主內容、頁尾、姊妹站條設為 inert（鍵盤與讀屏都進不去），焦點放到第一個連結；Esc 關閉
  const tg = $('.nav-toggle');
  const behind = () => $$('main, footer, .family');
  const setMenu = (open) => {
    document.body.classList.toggle('nav-open', open);
    tg?.setAttribute('aria-expanded', open);
    tg?.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    behind().forEach((el) => (open && matchMedia('(max-width: 920px)').matches ? el.setAttribute('inert', '') : el.removeAttribute('inert')));
    // 選單以 visibility 過渡，剛打開時還未可聚焦，所以重試到成功為止
    const focusFirst = (n = 0) => { const a = $('.main-nav a'); a?.focus(); if (document.activeElement !== a && n < 24 && document.body.classList.contains('nav-open')) setTimeout(() => focusFirst(n + 1), 50); };
    if (open) focusFirst();
  };
  if (tg) tg.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); tg?.focus(); }
  });
  matchMedia('(min-width: 921px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  const head = $('.site-head');
  const onScroll = () => head?.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // 主視覺註線＋輕微視差
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
  const pimg = $('.plate img');
  if (pimg && !reduce) {
    let tk = false;
    addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { const y = Math.min(scrollY, 900); pimg.style.transform = `translateY(${y * 0.06}px) scale(${1 + y * 0.00004})`; tk = false; }); }, { passive: true });
  }

  // 進場
  const rv = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) rv.forEach((el) => el.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach((el) => io.observe(el));
  }

  // 目錄高亮
  const toc = $$('.toc a');
  if (toc.length) {
    const map = new Map(toc.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { toc.forEach((a) => a.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); }
    }), { rootMargin: '-20% 0px -70% 0px' });
    $$('.prose h2[id]').forEach((h) => io.observe(h));
  }

  // 茶性光譜
  const sp = $('[data-spectrum]');
  if (sp) {
    const data = JSON.parse($('#tea-data').textContent);
    const btns = $$('.stops button', sp);
    const liq = $('.cup .liquor', sp), nm = $('[data-name]', sp), tag = $('[data-tag]', sp), tx = $('[data-text]', sp), go = $('[data-go]', sp);
    const pick = (i) => {
      const t = data[i];
      btns.forEach((b, j) => b.setAttribute('aria-pressed', i === j));
      liq.setAttribute('fill', t.color); sp.style.setProperty('--glow', t.color); nm.textContent = t.title; tag.textContent = t.nature; tx.textContent = t.lede; go.href = t.href; go.querySelector('span').textContent = `讀${t.title}`;
    };
    btns.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    sp.addEventListener('keydown', (e) => {
      const cur = btns.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (cur + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length; pick(n); btns[n].focus(); }
    });
    pick(0);
  }

  // 篩選（可多組：data-filter="group"／"level"）
  const fls = $$('[data-filter]');
  if (fls.length) {
    const items = $$('[data-group]'), state = {};
    const apply = () => {
      let shown = 0;
      items.forEach((it) => {
        const ok = Object.entries(state).every(([k, v]) => v === '全部' || (k === 'level' ? +it.dataset.level >= +v : it.dataset[k] === v));
        it.hidden = !ok; if (ok) shown++;
      });
      const e = $('[data-empty]'); if (e) e.hidden = shown > 0;
    };
    fls.forEach((fl) => {
      const key = fl.dataset.filter || 'group'; state[key] = '全部';
      const chips = $$('.chip', fl);
      chips.forEach((c) => c.addEventListener('click', () => { chips.forEach((x) => x.setAttribute('aria-pressed', x === c)); state[key] = c.dataset.value; apply(); }));
    });
  }

  // 體質自我觀察
  const qz = $('[data-quiz]');
  if (qz) {
    const qs = $$('.quiz-q', qz), bar = $('.progress i', qz), out = $('.quiz-result', qz);
    const types = JSON.parse($('#type-data').textContent);
    const ans = new Map();
    const upd = () => { bar.style.width = `${(ans.size / qs.length) * 100}%`; $('[data-count]', qz).textContent = `第 ${Math.min(qs.length, (typeof cur === 'number' ? cur : 0) + 1)} 題 · 已答 ${ans.size}／${qs.length}`; $('[data-calc]', qz).disabled = ans.size < 9; };
    let cur = 0;
    const show = (i) => { cur = Math.max(0, Math.min(qs.length - 1, i)); qs.forEach((q, j) => q.classList.toggle('cur', j === cur)); $('[data-prev]', qz).disabled = cur === 0; upd(); };
    qs.forEach((q, i) => $$('button', q).forEach((b) => b.addEventListener('click', () => {
      $$('button', q).forEach((x) => x.setAttribute('aria-pressed', x === b));
      ans.set(i, b.dataset.v === '1'); upd();
      if (i < qs.length - 1) setTimeout(() => { show(i + 1); $('button', qs[i + 1]).focus(); }, 160); else calc();
    })));
    $('[data-prev]', qz).addEventListener('click', () => show(cur - 1));
    qz.addEventListener('keydown', (e) => { if (qz.classList.contains('done')) return; const k = e.key.toLowerCase(); if (k === 'y' || k === 'n') $$('button', qs[cur])[k === 'y' ? 0 : 1].click(); });
    show(0);
    const calc = () => {
      const score = {}, per = {};
      qs.forEach((q, i) => { per[q.dataset.type] = (per[q.dataset.type] || 0) + 1; if (ans.get(i)) score[q.dataset.type] = (score[q.dataset.type] || 0) + 1; });
      // 平和質只在自己 ≥ 2/3、其他各型都 ≤ 1/3 時才算勝出；答案互相矛盾（例如同時像平和質與偏頗體質、或四型以上偏高）時不給傾向
      const ids = Object.keys(per), strong = ids.filter((id) => (score[id] || 0) / per[id] >= 2 / 3);
      const contradictory = strong.length >= 4 || (strong.includes('balanced') && strong.length > 1);
      const balancedWins = (score.balanced || 0) / per.balanced >= 2 / 3 && ids.every((id) => id === 'balanced' || (score[id] || 0) / per[id] <= 1 / 3);
      const ranked = Object.entries(score).filter(([id]) => id !== 'balanced' || balancedWins).sort((x, y) => y[1] - x[1]);
      $$('.type').forEach((t) => t.classList.remove('hit'));
      const name = (id) => types.find((t) => t.id === id)?.name ?? id;
      let html;
      if (contradictory) html = '<p>你的答案互相矛盾：同時有好幾種傾向偏高，其中包括互相排斥的類型，所以看不出傾向。可以按平日的感覺再答一次，或直接閱讀下面九種體質的描述。</p>';
      else if (!ranked.length) html = '<p>你沒有看出明顯的傾向。可以按平日的感覺再答一次，或直接閱讀下面九種體質的描述。注意：平和質的題目是正面描述，全答「否」不代表沒有傾向。</p>';
      else {
        const top = ranked.filter(([, s], k) => k < 2 || s === ranked[1]?.[1]).slice(0, 3);
        top.forEach(([id]) => $(`#t-${id}`)?.classList.add('hit'));
        const bars = top.map(([id, s]) => `<div><a href="#t-${id}">${name(id)}</a><i><b style="width:${(s / per[id]) * 100}%"></b></i><span class="num">${s}/${per[id]}</span></div>`).join('');
        const mixed = top.length > 1 && top[0][1] === top[1][1];
        html = `<p class="serif" style="font-size:22px;margin-bottom:4px">${mixed ? '幾種傾向相近' : `較接近：${name(top[0][0])}`}</p><div class="score">${bars}</div><p class="muted" style="margin:10px 0 0">這只是按你剛才的回答粗略歸類，不是診斷。體質可以兼夾，也會隨年齡、季節、作息改變；想認真了解，請找註冊中醫師面診。</p><p style="margin:16px 0 0"><a class="btn btn-solid" data-today-link href="${qz.dataset.today}?c=${top[0][0]}">按這個傾向配今天的茶 <span class="arr" aria-hidden="true">→</span></a></p>`;
      }
      out.innerHTML = html + '<p style="margin:16px 0 0"><button type="button" class="btn" data-again>重新作答</button></p>'; out.classList.add('show'); qz.classList.add('done'); out.focus(); out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      $('[data-again]', out).addEventListener('click', () => { ans.clear(); $$('.quiz-q button', qz).forEach((b) => b.setAttribute('aria-pressed', false)); qz.classList.remove('done'); out.classList.remove('show'); upd(); show(0); $('button', qs[0]).focus(); });
    };
    $('[data-calc]', qz).addEventListener('click', calc);
    upd();
  }

  // 搜尋（索引欄位：t 標題、k 關鍵字、b 內文、a 別名／同義詞；比對不分大小寫）
  const sb = $('[data-search]');
  if (sb) {
    const inp = $('input', sb), res = $('.results'), st = $('[data-status]');
    let idx = null;
    const load = async () => idx ??= (await (await fetch(sb.dataset.search)).json()).map((d) => ({ ...d, a: d.a ?? '', _t: d.t.toLowerCase(), _k: (d.k + ' ' + (d.a ?? '')).toLowerCase(), _b: d.b.toLowerCase() }));
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const run = async () => {
      const q = inp.value.trim(); await load();
      if (!q) { res.innerHTML = ''; st.textContent = ''; return; }
      const terms = q.toLowerCase().split(/\s+/);
      const hits = idx.map((d) => ({ d, s: terms.reduce((n, t) => n + (d._t.includes(t) ? 5 : 0) + (d._k.includes(t) ? 3 : 0) + (d._b.includes(t) ? 1 : 0), 0) }))
        .filter((h) => terms.every((t) => (h.d._t + h.d._k + h.d._b).includes(t))).sort((a, b) => b.s - a.s).slice(0, 30);
      st.textContent = hits.length ? `找到 ${hits.length} 項` : '找不到。試試中文或英文名稱，例如「血糖」「咖啡因」「華法林」「warfarin」「熟普」。';
      const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const markAll = (s) => { let o = esc(s); terms.forEach((t) => { o = o.replace(new RegExp(reEsc(esc(t)), 'gi'), (m) => `<mark>${m}</mark>`); }); return o; };
      const snip = (d) => {
        const i = d._b.indexOf(terms[0]);
        if (i < 0) return d.k.slice(0, 90);
        let a = Math.max(d.b.lastIndexOf('。', i), d.b.lastIndexOf('？', i), d.b.lastIndexOf('！', i)) + 1;
        if (i - a > 60) a = i - 30;
        let e = d.b.indexOf('。', i + terms[0].length); e = e < 0 || e - a > 120 ? a + 110 : e + 1;
        return d.b.slice(a, e).trim();
      };
      res.innerHTML = hits.map(({ d }) => `<li><a href="${d.u}"><small>${esc(d.c)}</small><b>${markAll(d.t)}</b><span class="sn">${markAll(snip(d))}</span></a></li>`).join('');
    };
    let tm; inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 160); });
    const q0 = new URLSearchParams(location.search).get('q'); if (q0) { inp.value = q0; run(); }
  }
})();
