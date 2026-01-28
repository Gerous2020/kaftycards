const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Auth users
    googleId: { type: String }, // NEW: For Google Auth
    type: { type: String, default: 'personal' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
