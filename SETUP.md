# Med-AI - Healthcare Management System

A comprehensive healthcare management system built with Next.js, Prisma, and MongoDB, designed for both patients and health workers.

## Features

### Patient Features

- Patient registration with personal details
- Profile management with medical information
- Medical history tracking
- Emergency contact management

### Health Worker Features

- Professional registration with license verification
- Specialization and qualification management
- Patient record creation and management
- Dashboard for managing patients

### Authentication

- JWT-based authentication
- OTP verification (with bypass for development)
- Separate registration flows for patients and health workers

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT, bcryptjs
- **UI Components**: Radix UI, Lucide React

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb+srv://your-connection-string"
JWT_SECRET="your-super-secret-jwt-key"
OTP_BYPASS_ENABLED=true
OTP_BYPASS_CODE="123456"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test Database Connection

Visit `http://localhost:3000/api/health` to test database connectivity.

## API Endpoints

### Authentication

- `POST /api/auth/signup/patient` - Patient registration
- `POST /api/auth/signup/health-worker` - Health worker registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Health Check

- `GET /api/health` - Database connectivity check

## Database Schema

### User Model

- Basic user information (name, email, phone)
- User type (PATIENT or HEALTH_WORKER)
- Verification status

### Patient Model

- Personal information (DOB, gender, blood group)
- Medical history and allergies
- Emergency contact and address
- Medical records

### Health Worker Model

- Professional information (license, specialization)
- Experience and qualifications
- Hospital and department details
- Records created

### Medical Record Model

- Diagnosis and symptoms
- Treatment and medications
- Notes and attachments
- Related patient and health worker

## Development Notes

### OTP Bypass

- In development mode, OTP verification is bypassed
- Use OTP code `123456` for testing
- Disable by setting `OTP_BYPASS_ENABLED=false`

### Database

- MongoDB connection string should include database name
- Prisma automatically handles schema synchronization
- No manual migrations needed for MongoDB

## Usage

1. **Registration**:

   - Go to `/signup`
   - Choose between Patient or Health Worker
   - Fill in required information
   - Complete OTP verification (use 123456 in dev mode)

2. **Login**:

   - Go to `/login`
   - Enter email or phone number
   - System will find and authenticate user

3. **Profile Management**:
   - Go to `/profile`
   - View and edit personal information
   - See medical records (patients) or created records (health workers)

## Security Features

- JWT tokens for session management
- Password hashing (when implemented)
- Input validation and sanitization
- MongoDB injection protection via Prisma

## Future Enhancements

- Password-based authentication
- Real OTP service integration
- File upload for medical documents
- Advanced search and filtering
- Appointment scheduling
- Telemedicine features
- AI-powered diagnosis assistance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
