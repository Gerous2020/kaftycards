const Auth = {
    // --- KEY CONSTANTS ---
    USERS_KEY: 'kafty_users',
    CURRENT_USER_KEY: 'kafty_current_user',

    // --- INITIALIZATION (Seeding) ---
    init: function () {
        if (!localStorage.getItem(this.USERS_KEY)) {
            const seedUsers = [
                { id: 'user_1', email: 'user1@kafty.com', pass: '123456', name: 'Sri Balaji Hardware', type: 'Retail' },
                { id: 'user_2', email: 'user2@kafty.com', pass: '123456', name: 'Bakers Delight', type: 'Food' },
                { id: 'user_3', email: 'user3@kafty.com', pass: '123456', name: 'Tech Solutions', type: 'IT' },
                { id: 'user_4', email: 'user4@kafty.com', pass: '123456', name: 'Elara Fashion Studio', type: 'Fashion' }
            ];
            localStorage.setItem(this.USERS_KEY, JSON.stringify(seedUsers));

            // Seed Data for each user
            seedUsers.forEach(u => {
                const dataKey = `kafty_data_${u.id}`;
                if (!localStorage.getItem(dataKey)) {
                    localStorage.setItem(dataKey, JSON.stringify(this.generateSeedData(u)));
                }
            });
            console.log('Seeded 4 users.');
        }
    },

    generateSeedData: function (user) {
        return {
            profile: {
                name: user.name,
                industry: user.type,
                phone: "+91 98765 43210",
                whatsapp: "+91 98765 43210",
                email: user.email,
                description: `Welcome to ${user.name}. We provide the best service in ${user.type}.`,
                address: "Chennai, India",
                map: "",
                hours: "9 AM - 9 PM",
                img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                logo: ""
            },
            settings: {
                layout: "Standard",
                color: "#2C3E50",
                secondaryColor: "#F39C12",
                showCall: true, showWhatsapp: true, showEmail: false, showLocation: true
            },
            services: [], portfolio: [], gallery: [], testimonials: [], enquiries: [], customSections: [], faqs: []
        };
    },

    // --- ACTIONS ---
    login: function (email, password) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        const user = users.find(u => u.email === email && u.pass === password);
        if (user) {
            localStorage.setItem(this.CURRENT_USER_KEY, user.id);
            return { success: true, user };
        }
        return { success: false, message: 'Invalid email or password.' };
    },

    register: function (data) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        if (users.find(u => u.email === data.email)) {
            return { success: false, message: 'Email already registered.' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            email: data.email,
            pass: data.password,
            name: data.name,
            type: 'Business'
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // Init Empty Data
        const newData = this.generateSeedData(newUser);
        newData.profile.phone = data.phone;
        localStorage.setItem(`kafty_data_${newUser.id}`, JSON.stringify(newData));

        return { success: true };
    },

    logout: function () {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'login.html';
    },

    getCurrentUser: function () {
        return localStorage.getItem(this.CURRENT_USER_KEY);
    },

    getData: function (userId) {
        return JSON.parse(localStorage.getItem(`kafty_data_${userId}`));
    },

    saveData: function (userId, data) {
        localStorage.setItem(`kafty_data_${userId}`, JSON.stringify(data));
    }
};

Auth.init();
