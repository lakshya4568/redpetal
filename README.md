# Red Petal

Red Petal is a modern, privacy-focused women's health and period tracking application. It features a responsive React Native frontend built with Expo and a reliable Express.js backend.

## Features

- **Period Tracking**: Log cycles, symptoms, mood, and flow.
- **Calendar View**: Visual overview of past and predicted cycles.
- **Insights & Reports**: Advanced analytics on symptoms and cycle history.
- **Community Forum**: Connect with others anonymously.
- **Remedies**: Discover tips and natural remedies for common symptoms.
- **Find Doctors**: Locate healthcare professionals near you (Map integration).

## Tech Stack

- **Frontend**: React Native, Expo, React Navigation, React Native Reanimated.
- **Backend**: Node.js, Express.js.
- **Styling**: Custom Theme System.

## Project Structure

```
redpetal/
├── app/                  # Frontend: Expo Router app directory
│   ├── (tabs)/           # Main tab navigation screens
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific modules (Map, Reports, etc.)
│   └── utils/            # Shared utilities
├── assets/               # Frontend: Fonts and images
├── server/               # Backend: Express API server
│   ├── routes/           # API endpoints (auth, posts, log, etc.)
│   └── tests/            # Backend unit tests
└── services/             # Frontend: API integration and auth services
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn or pnpm
- Expo CLI

### Setup & Run

1. **Install Dependencies (Frontend & Backend)**

Run install from the root:

```sh
npm install
```

And for the backend:

```sh
cd server
npm install
cd ..
```

2. **Run Backend API**

```sh
cd server
npm start # or npm run dev
```

3. **Run Mobile App**

In a new terminal, from the root directory:

```sh
npm start
```

Use the Expo Go app on your phone to scan the QR code to run the app, or press `i`/`a` to run on the iOS/Android emulator.

## License

This project is proprietary and confidential.
