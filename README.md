# FRIENDS WITHOUT BENEFITS

> **Object Recognition Scavenger Hunt** powered by React, Socket.IO, PeerJS, and TensorFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node 16+](https://img.shields.io/badge/Node-16%2B-green.svg)](https://nodejs.org)
[![React 18+](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite%206.0.6-orange)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-lightgrey)](https://socket.io/)
[![PeerJS](https://img.shields.io/badge/PeerJS-1.5.4-green.svg)](https://peerjs.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-orange.svg)](https://www.tensorflow.org/js)

---

### Production Link

**[Live App on Render → https://friends-without-benefits.onrender.com](https://friends-without-benefits.onrender.com)**

FRIENDS WITHOUT BENEFITS is a multiplayer scavenger hunt game where you **use your webcam** to find common objects, score points, and climb the leaderboard. We trained our own custom TensorFlow model to recognize objects in real‐time. Now you can play against friends, share video feeds, chat, and see who can spot items fastest!

This project is built by the same team behind [Tomogatch.ai](https://github.com/OccultParrot/Tomogatch.ai). We’re exploring new ways to blend **machine learning** and **real‐time communication** in fun, interactive web apps.

---

## Table of Contents

- [FRIENDS WITHOUT BENEFITS](#friends-without-benefits)
  - [Production Link](#production-link)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Installation \& Setup](#installation--setup)
  - [Usage](#usage)
  - [Team](#team)
  - [License](#license)

---

## Features

- **Object Detection** with a **custom TensorFlow model**
- **Multiplayer** Mode: share webcam feeds, see each other’s hunts
- **Real‐Time Chat** via Socket.IO
- **Leaderboards** & **User Profiles**
- **Authentication** (Sign Up / Sign In) with JWT
- **Theme Switching** (Dark/Light)
- **MongoDB** for persistent data storage
- Timed hunts, skip features, & much more!

---

## Tech Stack

| Front End                                                                           | Back End                                                                                | Tools & Services                                                                                         |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| <ul><li>React (18.x)</li><li>Vite</li><li>TypeScript</li><li>Tailwind CSS</li></ul> | <ul><li>Express + Node</li><li>Apollo Server</li><li>GraphQL</li><li>Mongoose</li></ul> | <ul><li>TensorFlow.js</li><li>Socket.IO + PeerJS</li><li>Custom ML Model</li><li>Render Deploy</li></ul> |

Some of our key packages include:

- **`@apollo/client`**, **`@apollo/server`** (GraphQL integration)
- **`@tensorflow/tfjs`** (custom object detection)
- **`peerjs`** & **`socket.io`** (real‐time and P2P communication)
- **`mongoose`** (MongoDB ODM)
- **`react-icons`** for UI icons
- **`@mui/material`** for additional UI components

We also used **OpenCV**, **ml5**, **Microsoft Custom Vision**, **Google Colab**, **Coco SSD**, and **MobileNet** during R&D, but ultimately settled on a custom TF model.

---

## Installation & Setup

1. **Clone** the repo:
   ```bash
   git clone https://github.com/YOUR-ORG-OR-USER/friends-without-benefits.git
   cd friends-without-benefits
   ```
2. **Install dependencies** for both server and client:
   ```bash
   npm install
   npm run setup
   ```
3. **Configure environment variables**:
   - Create `.env` files for server/client if needed.
   - Example variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=development`.
4. **Development mode**:
   ```bash
   npm run dev
   ```
   - Runs the server on <http://localhost:3001> (by default).
   - Client on <http://localhost:5173> (or whichever port Vite picks).
5. **Build for Production**:
   ```bash
   npm run build
   ```
6. **Start** (production):
   ```bash
   npm start
   ```

---

## Usage

1. **Sign Up or Log In**.
2. **Start a Scavenger Hunt**: You’ll see a timer, items to find, and your webcam feed.
3. **Object Detection**: Move your camera around to detect objects. When recognized, you earn points.
4. **Multiplayer**: Challenge friends or random players, share live video feed, and trash talk in chat!
5. **Leaderboards**: See who’s on top, track personal bests.

Check the [live production link](https://friends-without-benefits.onrender.com) to play with others in real time.

---

## Team

| Developer                  | Email                 | GitHub                                             |
| -------------------------- | --------------------- | -------------------------------------------------- |
| **Greg Barker**            | gregcbarker@gmail.com | [@savevsgames](https://github.com/savevsgames)     |
| **Thomas Stemler**         | thomas@stemler.dev    | [@OccultParrot](https://github.com/OccultParrot)   |
| **Souad Hassen-Bouzouita** | souadsalahh@gmail.com | [@SouadHB](https://github.com/SouadHB)             |
| **Dario Zambrano**         | dariojzb87@gmail.com  | [@DarioZambrano](https://github.com/DarioJZB)      |

_We have also collaborated on [Tomogatch.ai](https://github.com/OccultParrot/Tomogatch.ai) and other AI/ML projects._

---

## License

This project is licensed under the **[MIT License](LICENSE)**. Feel free to fork, modify, and share—just credit us where appropriate!

---
