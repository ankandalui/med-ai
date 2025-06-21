# Symptom Prediction API Setup and Run Script for Windows

Write-Host "Installing Python dependencies..." -ForegroundColor Green
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "Starting Symptom Prediction API server on port 5001..." -ForegroundColor Yellow
    python app.py
} else {
    Write-Host "Failed to install dependencies. Please check your Python environment." -ForegroundColor Red
    exit 1
}
