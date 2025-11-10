// API Base URL
const API_URL = '/api';

// State management
let token = localStorage.getItem('token');
let currentUser = null;
let tasks = [];

// DOM Elements
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginFormElement = document.getElementById('login-form-element');
const registerFormElement = document.getElementById('register-form-element');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskFormDiv = document.getElementById('add-task-form');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const taskFormElement = document.getElementById('task-form-element');
const tasksList = document.getElementById('tasks-list');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        loadTasks();
    } else {
        showAuthSection();
    }

    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Auth form switching
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Forms submission
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    taskFormElement.addEventListener('submit', handleAddTask);

    // Buttons
    logoutBtn.addEventListener('click', handleLogout);
    addTaskBtn.addEventListener('click', showAddTaskForm);
    cancelTaskBtn.addEventListener('click', hideAddTaskForm);
}

// Auth functions
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || 'Registration failed', 'error');
            return;
        }

        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        
        showMessage('Account created successfully!', 'success');
        setTimeout(() => {
            showMainSection();
            loadTasks();
        }, 1000);
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || 'Login failed', 'error');
            return;
        }

        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        
        showMainSection();
        loadTasks();
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function handleLogout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    
    // Reset forms
    loginFormElement.reset();
    registerFormElement.reset();
    taskFormElement.reset();
    
    showAuthSection();
}

// Task functions
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                handleLogout();
                return;
            }
            throw new Error('Failed to load tasks');
        }

        tasks = await response.json();
        renderTasks();
        showMainSection();
    } catch (error) {
        showMessage('Failed to load tasks', 'error');
    }
}

async function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || 'Failed to add task', 'error');
            return;
        }

        tasks.unshift(data);
        renderTasks();
        hideAddTaskForm();
        taskFormElement.reset();
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function toggleTask(taskId, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: !completed })
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        const updatedTask = await response.json();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = updatedTask;
            renderTasks();
        }
    } catch (error) {
        showMessage('Failed to update task', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }

        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
    } catch (error) {
        showMessage('Failed to delete task', 'error');
    }
}

// UI functions
function showAuthSection() {
    authSection.style.display = 'block';
    mainSection.style.display = 'none';
}

function showMainSection() {
    authSection.style.display = 'none';
    mainSection.style.display = 'block';
    
    if (currentUser) {
        userNameSpan.textContent = currentUser.name;
    }
}

function showAddTaskForm() {
    addTaskFormDiv.style.display = 'block';
    document.getElementById('task-title').focus();
}

function hideAddTaskForm() {
    addTaskFormDiv.style.display = 'none';
    taskFormElement.reset();
}

function renderTasks() {
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>📝 Aucune tâche pour le moment</p>
                <small>Cliquez sur "Ajouter une tâche" pour commencer</small>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id}, ${task.completed})"
            >
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn btn-danger" onclick="deleteTask(${task.id})">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const authContainer = document.querySelector('.auth-container');
    const firstForm = authContainer.querySelector('.auth-form');
    
    authContainer.insertBefore(messageDiv, firstForm);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
