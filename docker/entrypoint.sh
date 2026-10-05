#!/bin/sh
set -eu

API_URL="${API_URL:-http://192.168.80.120:8081}"
API_URL=$(printf '%s' "$API_URL" | sed 's:/*$::')
ESCAPED=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')

printf '{"apiUrl":"%s"}\n' "$ESCAPED" > /usr/share/nginx/html/config.json

exec nginx -g 'daemon off;'
