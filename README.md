# Duolingo Web App Clone

A full-stack, functional clone of the core Duolingo learning experience, built from the ground up to match the requested gamification mechanics and strict tech stack requirements.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Python, FastAPI, SQLAlchemy ORM
- **Database**: SQLite (file-based, pre-seeded)
- **Animations**: Framer Motion, React Confetti
- **State Management**: React Context (Global), Component State (Local)

## Features Included

- **Learning Path**: Dynamically generated, winding path with units and skills mapping to a progression system.
- **Interactive Lessons**: Supports 5 unique exercise types:
  - Multiple Choice
  - Translate (Word Bank)
  - Match Pairs
  - Fill in the Blank
  - Type the Answer
- **Gamification Mechanics**:
  - Hearts system (lose a heart on mistake, out-of-hearts modal)
  - XP tracking and level-ups
  - Dynamic streak tracking (fire icon)
  - Crown leveling for individual skills
- **Leaderboard**: Live comparison against other learners
- **Profile**: Detailed statistics and unlocked achievements
- **Animations & Visual Polish**: Confetti upon completion, bouncy interactive buttons, and sleek modal popups matching Duolingo's aesthetic.

## How to Run

You need two terminal windows to run both the frontend and backend.

### 1. Run the Backend API

```bash
cd backend
# Create and activate the virtual environment if you haven't
python -m venv venv
# Windows
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt # (or directly via pip install fastapi "uvicorn[standard]" sqlalchemy pydantic)

# Start the server
python run.py
```
*Note: The API runs on `http://localhost:8000`. The database is automatically seeded upon the first request.*

### 2. Run the Frontend App

```bash
cd frontend
# Install dependencies
npm install

# Start the development server
npm run dev
```
*The app will be available at `http://localhost:3000`.*
