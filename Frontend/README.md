# DuoDate - Frontend Client

DuoDate is a premium, modern, and interactive web application designed to help users team up with a best friend, create a shared duo profile, and discover other duos for amazing double dates.

This folder contains the **React** frontend. It is built on top of **Vite** to run quickly, uses **React Router** for pages, and uses **Vanilla CSS** for design and animations.

---

## Features Overview

### 1. Landing & Authentication
* **Hero Banner**: A beautiful dark theme homepage with smooth animations.
* **Smart Header**: Changes automatically when you log in (shows links to sign in or navigate the app).
* **Easy Sign Up & Sign In**: Fast login options that save your session to your browser (`localStorage`).

### 2. Profile Builder (ProfileMaker)
* **Photo Upload**: Add multiple profile photos easily.
* **Onboarding Steps**: Fill in your name, gender, birthday, and write a short bio about yourself.

### 3. Duo Invites & Status
* **Status Tracking**: Shows if you are Solo, waiting for a partner, or in an Active Duo.
* **Invite Friends**: Search for friends by username or phone number to invite them to your duo.
* **Invite Links**: Copy a link to invite friends.
* **Auto Update**: Updates the page automatically when a friend accepts your invite or leaves the duo.

### 4. Swipe Arena
* **Duo Cards**: View other duos on a single card showing names, ages, photos, and bios of both friends.
* **Photo Gallery**: Click left or right arrows on the card to see all photos of either member in the other duo.
* **Swipe Actions**: Smooth animations when swiping left to pass or right to like.
* **Match Score**: Shows how compatible you are with the other duo.

### 5. Interest Board
* **Who Likes Us**: See all duos that liked your duo profile. You can like them back to match instantly.
* **Our Likes**: See all duos you have liked and are waiting for.

### 6. Group Chat
* **Start Chat**: When both duos like each other, it is a match! Any member can send a request to start a chat.
* **4-Way Approval**: The chat room opens only when all 4 members accept the chat request.
* **Live Chat**: The chat updates every 3 seconds to show new messages.

---

## Tech Stack

* **React**: Core library for building the user interface.
* **Vite**: Tool to run and build the project quickly.
* **React Router**: Tool to navigate between pages.
* **React Icons**: Pack of icons used in the app.
* **CSS**: Styles for colors, layouts, and animations.

---

## 📂 Project Structure

```bash
DuoDate/Frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and local graphic elements
│   ├── Components/         # Modular UI components
│   │   ├── AboutSafety/    # Safety and community guidelines
│   │   ├── ChatView/       # Chat preview illustrations on landing
│   │   ├── CreateDuo/      # Main dashboard, swipe card deck, and invite system
│   │   ├── Discover/       # Landing page discover card previews
│   │   ├── DuoChatRoom/    # Inner group chatroom UI with messages list
│   │   ├── Footer/         # Page footer
│   │   ├── Header/         # Guest header for public page
│   │   ├── Hero/           # Public introduction banner
│   │   ├── HowItWorks/     # Educational guide panels
│   │   ├── MatchPopUp/     # Pop-up displayed when a double-match occurs
│   │   ├── NewHeader/      # Logged-in header for dashboard navigation
│   │   └── ProfileMaker/   # Onboarding profile setup wizard
│   ├── pages/              # Routed pages
│   │   ├── Home.jsx        # Root page (renders landing or dashboard depending on auth)
│   │   ├── SignIN/         # User Sign-in page
│   │   └── SignUp/         # User Registration page
│   ├── App.css             # Root styles
│   ├── App.jsx             # React router configuration and entry shell
│   ├── index.css           # Global theme variables, gradients, and scrollbars
│   └── main.jsx            # React client mount point
├── eslint.config.js        # Linting rules
├── index.html              # Core HTML structure
├── package.json            # Dependencies and script definitions
└── vite.config.js          # Vite compilation settings
```

---

## Getting Started

### 1. Requirements
Make sure you have **Node.js** installed on your computer.

### 2. Installation
Open your terminal, go to the `Frontend` folder, and run:
```bash
# Go to the frontend folder
cd DuoDate/Frontend

# Install all packages
npm install
```

### 3. Backend Setup
The frontend communicates with the backend at `http://localhost:3000`. 
* Make sure your backend server is running on **port 3000**.
* You can change the backend URL in components like `CreateDuo.jsx` or `ProfileMaking.jsx` if your backend is running elsewhere.

### 4. Running the App
Start the development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser to view the application.

### 5. Building for Production
To build the app for production:
```bash
npm run build
```
This creates a `dist` folder. To preview this build locally, run:
```bash
npm run preview
```
