#!/usr/bin/env bash
set -e

echo "===================================================="
echo "🏛️  Bharat Adaptive Banking - Monorepo Demo Runner"
echo "===================================================="

echo "[1/3] Validating AI Contracts & Scenarios..."
python ai/intelligence/run.py --scenario normal
python ai/intelligence/run.py --scenario financial-stress
python ai/voice/run_voice.py --query "Pay Metro" --lang en

echo "[2/3] Running Backend Contract Unit Tests..."
python apps/backend/tests/test_experience.py

echo "[3/3] Starting Backend Server on http://localhost:8000..."
uvicorn apps.backend.app.main:app --host 0.0.0.0 --port 8000
