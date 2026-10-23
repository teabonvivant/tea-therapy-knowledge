#!/bin/bash
# 建置並推到 GitHub Pages（gh-pages 分支）：https://teabonvivant.github.io/tea-therapy-knowledge/
set -e
cd "$(dirname "$0")/.."
scripts/local.sh
python3 scripts/check.py dist | tail -1 | grep -q '問題 0' || { echo '檢查未通過'; python3 scripts/check.py dist; exit 1; }
tmp=$(mktemp -d); cp -r dist/. "$tmp/"; touch "$tmp/.nojekyll"
cd "$tmp"; git init -q; git checkout -q -b gh-pages; git add -A; git -c user.name=zocomputer -c user.email=zocomputer@users.noreply.github.com commit -qm "publish $(date -u +%F' '%H:%M)"
git push -qf https://github.com/teabonvivant/tea-therapy-knowledge.git gh-pages
echo "已推送 gh-pages"; rm -rf "$tmp"
