#!/usr/bin/env bash
# Submit one or more UtilityHub URLs to IndexNow (Bing/Yandex instant discovery).
# Key file lives at public/<KEY>.txt and is served at https://www.theutilityhub.online/<KEY>.txt
# Usage: ./scripts/indexnow-submit.sh <url1> [url2 ...]
#   or:  ./scripts/indexnow-submit.sh --file <file-with-one-url-per-line>
set -euo pipefail
KEY="75489bd8555eadeed2c29016a74b14d4"
HOST="www.theutilityhub.online"

URLS=()
if [ "${1:-}" = "--file" ]; then
  mapfile -t URLS < "$2"
else
  URLS=("$@")
fi
if [ "${#URLS[@]}" -eq 0 ]; then
  echo "usage: $0 <url...> | $0 --file <urls.txt>" >&2
  exit 1
fi

JSON_URLS=$(printf '%s\n' "${URLS[@]}" | python3 -c 'import json,sys; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')
curl -s -o /tmp/indexnow-resp.txt -w "HTTP %{http_code}\n" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\": \"$HOST\", \"key\": \"$KEY\", \"urlList\": $JSON_URLS}"
cat /tmp/indexnow-resp.txt; echo
echo "Submitted ${#URLS[@]} URL(s) to IndexNow."
