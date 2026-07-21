#!/usr/bin/env bash
# Valida .env.production o .env.staging antes del deploy
# Uso: validate-env.sh          → .env.production
#      STAGING=1 validate-env.sh → .env.staging (sin keys)
#      validate-env.sh --staging → .env.staging
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../" && pwd)"

if [[ "${1:-}" == "--staging" || "${STAGING:-}" == "1" ]]; then
  ENV_FILE="${ENV_FILE:-$ROOT/.env.staging}"
  MODE_LABEL="staging (pre-live, sin keys)"
else
  ENV_FILE="${ENV_FILE:-$ROOT/.env.production}"
  MODE_LABEL="production"
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [[ ! -f "$ENV_FILE" ]]; then
  echo "${RED}✗ No existe $ENV_FILE${NC}"
  echo "  Copia: cp deploy/.env.production.example .env.production"
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

errors=0
warnings=0

check_required() {
  local name="$1"
  local value="${2:-}"
  if [[ -z "$value" ]]; then
    echo "${RED}✗ REQUERIDO vacío: $name${NC}"
    errors=$((errors + 1))
  else
    echo "${GREEN}✓ $name${NC}"
  fi
}

check_optional() {
  local name="$1"
  local value="${2:-}"
  if [[ -z "$value" ]]; then
    echo "${YELLOW}○ opcional vacío: $name${NC}"
    warnings=$((warnings + 1))
  else
    echo "${GREEN}✓ $name${NC}"
  fi
}

echo "=== Waná — validación [$MODE_LABEL] $ENV_FILE ==="
echo ""

echo "--- Core ---"
check_required POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
check_required JWT_SECRET "$JWT_SECRET"
check_required NEXT_PUBLIC_SITE_URL "$NEXT_PUBLIC_SITE_URL"
check_required NEXT_PUBLIC_API_URL "$NEXT_PUBLIC_API_URL"
check_required CORS_ORIGIN "$CORS_ORIGIN"

if [[ "${JWT_SECRET:-}" != "" && ${#JWT_SECRET} -lt 32 ]]; then
  echo "${RED}✗ JWT_SECRET debe tener al menos 32 caracteres${NC}"
  errors=$((errors + 1))
fi

if [[ "${NEXT_PUBLIC_API_URL:-}" == *"/api/v1"* ]]; then
  echo "${RED}✗ NEXT_PUBLIC_API_URL no debe incluir /api/v1${NC}"
  errors=$((errors + 1))
fi

if [[ "${NEXT_PUBLIC_SITE_URL:-}" != https://* ]]; then
  echo "${YELLOW}○ NEXT_PUBLIC_SITE_URL no usa https (ok en staging)${NC}"
  warnings=$((warnings + 1))
fi

echo ""
echo "--- Pagos ---"
if [[ "${PAYMENTS_MODE:-}" == "live" ]]; then
  check_required BOLD_API_KEY "$BOLD_API_KEY"
  check_required BOLD_WEBHOOK_SECRET "$BOLD_WEBHOOK_SECRET"
  check_required STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
  check_required STRIPE_PUBLISHABLE_KEY "$STRIPE_PUBLISHABLE_KEY"
  check_required STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"
  check_required NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
elif [[ "${PAYMENTS_MODE:-}" == "mock" ]]; then
  echo "${GREEN}✓ PAYMENTS_MODE=mock (pre-live OK, sin keys)${NC}"
else
  echo "${YELLOW}○ PAYMENTS_MODE=${PAYMENTS_MODE:-unset}${NC}"
  warnings=$((warnings + 1))
fi

echo ""
echo "--- Alegra ---"
if [[ "${PAYMENTS_MODE:-}" == "live" ]]; then
  check_required ALEGRA_EMAIL "$ALEGRA_EMAIL"
  check_required ALEGRA_API_TOKEN "$ALEGRA_API_TOKEN"
else
  check_optional ALEGRA_EMAIL "$ALEGRA_EMAIL"
  check_optional ALEGRA_API_TOKEN "$ALEGRA_API_TOKEN"
fi

echo ""
echo "--- Marketing ---"
check_optional RESEND_API_KEY "$RESEND_API_KEY"
check_optional NEXT_PUBLIC_GA_MEASUREMENT_ID "$NEXT_PUBLIC_GA_MEASUREMENT_ID"

echo ""
echo "=== Resumen: $errors error(es), $warnings advertencia(s) ==="

if [[ $errors -gt 0 ]]; then
  exit 1
fi

exit 0
