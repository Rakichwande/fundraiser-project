# Fundraiser Project

A web-based fundraiser automation system designed to help organizations track contributions, manage members, payments, and messages efficiently. This project was developed using **FastAPI** for the backend and a modern frontend stack (React/Vite).

---

## Table of Contents

- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Project Setup](#project-setup)  
- [Usage](#usage)  
- [Future Improvements](#future-improvements)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- **Member Management:** Add, edit, and track members participating in fundraising.  
- **Payment Tracking:** Record payments and track outstanding balances.  
- **Message Notifications:** Automated message reminders for members about pending contributions.  
- **Dashboard:** Centralized view to monitor all transactions and member activity.  
- **CORS Enabled:** Backend allows requests from frontend applications.  

---

## Technologies Used

- **Backend:** FastAPI, Python, Pydantic, UUID, Datetime  
- **Frontend:** React + Vite  
- **Database:** SQLite / MySQL (or your choice)  
- **Others:** CORS middleware, RESTful APIs  

---

## Project Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fundraiser-project.git
cd fundraiser-project


2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux / Mac
venv\Scripts\activate     # Windows

3. Install dependencies
pip install -r requirements.txt

4. Run the backend
uvicorn main:app --reload
Access the API
Backend runs at: http://127.0.0.1:8000
Swagger docs: http://127.0.0.1:8000/docs

5. Frontend
Navigate to the frontend folder and run:
npm install
npm run dev

Open browser at http://localhost:5173 (Vite default)