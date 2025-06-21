# Authentication System Updates

## Overview

The MedAI application now has a comprehensive authentication system with the following features:

## Login System

- **OTP Bypass Feature**: When `OTP_BYPASS_ENABLED=true` in `.env`, users can login with just their phone number
- **Development OTP**: Use `123456` as the OTP code for testing when bypass is disabled
- **Phone Number Login**: Users can login using their registered phone number
- **Automatic Token Management**: JWT tokens are automatically managed and stored

## Protected Routes

The following pages now require authentication:

- `/diagnosis` - AI Diagnosis page
- `/monitoring` - Health Monitoring page
- `/records` - Medical Records page
- `/profile` - User Profile page

## Navigation Features

- **Bottom Navigation**: Shows visual indicators for protected routes when user is not logged in
- **Top Navbar**:
  - Shows login/signup buttons when not authenticated
  - Shows user avatar and dropdown menu when authenticated
  - Mobile menu includes logout functionality
  - Improved text visibility in both light and dark modes

## Authentication Components

- **AuthGuard**: Wrapper component that protects pages requiring authentication
- **useAuth Hook**: Custom hook for managing authentication state
- **Login/Signup Flow**: Complete authentication flow with OTP verification

## Environment Configuration

```env
# OTP Settings (for development)
OTP_BYPASS_ENABLED=true
OTP_BYPASS_CODE="123456"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

## How It Works

1. User enters phone number on login page
2. If OTP bypass is enabled, user is immediately logged in
3. If OTP bypass is disabled, user receives OTP and must verify
4. After successful login, user can access all protected pages
5. Navigation automatically updates to show user status
6. Users can logout from both desktop and mobile menus

## Visual Indicators

- Locked pages show authentication required screen with login/signup buttons
- Bottom navigation shows orange indicator dots on protected routes when not logged in
- Mobile menu shows user status and provides easy logout access
- Navbar text is now properly visible in both light and dark themes
