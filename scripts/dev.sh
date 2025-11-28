#!/bin/bash
# Frontend development
if [ "$1" = "frontend" ]; then
  pnpm -F frontend dev
  exit
fi

# Backend development
if [ "$1" = "backend" ]; then
  pnpm -F backend dev
  exit
fi

# Default: run both
echo "Starting both frontend and backend..."
pnpm dev
