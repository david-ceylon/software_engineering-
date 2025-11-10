# Wedding Planner

This repository is for the project in course software engineering, it's a solution to manage wedding preparation.

## Features

### Current Features
- 👥 **User Account Management**: Create and manage user accounts
- ✅ **Task List Management**: Add, view, complete, and delete wedding tasks

### Future Features (Planned)
- 📅 Event calendar management
- 👨‍👩‍👧‍👦 Guest management
- 🤝 Vendor/supplier management
- 💰 Budget management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/david-ceylon/software_engineering-.git
cd software_engineering-
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure environment variables:
```bash
cp .env.example .env
# Edit .env and change JWT_SECRET to a secure random string
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Create an account**: Click on "Créer un compte" and fill in your information
2. **Login**: Use your credentials to login
3. **Add tasks**: Click on "+ Ajouter une tâche" to add wedding preparation tasks
4. **Manage tasks**: Check off completed tasks or delete tasks you no longer need

## Technology Stack

- **Backend**: Node.js + Express 5.x
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Security**: Rate limiting, password hashing, protected routes
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## Project Structure

```
software_engineering-/
├── src/
│   ├── auth.js          # Authentication routes and middleware
│   ├── database.js      # Database configuration and initialization
│   └── tasks.js         # Task management routes
├── public/
│   ├── css/
│   │   └── style.css    # Application styles
│   ├── js/
│   │   └── app.js       # Frontend JavaScript
│   └── index.html       # Main HTML file
├── server.js            # Express server entry point
├── .env.example         # Environment variables template
└── package.json         # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
  - Body: `{ "email": string, "password": string, "name": string }`
  - Returns: JWT token and user info
- `POST /api/auth/login` - Login to existing account
  - Body: `{ "email": string, "password": string }`
  - Returns: JWT token and user info

### Tasks (Requires Authentication)
- `GET /api/tasks` - Get all tasks for the authenticated user
  - Headers: `Authorization: Bearer <token>`
- `POST /api/tasks` - Create a new task
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "title": string, "description": string }`
- `PUT /api/tasks/:id` - Update a task
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "title": string, "description": string, "completed": boolean }`
- `DELETE /api/tasks/:id` - Delete a task
  - Headers: `Authorization: Bearer <token>`

## Security Features

- **Password Security**: Passwords are hashed using bcrypt before storage
- **JWT Authentication**: Secure token-based authentication with 7-day expiry
- **Rate Limiting**: 
  - Auth endpoints: 5 requests per 15 minutes per IP
  - Task endpoints: 100 requests per 15 minutes per IP
- **SQL Injection Protection**: Parameterized queries prevent SQL injection attacks
- **Protected Routes**: All task operations require valid JWT token

## License

ISC

