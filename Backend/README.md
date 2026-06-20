# DuoDate - Backend Server

DuoDate Backend is a modular REST API built using **Flask** and **MongoDB**. It provides a robust, scalable backend architecture for pairing up with friends, managing onboarding profiles, swiping on other duos, detecting mutual duo-matches, and facilitating four-way group chats.

---

## ✨ Key Features

### 1. Dual-Mode Database Singleton (`database.py`)
* **MongoDB Atlas Integration**: Primary driver using PyMongo for storage.
* **Automatic In-Memory Fallback**: If MongoDB is offline or misconfigured, the backend automatically spins up an `InMemoryDatabase` emulation layer. This guarantees that local development, onboarding, swiping, matches, and chats work seamlessly without any database configuration!

### 2. Authentication & Session Verification
* **Blueprints Auth**: Separated blueprints for `/signup` and `/login` requests.
* **Profile-based Redirections**: Returns profile onboarding status on login.

### 3. File Upload Engine
* Handles multiple image uploads (profile pictures) via `multipart/form-data`.
* Secures names and namespaces files with a unique prefix (derived from user email) inside the `/uploads` directory.
* Exposes uploads as static files via the `/uploads/<filename>` route.

### 4. Duo Formation & Swipe Engine
* **Friend Pairing**: Users search for active single users, send pending duo invites, accept, or reject invites.
* **Opposing Swipe Arena**: Filters discoverable duos based on gender matching rules and swipe history.
* **Double-Match Algorithm**: A Match occurs only when **both** members of Duo A like Duo B, and **both** members of Duo B like Duo A.
* **Interest Boards**: Tracks incoming likes (duos that swiped right on us) and outgoing likes.

### 5. Four-Way Group Chat Request System
* Reaching a duo match registers a new Match.
* **4-Way Activation Flow**: The match chat status remains `none`/`pending` until all four individual members across both duos accept the chat invitation. It then becomes `active` for messages.

---

## Tech Stack & Requirements

* **Runtime**: Python 3.8+
* **Framework**: Flask (v3.x)
* **Database Driver**: PyMongo (v4.x)
* **Cross-Origin Requests**: Flask-CORS
* **Environment variables**: python-dotenv

---

## 📂 Project Structure

```bash
DuoDate/Backend/
├── routes/
│   ├── __init__.py
│   ├── signup.py        # Registration endpoints
│   ├── login.py         # Login validation endpoints
│   ├── profile.py       # User onboarding profiles & uploads
│   └── duo.py           # Duo management, swipes, matches, and chat endpoints
├── uploads/             # Directory where uploaded profile photos are stored
├── app.py               # Main Flask application and server entrypoint
├── config.py            # Environment configuration and loading rules
├── database.py          # Database singleton client with InMemory fallback
├── inspect_db.py        # Utility script to inspect MongoDB collections
├── requirements.txt     # Python dependency definition file
└── reset_db.py          # Utility script to wipe local database collections
```

---

##  API Endpoint Catalog

### Authentication & Profile
| Endpoint | Method | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `/signup` | `POST` | Registers a new user. | `{"email": "a@b.com", "password": "pwd", "name": "A", "gender": "male", "birthDate": "2000-01-01"}` |
| `/login` | `POST` | Validates credentials and returns profile status. | `{"email": "a@b.com", "password": "pwd"}` |
| `/profile` | `POST` | Saves/Updates onboarding profile & uploads images. | `multipart/form-data` with `email`, `selfSummary`, `minAge`, `maxAge`, and files. |
| `/uploads/<filename>` | `GET` | Static server endpoint exposing uploaded profile pictures. | None (Retrieves file asset) |

### Duo Management
| Endpoint | Method | Description | Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `/api/duo/status` | `GET` | Returns current Duo status (`solo`, `invite_sent`, `invite_received`, `in_duo`). | Query: `?email=user@test.com` |
| `/api/users/search` | `GET` | Searches for available solo users to invite. | Query: `?q=searchterm&email=caller@email.com` |
| `/api/duo/invite` | `POST` | Sends a duo invite to another solo user. | `{"senderEmail": "s@e.com", "receiverEmail": "r@e.com"}` |
| `/api/duo/accept` | `POST` | Accepts a duo invite and establishes the duo. | `{"senderEmail": "s@e.com", "receiverEmail": "r@e.com"}` |
| `/api/duo/reject` | `POST` | Declines or cancels a duo invite. | `{"senderEmail": "s@e.com", "receiverEmail": "r@e.com"}` |
| `/api/duo/leave` | `POST` | Disbands the active duo. | `{"email": "user@test.com"}` |

### Swipe, Matches & Interests
| Endpoint | Method | Description | Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `/api/duo/discover` | `GET` | Retrieves swipe-candidate duos. | Query: `?email=user@test.com` |
| `/api/duo/swipe` | `POST` | Casts a `like` or `pass` action on a target duo. | `{"swiperEmail": "me@e.com", "targetDuoId": "ID", "action": "like"}` |
| `/api/duo/matches` | `GET` | Retrieves matches (active/pending/none) for the duo. | Query: `?email=user@test.com` |
| `/api/duo/interests` | `GET` | Lists incoming likes and outgoing likes. | Query: `?email=user@test.com` |

### Chat Approval & Messaging
| Endpoint | Method | Description | Payload |
| :--- | :--- | :--- | :--- |
| `/api/duo/chat-requests/initiate` | `POST` | Initiates the 4-way group chat request. | `{"matchId": "ID", "initiatorEmail": "email"}` |
| `/api/duo/chat-requests/accept-member`| `POST` | Records approval from one member of a match. | `{"matchId": "ID", "memberEmail": "email"}` |
| `/api/duo/chat-requests/reject-match`| `POST` | Deletes match and swipe history to reset state. | `{"matchId": "ID"}` |
| `/api/duo/messages` | `GET` | Fetches chat messages for an active match. | Query: `?matchId=ID` |
| `/api/duo/messages` | `POST` | Sends a message to the group chat. | `{"matchId": "ID", "senderEmail": "email", "text": "Hi!"}` |

---

##  Setup & Launch Steps

### 1. Configure Python Environment
Navigate to the `Backend` directory and set up a virtual environment:
```bash
cd DuoDate/Backend

# Create virtual environment
python -m venv venv

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Configuration Variables
Create a file named `.env` in the root of the `Backend` directory:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/duodate
PORT=3000
```
> [!NOTE]
> If you leave `MONGO_URI` empty or if connection fails, the application automatically defaults to `InMemoryDatabase` with no features broken.

### 4. Run the API Server
Start the development server:
```bash
python app.py
```
The server will boot up on `http://localhost:3000` (or the configured `PORT`).

---

## Database Utilities
* **Inspect Database**: Run `python inspect_db.py` to view users, profiles, invites, and swipe records currently saved inside MongoDB.
* **Reset Database**: Run `python reset_db.py` to wipe all collections and reset the database environment.
