# Chikit-সা Project Overview

## 🎬 Demo Video (Autoplay)

<iframe width="560" height="315" src="https://www.youtube.com/embed/JwAlh-XVoWM?autoplay=1" title="YouTube video player" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

## 🚀 Project Summary

Chikit-সা is an AI-powered healthcare platform designed to revolutionize diagnosis, monitoring, and emergency response. It integrates modern web technologies, real-time patient monitoring, voice assistant features, and AI-driven symptom/skin disease prediction, providing a seamless experience for patients, health workers, and authorities.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js (React, App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Custom components, Lucide Icons, Shadcn UI
- **State Management:** React hooks, Context Providers
- **Internationalization:** `react-i18next`
- **PWA Support:** Service Worker, Manifest, PWAInstallToast, PWARegister
- **Voice Assistant:** Web Speech API, Lottie animations

### Backend

- **API Layer:** Next.js API routes (`/app/api/*`)
- **Database:** MongoDB (via Prisma ORM)
- **Authentication:** JWT-based, custom hooks
- **AI Integration:**
  - Symptom Prediction: Flask API ([symptoms-analyzer repo](https://github.com/ankandalui/symptoms-analyzer.git))
  - Skin Disease Prediction: Flask API ([Disease-model repo](https://github.com/ankandalui/Disease-model.git))
- **Emergency Handling:** Real-time emergency creation, notification, and monitoring

### DevOps & Deployment

- **Environment Management:** `.env` for secrets and API URLs
- **Deployment:** Vercel (for Next.js), Render/Heroku/Local for Flask APIs
- **Version Control:** Git

---

## 🏗️ Project Structure

```
chikit-sa/
│
├── app/                        # Next.js app directory
│   ├── api/                    # API routes (auth, emergency, health, etc.)
│   ├── diagnosis/              # Diagnosis UI
│   ├── disease-prediction/     # Skin disease prediction UI
│   ├── health-worker/          # Health worker dashboard, monitoring, records
│   ├── patient/                # Patient dashboard, records, reminders
│   ├── profile/                # User profile
│   ├── records/                # Medical records
│   ├── signup/                 # Signup pages
│   ├── symptom-prediction/     # Symptom prediction UI
│   └── ...                     # Other pages and layouts
│
├── components/                 # Reusable React components
│   ├── voice-assistant.tsx     # Voice assistant UI and logic
│   ├── ...                     # Navbars, buttons, language selector, etc.
│
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries (API config, auth, etc.)
├── prisma/                     # Prisma schema and migrations
├── public/                     # Static assets (icons, images, manifest, etc.)
├── skin/                       # Flask API for skin disease prediction
├── symptom/                    # Flask API for symptom prediction
├── types/                      # TypeScript types
├── utils/                      # Utility functions and providers
├── .env                        # Environment variables
├── package.json                # Project dependencies and scripts
└── README.md                   # Project documentation
```

---

## 🔄 Workflow

### 1. User Authentication

- Users (patients/health workers) sign up and log in.
- JWT tokens are used for session management.

### 2. Patient Monitoring

- Health workers can add, view, and monitor patients.
- Real-time status: stable, needs attention, critical.
- Emergency cases are highlighted and can be sent to hospital/authorities.

### 3. AI-Powered Symptom & Skin Disease Prediction

- Users input symptoms or upload skin images.
- Next.js API routes forward requests to Flask AI APIs.
- AI APIs return predictions, which are displayed in the UI.

### 4. Emergency Handling

- Emergency alerts can be created via the UI or voice assistant.
- Emergency data is stored in MongoDB via Prisma.
- Health workers are notified and can take action (send to hospital, update status).

### 5. Voice Assistant

- Users interact using voice commands (Web Speech API).
- Voice assistant can navigate, answer questions, and trigger emergency actions.
- Responses are spoken aloud and shown in the UI.

### 6. Internationalization & Accessibility

- Supports multiple languages (English, Hindi, Bengali).
- Responsive and accessible UI.

### 7. PWA Features

- Installable on mobile devices.
- Offline support via service worker.

---

## ⚡ How Everything Connects

- **Frontend (Next.js)** handles all user interactions, UI, and state.
- **API Routes** in Next.js act as a bridge between the frontend and backend services (Flask APIs, MongoDB).
- **Flask APIs** provide AI-powered predictions for symptoms and skin diseases.
- **Prisma ORM** manages MongoDB data for users, patients, emergencies, and monitoring.
- **Voice Assistant** enables hands-free operation and emergency handling.
- **PWA** ensures the app is installable and works offline.

---

## 📝 Environment Variables (`.env`)

- `DATABASE_URL` — MongoDB connection string for Prisma
- `JWT_SECRET` — Secret for JWT authentication
- `FLASK_API_URL` — URL for Flask AI APIs
- `GEMINI_API_KEY`, `LIGHTHOUSE_API_KEY` — API keys for external services

---

## 🧑‍💻 Development

- Start Next.js dev server:  
  `npm run dev`
- Start Flask APIs:  
  `cd skin && python app.py`  
  `cd symptom && python app.py`
- Environment variables are managed in `.env`
- Prisma schema changes:  
  `npx prisma generate` and `npx prisma migrate dev`

---

## 📦 Deployment

- Next.js app is deployed on Vercel.
- Flask APIs can be deployed on Render, Heroku, or any cloud provider.
- MongoDB is managed via Atlas or a cloud/local instance.

---

## 📚 Additional Notes

- All critical actions (emergency creation, patient status change) are logged and handled with user feedback.
- The project is modular, making it easy to extend with new AI models or features.

---

## ⚠️ Python AI APIs Deployment Note

> **Note:** The Python Flask APIs for symptom and skin disease prediction are currently **not deployed** because Render cannot load the trained models due to resource or compatibility issues. To run the full AI-powered features locally, you must clone and run the following repositories:
>
> - **Skin Disease Prediction:** [https://github.com/ankandalui/Disease-model.git](https://github.com/ankandalui/Disease-model.git)
> - **Symptom Prediction:** [https://github.com/ankandalui/symptoms-analyzer.git](https://github.com/ankandalui/symptoms-analyzer.git)
>
> After cloning, follow the instructions in each repo to set up the environment and run the Flask API (`python app.py`).
>
> Once running locally, the Next.js app will connect to these APIs for predictions.
