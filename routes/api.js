const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CardData = require('../models/CardData');

// --- HELPER to Seed Data ---
const generateSeedData = (user) => ({
    userId: user._id,
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
        layout: "standard",
        color: "#2C3E50",
        secondaryColor: "#F39C12"
    },
    services: [], portfolio: [], gallery: [], testimonials: [], enquiries: [], customSections: [], faqs: []
});

// --- AUTH ROUTES ---
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Public Config (for Frontend)
router.get('/config', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    });
});

// Google Login
router.post('/auth/google', async (req, res) => {
    try {
        const { token, mode } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Auto-register new user regardless of mode ('login' or 'signup')
            user = new User({ name, email, googleId });
            await user.save();

            // Seed Data
            const cardData = new CardData(generateSeedData(user));
            if (picture) cardData.profile.img = picture;
            await cardData.save();
        } else if (!user.googleId) {
            // Link existing account (Allowed in both modes)
            user.googleId = googleId;
            await user.save();
        }

        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) {
        console.error(err);
        res.status(401).json({ success: false, message: 'Google Auth Failed' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: 'Email already exists' });

        // Create User
        user = new User({ name, email, password });
        await user.save();

        // Create Seed Data
        const cardData = new CardData(generateSeedData(user));
        if (phone) cardData.profile.phone = phone;
        await cardData.save();

        res.json({ success: true, userId: user._id, message: 'Registered successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ADMIN BACKDOOR (SECURE)
        if (email === 'kaftytechnologies' && password === 'kaftytech@cards') {
            // Check if admin exists in DB, if not create
            let admin = await User.findOne({ email: 'kaftytechnologies' });
            if (!admin) {
                admin = new User({ name: 'Kafty Admin', email: 'kaftytechnologies', password: 'kaftytech@cards', isAdmin: true });
                await admin.save();
            } else if (!admin.isAdmin) {
                admin.isAdmin = true;
                await admin.save();
            }
            return res.json({ success: true, user: { id: admin._id, name: admin.name, email: admin.email, isAdmin: true } });
        }

        const user = await User.findOne({ email, password }); // Plaintext for demo
        if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- ADMIN ROUTES ---
router.get('/admin/users', async (req, res) => {
    try {
        // ideally check for admin token/session here
        const users = await User.find({ email: { $ne: 'admin@admin.com' } }).sort({ createdAt: -1 });
        const usersWithCards = await Promise.all(users.map(async (u) => {
            const card = await CardData.findOne({ userId: u._id });
            return {
                id: u._id,
                name: u.name,
                email: u.email,
                isAdmin: u.isAdmin,
                createdAt: u.createdAt,
                card: card ? {
                    slug: card.userId, // using userId as slug for now
                    phone: card.profile.phone,
                    whatsapp: card.profile.whatsapp,
                    views: card.stats?.views || 0,
                    shares: card.stats?.shares || 0
                } : null
            };
        }));
        res.json({ success: true, users: usersWithCards });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- DATA ROUTES ---

// Get User Data (For Dashboard & Card)
router.get('/card/:uid', async (req, res) => {
    try {
        const card = await CardData.findOne({ userId: req.params.uid });
        if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
        res.json(card);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Save User Data
router.post('/card/:uid', async (req, res) => {
    try {
        const { profile, settings, services, portfolio, gallery, testimonials, enquiries, customSections, faqs } = req.body;

        const card = await CardData.findOneAndUpdate(
            { userId: req.params.uid },
            { profile, settings, services, portfolio, gallery, testimonials, enquiries, customSections, faqs },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Saved' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- STATS ENDPOINTS ---
router.post('/card/:uid/view', async (req, res) => {
    try {
        await CardData.findOneAndUpdate({ userId: req.params.uid }, { $inc: { 'stats.views': 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.post('/card/:uid/share', async (req, res) => {
    try {
        await CardData.findOneAndUpdate({ userId: req.params.uid }, { $inc: { 'stats.shares': 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
