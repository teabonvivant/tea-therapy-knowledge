// 〔1〕〔2,3〕→ 連到頁尾來源 #src-1
const RE = /〔(\d+(?:[,，、–-]\d+)*)〕/g;
function walk(node, parent) {
  if (node.type === 'text' && parent && parent.tagName !== 'a' && RE.test(node.value)) {
    RE.lastIndex = 0;
    const out = []; let last = 0, m;
    while ((m = RE.exec(node.value))) {
      if (m.index > last) out.push({ type: 'text', value: node.value.slice(last, m.index) });
      const first = m[1].split(/[,，、–-]/)[0];
      out.push({ type: 'element', tagName: 'a', properties: { href: `#src-${first}`, className: ['cite'] }, children: [{ type: 'text', value: `〔${m[1]}〕` }] });
      last = m.index + m[0].length;
    }
    if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
    return out;
  }
  if (node.children) node.children = node.children.flatMap((c) => walk(c, node) ?? [c]);
  return null;
}
export default () => (tree) => { walk(tree, null); };
