#!/bin/sh
set -e

echo "=== Nexora Digital Web Platform (Docker Container) ==="
echo "Node Environment: ${NODE_ENV:-production}"
echo "Database Target:  ${DATABASE_URL:-file:/app/prisma/dev.db}"

# Ensure prisma directory permissions
mkdir -p /app/prisma
chmod 777 /app/prisma || true

echo "Starting Next.js Server on port ${PORT:-3000}..."
exec node server.js
