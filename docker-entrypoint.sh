#!/bin/sh
set -e

echo "Starting database initialization..."
npx prisma@6.2.1 migrate deploy

echo "Database initialized. Starting Next.js..."
exec node server.js
