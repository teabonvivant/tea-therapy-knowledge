(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 選單
  const tg = $('.nav-toggle');
  if (tg) tg.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    tg.setAttribute('aria-expanded', open);
    tg.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { document.body.classList.remove('nav-open'); tg?.setAttribute('aria-expanded', false); tg?.focus(); }
  });
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
      const ranked = Object.entries(score).sort((x, y) => y[1] - x[1]);
      $$('.type').forEach((t) => t.classList.remove('hit'));
      const name = (id) => types.find((t) => t.id === id)?.name ?? id;
      let html;
      if (!ranked.length) html = '<p>你沒有答「是」的題目，未能看出傾向。可以按平日的感覺再答一次，或直接閱讀下面九種體質的描述。</p>';
      else {
        const top = ranked.filter(([, s], k) => k < 2 || s === ranked[1]?.[1]).slice(0, 3);
        top.forEach(([id]) => $(`#t-${id}`)?.classList.add('hit'));
        const bars = top.map(([id, s]) => `<div><a href="#t-${id}">${name(id)}</a><i><b style="width:${(s / per[id]) * 100}%"></b></i><span class="num">${s}/${per[id]}</span></div>`).join('');
        const mixed = top.length > 1 && top[0][1] === top[1][1];
        html = `<p class="serif" style="font-size:22px;margin-bottom:4px">${mixed ? '幾種傾向相近' : `較接近：${name(top[0][0])}`}</p><div class="score">${bars}</div><p class="muted" style="margin:10px 0 0">這只是按你剛才的回答粗略歸類，不是診斷。體質可以兼夾，也會隨年齡、季節、作息改變；想認真了解，請找註冊中醫師面診。</p>`;
        setTimeout(() => $(`#t-${top[0][0]}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 900);
      }
      out.innerHTML = html + '<p style="margin:16px 0 0"><button type="button" class="btn" data-again>重新作答</button></p>'; out.classList.add('show'); qz.classList.add('done'); out.focus();
      $('[data-again]', out).addEventListener('click', () => { ans.clear(); $$('.quiz-q button', qz).forEach((b) => b.setAttribute('aria-pressed', false)); qz.classList.remove('done'); out.classList.remove('show'); upd(); show(0); $('button', qs[0]).focus(); });
    };
    $('[data-calc]', qz).addEventListener('click', calc);
    upd();
  }

  // 咖啡因計算器
  const cc = $('[data-calc-caf]');
  if (cc) {
    const rows = $$('.calc-row[data-mg]', cc), other = $('.calc-other', cc), kg = $('.calc-kg', cc);
    const total = $('[data-total]', cc), bar = $('.gauge i', cc), lim = $('.gauge .lim', cc), limL = $('[data-limlabel]', cc), msg = $('[data-msg]', cc);
    const n = new Map(rows.map((r) => [r, 0]));
    const limit = () => { const w = $('input[name=who]:checked', cc).value; return w === 'adult' ? 400 : w === 'preg' ? 200 : Math.round(3 * Math.min(100, Math.max(10, +kg.value || 40))); };
    const draw = () => {
      let t = Math.max(0, +other.value || 0); rows.forEach((r) => (t += n.get(r) * +r.dataset.mg));
      const L = limit(), scale = Math.max(L * 1.5, t * 1.1);
      total.textContent = t; bar.style.width = `${Math.min(100, (t / scale) * 100)}%`; bar.classList.toggle('over', t > L);
      lim.style.left = `${(L / scale) * 100}%`; limL.textContent = `上限 ${L}`;
      msg.textContent = t === 0 ? '用左邊的「＋」加入今天飲過的每一杯。' : t > L ? `已超過參考上限約 ${t - L} 毫克。明天可以先減去份量最大的那一杯，或把茶泡淡一點。` : t >= L * 0.8 ? `接近參考上限，還有約 ${L - t} 毫克。下午之後宜改飲不含咖啡因的飲品。` : `在參考上限之內，還有約 ${L - t} 毫克。`;
    };
    rows.forEach((r) => $$('button', r).forEach((b) => b.addEventListener('click', () => { const v = Math.max(0, Math.min(20, n.get(r) + +b.dataset.d)); n.set(r, v); $('output', r).textContent = v; draw(); })));
    [other, kg, ...$$('input[name=who]', cc)].forEach((el) => el.addEventListener('input', draw));
    draw();
  }

  // 搜尋
  const sb = $('[data-search]');
  if (sb) {
    const inp = $('input', sb), res = $('.results'), st = $('[data-status]');
    let idx = null;
    const load = async () => idx ??= await (await fetch(sb.dataset.search)).json();
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const run = async () => {
      const q = inp.value.trim(); await load();
      if (!q) { res.innerHTML = ''; st.textContent = ''; return; }
      const terms = q.split(/\s+/);
      const hits = idx.map((d) => ({ d, s: terms.reduce((n, t) => n + (d.t.includes(t) ? 5 : 0) + (d.k.includes(t) ? 3 : 0) + (d.b.includes(t) ? 1 : 0), 0) }))
        .filter((h) => terms.every((t) => (h.d.t + h.d.k + h.d.b).includes(t))).sort((a, b) => b.s - a.s).slice(0, 30);
      st.textContent = hits.length ? `找到 ${hits.length} 項` : '找不到，試試別的字眼，例如「血糖」「咖啡因」「熟普」。';
      const mark = (s) => terms.reduce((h, t) => h.split(esc(t)).join(`<mark>${esc(t)}</mark>`), esc(s));
      const snip = (d) => {
        const i = d.b.indexOf(terms[0]);
        if (i < 0) return d.k.slice(0, 90);
        let a = Math.max(d.b.lastIndexOf('。', i), d.b.lastIndexOf('？', i), d.b.lastIndexOf('！', i)) + 1;
        if (i - a > 60) a = i - 30;
        let e = d.b.indexOf('。', i + terms[0].length); e = e < 0 || e - a > 120 ? a + 110 : e + 1;
        return d.b.slice(a, e).trim();
      };
      res.innerHTML = hits.map(({ d }) => `<li><a href="${d.u}"><small>${esc(d.c)}</small><b>${mark(d.t)}</b><span class="sn">${mark(snip(d))}</span></a></li>`).join('');
    };
    let tm; inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 160); });
    const q0 = new URLSearchParams(location.search).get('q'); if (q0) { inp.value = q0; run(); }
  }
})();
