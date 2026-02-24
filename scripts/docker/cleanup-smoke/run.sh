#!/usr/bin/env bash
set -euo pipefail

cd /repo

export OPENNEXUS_STATE_DIR="/tmp/opennexus-test"
export OPENNEXUS_CONFIG_PATH="${OPENNEXUS_STATE_DIR}/opennexus.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${OPENNEXUS_STATE_DIR}/credentials"
mkdir -p "${OPENNEXUS_STATE_DIR}/agents/main/sessions"
echo '{}' >"${OPENNEXUS_CONFIG_PATH}"
echo 'creds' >"${OPENNEXUS_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${OPENNEXUS_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm opennexus reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${OPENNEXUS_CONFIG_PATH}"
test ! -d "${OPENNEXUS_STATE_DIR}/credentials"
test ! -d "${OPENNEXUS_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${OPENNEXUS_STATE_DIR}/credentials"
echo '{}' >"${OPENNEXUS_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm opennexus uninstall --state --yes --non-interactive

test ! -d "${OPENNEXUS_STATE_DIR}"

echo "OK"
