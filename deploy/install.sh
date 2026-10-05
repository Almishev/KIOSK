#!/usr/bin/env bash
# Installs the kiosk from Docker Hub (Linux server or macOS).
#
# Usage:
#   chmod +x install.sh
#   API_URL="http://192.168.80.120:8081" ./install.sh
#   API_URL="http://192.168.80.120:8081" KIOSK_PORT=8080 ./install.sh /opt/kiosk

set -euo pipefail

INSTALL_DIR="${1:-$(pwd)/kiosk}"
KIOSK_PORT="${KIOSK_PORT:-8080}"
DOCKER_IMAGE="${DOCKER_IMAGE:-antonalmishev/kiosk:latest}"
API_URL="${API_URL:-http://192.168.80.120:8081}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker не е намерен. Инсталирай Docker и опитай отново." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose не е наличен." >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"
echo "Инсталационна папка: $INSTALL_DIR"

cat > docker-compose.yml <<'YAML'
services:
  kiosk:
    image: ${DOCKER_IMAGE:-antonalmishev/kiosk:latest}
    restart: unless-stopped
    ports:
      - "${KIOSK_PORT:-8080}:80"
    environment:
      API_URL: ${API_URL:-http://192.168.80.120:8081}
YAML

cat > .env <<EOF
DOCKER_IMAGE=${DOCKER_IMAGE}
KIOSK_PORT=${KIOSK_PORT}
API_URL=${API_URL}
EOF

echo "Pull image..."
docker compose pull

echo "Start container..."
docker compose up -d

echo ""
echo "Готово!"
echo "Отвори: http://localhost:${KIOSK_PORT}"
echo "От таблет: http://<IP-НА-ТАЗИ-МАШИНА>:${KIOSK_PORT}"
echo "POS адрес: ${API_URL}"
echo "Папка: ${INSTALL_DIR}"
