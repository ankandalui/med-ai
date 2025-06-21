#!/usr/bin/env pwsh

# MedAI Deployment Script for Vercel
# Run this script to deploy your app to Vercel

Write-Host "🚀 Starting MedAI deployment process..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found. Initializing..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: MedAI healthcare app"
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Found uncommitted changes. Committing..." -ForegroundColor Yellow
    git add .
    $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
    if (-not $commitMessage) {
        $commitMessage = "Update: Ready for deployment"
    }
    git commit -m $commitMessage
}

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Build the project locally to check for errors
Write-Host "🔨 Building project locally..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix the errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Local build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "📋 Don't forget to:" -ForegroundColor Yellow
Write-Host "   1. Set your environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "   2. Configure your domain if needed" -ForegroundColor White
Write-Host "   3. Check the deployment logs for any issues" -ForegroundColor White
