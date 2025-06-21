# MedAI Deployment Guide

## Quick Deployment to Vercel

### Prerequisites

- Node.js installed
- Git repository
- Vercel account
- Environment variables uploaded to Vercel

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```powershell
.\deploy.ps1
```

### Option 2: Manual Deployment

1. **Install Vercel CLI** (if not already installed):

```powershell
npm install -g vercel
```

2. **Build the project locally**:

```powershell
npm run build
```

3. **Deploy to Vercel**:

```powershell
vercel --prod
```

### Option 3: GitHub Integration

1. **Push to GitHub**:

```powershell
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-deploy on every push

### Environment Variables

Make sure these are set in your Vercel project settings:

- `DATABASE_URL` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `OTP_BYPASS_ENABLED` - Set to `true` for development
- `OTP_BYPASS_CODE` - Your bypass code

### Build Configuration

The project is configured with:

- Build command: `npm run vercel-build`
- Install command: `npm install`
- Framework: Next.js
- Prisma client auto-generation

### Troubleshooting

1. **Build fails**: Check that all dependencies are installed and environment variables are set
2. **API routes timeout**: Increase function timeout in `vercel.json`
3. **Database connection issues**: Verify your MongoDB connection string

### Post-Deployment

1. Test all API endpoints
2. Verify authentication flow
3. Check database connectivity
4. Test PWA functionality

## Development Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Prisma client
npx prisma generate
```
