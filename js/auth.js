// js/auth.js

const STORAGE_USERS_KEY = 'kafty_users';
const STORAGE_LOGGED_IN = 'isLoggedIn';
const STORAGE_SESSION_EMAIL = 'userEmail';

// Seed sample users if not exist
(function seedUsers() {
    if (!localStorage.getItem(STORAGE_USERS_KEY)) {
        const sampleUsers = [
            { name: "Demo User", email: "demo@kaftycards.com", password: "password" },
            { name: "Sarah Smith", email: "sarah@realestate.com", password: "password" },
            { name: "Tech Startup", email: "tech@startup.io", password: "password" },
            { name: "John Design", email: "checkith@design.com", password: "password" }
        ];
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(sampleUsers));
        console.log("Seeded sample users.");
    }
})();

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
}

function registerUser(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return { success: false, message: "User already exists!" };
    }
    users.push({ name, email, password });
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return { success: true };
}

function verifyLogin(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem(STORAGE_LOGGED_IN, 'true');
        localStorage.setItem(STORAGE_SESSION_EMAIL, email);
        return { success: true, user };
    }
    return { success: false, message: "Invalid email or password" };
}

function logout() {
    localStorage.removeItem(STORAGE_LOGGED_IN);
    localStorage.removeItem(STORAGE_SESSION_EMAIL);
    window.location.href = 'login.html';
}

function isLoggedIn() {
    return localStorage.getItem(STORAGE_LOGGED_IN) === 'true';
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}
