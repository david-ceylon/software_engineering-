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

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Create an account**: Click on "Créer un compte" and fill in your information
2. **Login**: Use your credentials to login
3. **Add tasks**: Click on "+ Ajouter une tâche" to add wedding preparation tasks
4. **Manage tasks**: Check off completed tasks or delete tasks you no longer need

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
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
└── package.json         # Project dependencies
```

## License

ISC

