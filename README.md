<div align="center">

# 💰 Moneta

**A modern, cloud-synced personal finance manager built with React, TypeScript, and Firebase.**

Track expenses, manage budgets, and get real insight into your spending habits — with offline support and real-time sync across devices.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-Build-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [Building for Android & iOS](#building-for-android--ios)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Developer](#developer)

---

## Overview

Moneta is an expense-tracking app designed for people who want more than a spreadsheet but don't want the bloat of a full banking app. It combines fast, quick-add expense logging with budget carry-over, recurring bill tracking, and cloud sync — so your data stays consistent whether you're on desktop, mobile, or offline.

## Features

**Expense Management**
Add, edit, delete, and search transactions. Filter by category, date range, or payment mode. Attach notes to any entry.

**Budgeting**
Set monthly and category-wise budgets with automatic carry-over of unused balance. Track savings goals, remaining balance, and daily spending pace.

**Recurring Expenses**
Manage subscriptions and weekly/monthly recurring payments with reminders and an upcoming-payments tracker.

**Quick Add**
One-tap shortcuts for frequent expenses (☕ Tea, 🍔 Lunch, 🚕 Cab, 🛒 Grocery) — fully customizable.

**Analytics & Reports**
Weekly/monthly overviews, spending trend charts, category distribution, and budget progress — exportable/importable as CSV.

**Cloud & Auth**
Firebase Authentication (Google, Email/Password), Firestore-backed real-time sync, and offline support so nothing's lost without a connection.

## Screenshots

| Dashboard | Analytics | Budget |
|---|---|---|
| _add image_ | _add image_ | _add image_ |

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend UI |
| TypeScript | Type safety |
| Vite | Build tooling |
| Firebase Auth | User authentication |
| Cloud Firestore | Database |
| Firebase Hosting | Deployment |
| Capacitor | Android & iOS packaging |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/ADARSH11aa/Moneta.git
cd Moneta

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication**, **Cloud Firestore**, and **Storage**
3. Create `src/firebase/firebase.ts` and add your Firebase config:

```ts
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

Can be deployed via **Firebase Hosting**, **Vercel**, or **Netlify**.

## Building for Android & iOS

```bash
npm install @capacitor/core @capacitor/cli
npx cap add android
npx cap add ios
```

## Project Structure

```
Moneta/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── firebase/
│   ├── services/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## Roadmap

- [ ] AI-powered spending insights
- [ ] OCR receipt scanner
- [ ] Multi-currency support
- [ ] Shared family wallet
- [ ] Push notifications & dark mode

<details>
<summary>Full backlog</summary>

- Biometric authentication
- Passkeys authentication
- Investment tracker & net worth dashboard
- Voice expense entry
- Home screen widgets
- PDF report export
- Expense category icons

</details>

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit: `git commit -m "Add new feature"`
4. Push: `git push origin feature/new-feature`
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for details.

## Developer

**Adarsh Sharma**
Computer Science Engineering (Cybersecurity)

Interested in software development, cybersecurity, cloud computing, and UI/UX design.

[GitHub](https://github.com/ADARSH11aa)

---

<div align="center">

⭐ **If you find this useful, consider starring the repo.**

</div>
