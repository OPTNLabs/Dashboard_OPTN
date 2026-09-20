#!/bin/sh
# Restart contract for the live preview. Idempotent: probe 8080, start only if down.
set -eu
PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$PROJECT_ROOT"

# Local development may provide ignored secrets/config in these files. The
# checked-in examples intentionally contain no credentials or mnemonic.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi
if [ -f .env.development.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.development.local
  set +a
fi

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi

# Detach the child from the launcher shell so the preview survives the
# instance command returning to its caller.
nohup npm run dev >/tmp/optn-dev.log 2>&1 </dev/null &
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
  fi
  sleep 0.5
done
exit 0
