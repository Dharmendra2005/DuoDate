# DuoDate

DuoDate is a premium, modern, and interactive web application designed to help users team up with a best friend, create a shared duo profile, and discover other duos for amazing duo dates. 

This repository contains both the client-side frontend and the server-side backend of the application.

---

## Project Structure

The project is split into two main components:

1. **[Frontend](file:///c:/Users/lenov/Desktop/NewJourney/DuoDate/Frontend/README.md)**: A client application built with **React** and **Vite** using **React Router** and clean, responsive **Vanilla CSS**.
ReadME file for Frontend Frontend_Process(**(file:///c:/Users/lenov/Desktop/NewJourney/DuoDate/Frontend/README.md)**)
2. **[Backend](file:///c:/Users/lenov/Desktop/NewJourney/DuoDate/Backend/README.md)**: A modular REST API built with **Flask** and **MongoDB** featuring automatic fallback support for offline/local testing.
ReadME file for Backend Backend_Process(**(file:///c:/Users/lenov/Desktop/NewJourney/DuoDate/Frontend/README.md)**)

For detailed setup instructions and lists of features, please refer to the respective README files in their folders.

---

## How It Works

* **Profile Onboarding**: Single users sign up and build their profile (photos, bio, questionnaire).
* **Duo Creation**: Users search for a friend on the platform to send an invite. Once accepted, they form an active Duo.
* **Match Arena**: Active duos swipe on other duos.
* **Double-Match Algorithm**: A match is established when all four members across both duos collectively like each other.
* **4-Way Approval Chat**: Once matched, any user can initiate a group chat room request. The chatroom activates once all four members accept the request.

---

## Quick Start Guide

### Prerequisites
* **Node.js** (v18 or higher) for the Frontend.
* **Python** (v3.8 or higher) for the Backend.

### 1. Start the Backend API
Navigate to the `Backend` directory, configure your environment, and launch the server:
```bash
# Go to Backend directory
cd DuoDate/Backend

# Set up virtual environment and install packages
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create .env configuration
# (Note: Leave MONGO_URI blank to use the local in-memory fallback database)
echo "PORT=3000" > .env

# Run the backend server
python app.py
```
The API server will run on `http://localhost:3000`.

### 2. Start the Frontend Client
Navigate to the `Frontend` directory, install packages, and launch the development environment:
```bash
# Go to Frontend directory
cd DuoDate/Frontend

# Install package dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser to view the application.

file:///C:/Users/lenov/Downloads/double_date_app_ui.html

<img width="1353" height="679" alt="Screenshot 2026-06-17 000113" src="https://github.com/user-attachments/assets/33e3ce16-dd20-475d-ba64-1f6b0dde1c18" />

<img width="1154" height="606" alt="Screenshot 2026-06-19 152059" src="https://github.com/user-attachments/assets/a7d10720-38fe-45ca-b3c5-c2eff4919a4d" />
