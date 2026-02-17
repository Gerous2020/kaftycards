const Auth = {
    // --- KEY CONSTANTS ---
    // --- KEY CONSTANTS ---
    CURRENT_USER_KEY: 'kafty_current_user',
    API_URL: window.location.port === '5000'
        ? '/api'
        : 'http://localhost:5000/api', // Use absolute URL if on LiveServer (5500)

    // --- INITIALIZATION ---
    init: function () {
        console.log('Auth Initialized. Using API: ' + this.API_URL);
    },

    // --- ACTIONS ---
    login: async function (email, password) {
        try {
            const res = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem(this.CURRENT_USER_KEY, data.user.id);
                localStorage.setItem('kafty_user_name', data.user.name);
                localStorage.setItem('kafty_user_email', data.user.email);
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Server Error' };
        }
    },

    googleLogin: async function (token, mode = 'login') {
        try {
            const res = await fetch(`${this.API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, mode })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem(this.CURRENT_USER_KEY, data.user.id);
                localStorage.setItem('kafty_user_name', data.user.name);
                localStorage.setItem('kafty_user_email', data.user.email);
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Google Auth Error' };
        }
    },

    register: async function (formData) {
        try {
            const res = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            return data;
        } catch (err) {
            return { success: false, message: 'Server Error' };
        }
    },

    logout: function () {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'login.html';
    },

    getCurrentUser: function () {
        return localStorage.getItem(this.CURRENT_USER_KEY);
    },

    getData: async function (userId) {
        try {
            const res = await fetch(`${this.API_URL}/card/${userId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error('Fetch Error:', err);
            return null;
        }
    },

    saveData: async function (userId, data) {
        try {
            await fetch(`${this.API_URL}/card/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.error('Save Error:', err);
        }
    }
};

Auth.init();

