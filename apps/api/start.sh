#!/bin/bash
# Wrapper script to load .env file before starting NestJS API

cd /home/ubuntu/poultryco/apps/api

# Load .env file if it exists (using set -a to export all variables)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Start the application
exec node dist/main.js

