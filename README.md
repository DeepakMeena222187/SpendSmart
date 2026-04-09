<<<<<<< HEAD
# SpendSmart — Expense Tracker

React.js + Firebase Auth + Firestore + Netlify CI/CD

## Tech Stack
- Frontend: React.js (Vite), CSS Modules, Recharts
- Backend/DB: Firebase Firestore (real-time NoSQL)
- Auth: Firebase Authentication (Google Sign-In)
- Deployment: Netlify with GitHub CI/CD

## Setup — 8 steps

### 1. Install
```bash
npm install
```

### 2. Create Firebase project
Go to https://console.firebase.google.com → Add Project → Web App → copy the config object.

### 3. Paste config into src/firebase.js
Replace all YOUR_* placeholders with your actual values.

### 4. Enable Google Sign-In
Firebase Console → Authentication → Google → Enable → Save

### 5. Create Firestore database
Firebase Console → Firestore → Create database → Test mode → asia-south1

Paste these security rules (Firestore → Rules tab):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create:      if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

### 6. Create composite index
Run the app once (npm run dev), open the browser console, click the Firebase index link in the error → auto-creates the index. Wait 1-2 min.

### 7. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 8. Deploy to Netlify
```bash
npm run build
git init && git add . && git commit -m "feat: expense tracker"
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```
Then: Netlify → New site from Git → Build: `npm run build` → Publish: `dist`

## Features
- Google login / logout
- Add expense: title, amount, category, date
- Delete with confirmation
- Filter by month
- Summary cards (total, count, top category, avg)
- Donut chart by category
- Real-time Firestore sync
- Mobile responsive
=======
“Track every rupee. Understand your habits. Spend smarter.”

# SpendSmart
A modern, personal finance management web app designed to help users track expenses, analyze spending patterns, and stay within budget — all with a clean and minimal UI.  This project focuses on simplicity, performance, and privacy, ensuring that users can manage their finances without relying on cloud storage or external services.

⚡ Key Features
📊 Interactive Dashboard
Monthly overview with total spending, transactions, and top categories
Clean visual insights using charts and graphs
💸 Expense Tracking
Add, categorize, and manage daily expenses
Instant updates to spending analytics
📈 Data Visualization
Daily spending trends
Category-wise breakdown (pie charts)
Monthly comparison
🎯 Budget Monitoring
Set monthly budgets
Real-time alerts when exceeding limits
🌙 Modern UI/UX
Dark mode optimized
Minimal, distraction-free interface
Smooth and responsive design
🔒 Privacy First
Fully offline — no data leaves your device
No ads, no tracking
🛠️ Tech Stack
Frontend: React.js / Vite
Styling: Tailwind CSS / Custom CSS
Charts: Chart.js / Recharts (whichever you used)
State Management: React Hooks / Context API
Storage: LocalStorage (offline persistence)
🎯 Purpose of This Project

This project was built to:

Practice real-world frontend development
Implement data visualization and state management
Create a usable product, not just a demo
>>>>>>> 31dbad0ffeb3542ce42e74cb14847b52a68211f3
