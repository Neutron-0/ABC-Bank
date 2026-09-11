Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🏛️  Bharat Adaptive Banking - Monorepo Demo Runner" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Validating AI Contracts & Scenarios..." -ForegroundColor Yellow
python ai/intelligence/run.py --scenario normal
python ai/intelligence/run.py --scenario financial-stress
python ai/voice/run_voice.py --query "Pay Metro" --lang en

Write-Host "`n[2/3] Running Backend Contract Unit Tests..." -ForegroundColor Yellow
python apps/backend/tests/test_experience.py

Write-Host "`n[3/3] System Ready. To start FastAPI backend run:" -ForegroundColor Green
Write-Host "uvicorn apps.backend.app.main:app --host 0.0.0.0 --port 8000" -ForegroundColor White
