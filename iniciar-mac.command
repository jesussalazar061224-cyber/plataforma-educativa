#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Para usar AdaptiClass necesitas instalar Node.js (es gratis)."
  echo "  Descarga la versión LTS desde la página que se abrirá y vuelve a abrir este archivo."
  open "https://nodejs.org/es/download"
  read -p "  Pulsa Enter para cerrar..."
  exit 1
fi
[ -f .env ] || cp .env.example .env
node server.js --abrir
