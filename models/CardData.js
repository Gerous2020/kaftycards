const mongoose = require('mongoose');

const CardDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    profile: {
        name: String,
        industry: String,
        phone: String,
        whatsapp: String,
        email: String,
        description: String,
        address: String,
        map: String,
        hours: String,
        img: String, // Base64 or URL
        logo: String,
        paymentQr: String // Base64 or URL
    },
    slug: { type: String, unique: true, sparse: true },
    stats: {
        views: { type: Number, default: 0 },
        shares: { type: Number, default: 0 }
    },
    settings: {
        layout: { type: String, default: 'standard' },
        color: { type: String, default: '#2C3E50' },
        secondaryColor: { type: String, default: '#F39C12' },
        darkMode: { type: Boolean, default: false },
        showCall: { type: Boolean, default: true },
        showWhatsapp: { type: Boolean, default: true },
        showEmail: { type: Boolean, default: false },
        showLocation: { type: Boolean, default: true }
    },
    services: [Object],
    portfolio: [Object],
    gallery: [String],
    testimonials: [Object],
    enquiries: [Object],
    customSections: [Object],
    faqs: [Object]
}, { timestamps: true });

module.exports = mongoose.model('CardData', CardDataSchema);
