// js/data.js

const BASE_STORAGE_KEY = 'kafty_data_';
const USERS_KEY = 'kafty_users';
const LOGGED_IN_KEY = 'isLoggedIn';
const SESSION_KEY = 'userEmail';

function getUserKey() {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return 'kafty_user_data'; // Fallback for legacy/guest
    return BASE_STORAGE_KEY + email;
}

const defaultData = {
    company: "KaftyCards Tech.",
    businessType: "Design Agency",
    name: "Alex Sterling",
    designation: "Product Designer & UX Architect",
    phone: "+1234567890",
    email: "alex@kaftycards.com",
    address: "San Francisco, CA",
    website: "https://kaftycards.com",
    whatsapp: "+1234567890",
    about: "We craft digital experiences that convert. Specializing in UI/UX design, branding, and modern web development. Our goal is to help businesses stand out in the digital age.",
    services: [
        {
            title: "UI/UX Design",
            desc: "Creating intuitive and beautiful user interfaces for web and mobile apps.",
            images: ["https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&w=300&q=80"]
        },
        {
            title: "Web Development",
            desc: "Full-stack development services using modern technologies like React and Node.js.",
            images: []
        },
        {
            title: "Branding Strategy",
            desc: "Building strong brand identities that resonate with your target audience.",
            images: []
        }
    ],
    gallery: [
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80"
    ],
    socialLinks: {
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
        github: "https://github.com"
    },
    heroImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80", // Profile Pic
    logo: "https://ui-avatars.com/api/?name=Kafty+Cards&background=2563eb&color=fff&size=200"
};

function loadData() {
    const key = getUserKey();
    const json = localStorage.getItem(key);
    if (!json) {
        // Initialize with default if new user (but try to personalize name if avail)
        const email = localStorage.getItem(SESSION_KEY);
        if (email) {
            // Check if we can get name from auth
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            const user = users.find(u => u.email === email);
            if (user) {
                const personalized = { ...defaultData, name: user.name, email: user.email };
                return personalized;
            }
        }
        return defaultData;
    }
    return JSON.parse(json);
}

function saveUserData(data) {
    const key = getUserKey();
    localStorage.setItem(key, JSON.stringify(data));
}
