# 🚨 Embraze - Emergency Alert System

<div align="center">

![Embraze Logo](public/paperplane.json)

**Your Safety, Our Priority**

A real-time emergency alert system that connects communities during critical situations. Help is just a tap away, wherever you are.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)

[Live Demo](https://embraze.vercel.app) • [Report Bug](https://github.com/ojiitaborada-lab/Embraze/issues) • [Request Feature](https://github.com/ojiitaborada-lab/Embraze/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

Embraze is a modern, real-time emergency alert system designed to help communities stay connected during critical situations. With instant notifications, location tracking, and family circle features, Embraze ensures help is always within reach.

### Why Embraze?

- **Instant Alerts**: Send emergency notifications to your network with one tap
- **Real-time Location**: Share your location automatically during emergencies
- **Family Circles**: Create private groups to keep your loved ones safe
- **Community Support**: Connect with nearby users who can provide immediate assistance
- **Cross-platform**: Responsive design works seamlessly on mobile and desktop

---

## ✨ Features

### 🚨 Emergency Alerts
- One-tap emergency button with visual feedback
- Automatic location sharing with reverse geocoding
- Real-time notification system
- Alert status tracking (active/stopped)

### 👨‍👩‍👧‍👦 Family Circles
- Create and join family groups with invite codes
- View family members' locations in real-time
- Track online/offline status
- Manage family members (creator privileges)

### 🗺️ Interactive Map
- Real-time location tracking with MapLibre GL
- Custom markers for different alert types
- Route navigation to emergency locations
- Distance and duration calculations
- Smooth animations and transitions

### 🔔 Smart Notifications
- Unread notification badges
- Notification history with timestamps
- Quick actions (view location, navigate)
- Clear all functionality

### 📱 Responsive Design
- Mobile-first approach with bottom navigation
- Smooth drawer animations for mobile
- Compact, minimalist UI
- Touch-optimized interactions
- Dark/Light mode support

### 🔐 Security & Privacy
- Firebase Authentication (Google Sign-In)
- Secure Firestore database rules
- Environment variable protection
- HTTPS enforcement

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite 6.0** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **MapLibre GL** - Interactive maps
- **Lottie** - Smooth animations

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - Real-time database
- **Firebase Cloud Functions** - Serverless backend
- **Mailgun/Resend** - Email notifications

### Additional Libraries
- **Font Awesome** - Icon library
- **React Map GL** - React wrapper for MapLibre
- **@lottiefiles/react-lottie-player** - Animation player

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- MapTiler API key (for maps)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ojiitaborada-lab/Embraze.git
   cd Embraze/Embraze-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_MAPTILER_API_KEY=your_maptiler_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google Sign-In)
3. Create a Firestore database
4. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Set up Cloud Functions (optional):
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

Detailed setup guides:
- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Firestore Rules Guide](FIRESTORE_RULES_SETUP.md)
- [Mailgun Setup Guide](MAILGUN_SETUP.md)
- [Resend Setup Guide](RESEND_SETUP.md)

### MapTiler Setup

1. Sign up at [maptiler.com](https://www.maptiler.com/)
2. Create an API key
3. Add the key to your `.env` file

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Click Deploy

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

---

## 📁 Project Structure

```
Embraze-react/
├── public/              # Static assets
│   ├── Loading.json     # Loading animation
│   ├── circle line.json # Empty state animation
│   └── ...
├── src/
│   ├── assets/          # Lottie animations
│   ├── components/      # React components
│   │   ├── FamilyPanel.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── MapView.jsx
│   │   ├── NotificationPanel.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── SidePanel.jsx
│   │   └── Toast.jsx
│   ├── firebase/        # Firebase configuration
│   │   ├── auth.js
│   │   ├── config.js
│   │   └── services.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── functions/           # Firebase Cloud Functions
├── .env                 # Environment variables (not in repo)
├── firebase.json        # Firebase configuration
├── firestore.rules      # Firestore security rules
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Keep components small and focused
- Use Tailwind CSS for styling

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Contact

**Orlando Taborada Jr.**

- GitHub: [@ojiitaborada-lab](https://github.com/ojiitaborada-lab)
- Project Link: [https://github.com/ojiitaborada-lab/Embraze](https://github.com/ojiitaborada-lab/Embraze)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [MapLibre GL](https://maplibre.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)
- [Lottie Files](https://lottiefiles.com/)
- [Vercel](https://vercel.com/)

---

<div align="center">

**Made with ❤️ for safer communities**

⭐ Star this repo if you find it helpful!

</div>
