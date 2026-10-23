#!/bin/bash
# 本機建置＋放到 http://localhost:4801/tea-therapy-knowledge/
set -e
cd "$(dirname "$0")/.."
python3 scripts/images.py >/dev/null
npx astro build 2>&1 | grep -E "error|Error|\[WARN\]|pages? built" || true
python3 -I scripts/subset_fonts.py dist | tail -1
rm -rf /tmp/srv/tea-therapy-knowledge && mkdir -p /tmp/srv && cp -r dist /tmp/srv/tea-therapy-knowledge
