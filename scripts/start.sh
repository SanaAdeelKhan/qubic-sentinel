#!/usr/bin/env bash
# Lightweight helper for local dev
export PORT=${PORT:-3000}
echo "Starting Qubic Sentinel Lite on port ${PORT}"
node src/server/index.js
