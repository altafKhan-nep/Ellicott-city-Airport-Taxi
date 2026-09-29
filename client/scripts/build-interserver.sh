#!/usr/bin/env bash
#
# Build the client and package it for upload to Interserver shared hosting.
#
#   ./scripts/build-interserver.sh https://api.example.com
#
# VITE_API_URL is inlined by Vite AT BUILD TIME, so it must be passed here — it
# cannot be set on the server afterwards. Changing the API host means
# re-running this script and re-uploading.
#
# Output: client/dist-interserver.zip  — upload, unzip into public_html/.

set -euo pipefail

API_URL="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
OUT="$ROOT/dist-interserver.zip"

if [ -z "$API_URL" ]; then
  echo "error: pass the API origin, e.g." >&2
  echo "  ./scripts/build-interserver.sh https://ellicott-taxi-api.onrender.com" >&2
  echo "" >&2
  echo "If the API is served from the same host under /api, pass:" >&2
  echo "  ./scripts/build-interserver.sh https://ellicottcityairporttaxi.com" >&2
  exit 1
fi

# Reject a value that is clearly not an absolute origin — a relative path or a
# trailing /api would produce a broken app at runtime, not a build error.
case "$API_URL" in
  https://*|http://*) ;;
  *) echo "error: API_URL must start with http:// or https:// (got '$API_URL')" >&2; exit 1 ;;
esac
if [ "${API_URL%/}" != "$API_URL" ]; then
  echo "error: API_URL must not have a trailing slash (got '$API_URL')" >&2; exit 1
fi

echo "==> building client with VITE_API_URL=$API_URL"
cd "$ROOT"
VITE_API_URL="$API_URL" npm run build

echo "==> verifying the build"
[ -f "$DIST/index.html" ] || { echo "error: dist/index.html missing" >&2; exit 1; }
[ -f "$DIST/.htaccess" ] || {
  echo "error: dist/.htaccess missing — the SPA deep links will 404." >&2
  echo "       Is client/public/.htaccess still present?" >&2
  exit 1
}

# Fail loudly if the API URL did not make it into the bundle.
if ! grep -rqF "$API_URL" "$DIST/assets"; then
  echo "warning: '$API_URL' not found in dist/assets — the client may still" >&2
  echo "         be pointing at a stale API. Check dist/assets/*.js." >&2
fi

echo "==> packaging"
rm -f "$OUT"
( cd "$DIST" && zip -rq "$OUT" . )

echo
echo "Built: $OUT  ($(du -h "$OUT" | cut -f1))"
echo
echo "Upload steps:"
echo "  1. cPanel -> File Manager -> public_html"
echo "  2. upload $OUT, then Extract it"
echo "  3. confirm public_html/.htaccess exists and public_html/index.html is at the root"
echo "  4. cPanel -> Domains -> force HTTPS redirect ON (after the cert is issued)"
echo "  5. set CLIENT_ORIGIN on the API to https://ellicottcityairporttaxi.com"
