# 🔐 Real-time Chat App with Room Authentication

This is a full-stack chat application built with:

- 💬 **Socket.IO** for real-time messaging  
- 🌐 **Express.js** + **MongoDB** for backend and data persistence  
- 🔐 **JWT-based user authentication**  
- 🧑‍🤝‍🧑 Room creation with password protection  
- 🗨️ Chat history persistence per room

---

## 📁 Project Structure

```
root
├── backend
│   ├── models
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   └── chats.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   └── chatController.js
│   ├── server.js
│   └── .env
├── frontend
│   └── (React files: App.jsx, components, pages, etc.)
└── .gitignore
```

---

## 🚀 Features

- ✅ User SignUp & Login with email and password
- ✅ Secure JWT Authentication
- ✅ Create Public/Private Rooms with passwords
- ✅ Join rooms after password verification
- ✅ Realtime chat via Socket.IO
- ✅ Persist messages and fetch history on join
- ✅ System notifications for join/leave events

---

## 🔧 Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

### 🔑 Configure `.env`

Create a `.env` file inside the `backend/` folder:

```env
MONGODB_URI=mongodb://localhost:27017/chat-db
JWT_SECRET=your_secret_key
PORT=8000
```

### ▶️ Run Server

```bash
node server.js
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev   # or npm start
```

---

## 🔐 API Routes

### 🧑 Auth (`/api/auth`)
- `POST /signup` — Register user
- `POST /login` — Login & get JWT

### 🏠 Rooms (`/api/rooms`)
- `GET /` — Fetch all rooms
- `POST /` — Create room
- `DELETE /` — Delete room

### 💬 Chats (`/api/chats`)
- `GET /` — Get all messages for a room
- `POST /` — Add a new message

---

## 🔌 Socket.IO Events

- `getRooms` → Request list of rooms
- `roomsList` → Receive rooms list
- `createRoom` → Create a room with password
- `joinRoom` → Join a room (with password)
- `chatHistory` → Receive past messages
- `sendMessage` → Send chat message
- `receiveMessage` → Broadcast message to room

---

## ⚙️ .gitignore (Root)

```
node_modules
.env
dist
build
.DS_Store
```

---

## 🧠 Tech Stack

- **Frontend**: React, Tailwind CSS, Axios  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose)  
- **Real-time**: Socket.IO  
- **Auth**: JSON Web Token (JWT)

---

## 📜 License

MIT — Feel free to use and modify for learning and development.
