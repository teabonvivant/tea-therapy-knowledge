#!/bin/bash
# shot.sh <路徑> <寬> <高> <輸出.png> [full]
agent-browser set viewport $2 $3 >/dev/null 2>&1
agent-browser open "http://localhost:4801/tea-therapy-knowledge$1" >/dev/null 2>&1
sleep ${WAIT:-2.5}; agent-browser eval "document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))" >/dev/null 2>&1; sleep 0.9
if [ "$5" = full ]; then agent-browser screenshot --full "$4" >/dev/null 2>&1; else agent-browser screenshot "$4" >/dev/null 2>&1; fi
