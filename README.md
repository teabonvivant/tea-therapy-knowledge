# 茶療知識庫（tea-therapy-knowledge）

中醫茶療 × 實證科學的靜態網站，唐老師茶網站系列（姊妹站：普洱茶知識庫、六大茶知識庫）。

- 預覽：https://teabonvivant.github.io/tea-therapy-knowledge/ （`noindex`，正式公開前要拿走 `Base.astro` 的 `noindex` 預設值）
- 技術：Astro 7.4 靜態輸出；標題字體昭源宋體（`fonts-src/`，OFL）按頁切子集；正文用系統字體。
- 內容：`site/src/content/`（conditions 16、teas 7、remedies 10、safety 6，Markdown＋frontmatter，格式見 `_plan/內容規格.md`）；`site/src/data/constitutions.json`（九種體質＋自我觀察題）、`classics.json`（源流時間線）、`mol-*.svg`（RDKit 生成的分子圖，暫未用）。
- 引用：正文寫 `〔n〕`，由 `src/lib/rehype-cite.mjs` 連到頁尾第 n 條來源。
- 插圖：Codex（gpt-6.1-sol）生成的本草圖，原圖在 `_work/img/raw/`（不入 git），`_work/img/jobs.tsv`＋`runq.sh` 重生；`site/scripts/images.py` 轉成 `public/img/*-l|s.webp`。
- 指令（在 `site/`）：`scripts/local.sh` 本機建置並放到 http://localhost:4801/tea-therapy-knowledge/ （要先在 /tmp/srv 開 `python3 -m http.server 4801`）；`python3 scripts/check.py dist` 檢查連結／錨點／禁用語；`scripts/publish.sh` 建置＋檢查＋推 `gh-pages`。
- 合規：香港《不良醫藥廣告條例》（第 231 章）備忘在 `_plan/合規備忘-第231章.md`；不可寫成茶能預防或治療疾病，不可在健康頁推介產品或課程。
- 審閱狀態：內容由編輯按公開文獻整理，待註冊中醫師、營養師、醫生審閱；寫作與審核記錄在 `_team_runs/`（不入 git）。
