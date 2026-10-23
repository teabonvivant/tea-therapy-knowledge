#!/bin/bash
# 不用 agent-browser 的截圖：cshot.sh <路徑> <寬> <高> <輸出>
/usr/local/bin/chromium-nosandbox --headless=new --no-sandbox --hide-scrollbars --force-prefers-reduced-motion --window-size=$2,$3 --virtual-time-budget=4000 --screenshot="$4" "http://localhost:4801/tea-therapy-knowledge$1" >/dev/null 2>&1
