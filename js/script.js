// js/script.js

/**
 * Initializes the card layout with data
 */
function outputCardData(data) {
    if (!data) return;

    // --- 1. Hero & Branding ---
    safeSetText('companyName', data.company);
    safeSetText('businessType', data.businessType);
    safeSetText('fullName', data.name);
    safeSetText('designation', data.designation);
    safeSetText('address', data.address);
    safeSetText('headerPhone', data.phone);

    // Hero Background Image
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        if (data.heroImage) {
            heroSection.style.backgroundImage = `url('${data.heroImage}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
        } else {
            // Fallback to gradient if no image
            heroSection.style.background = 'linear-gradient(135deg, var(--primary), var(--accent))';
        }
    }

    // Company Logo
    const logoImg = document.getElementById('companyLogo');
    if (logoImg) logoImg.src = data.logo || 'https://via.placeholder.com/150?text=Logo';

    // Owner Mini Profile Image
    const ownerImg = document.getElementById('ownerImage');
    if (ownerImg) ownerImg.src = data.image || 'https://via.placeholder.com/150';


    // --- 2. Action Buttons ---
    const actionsStack = document.getElementById('actionButtons');
    if (actionsStack) {
        const actions = [
            { label: 'Call Now', icon: 'phone', href: `tel:${data.phone}` },
            { label: 'WhatsApp', icon: 'message-circle', href: `https://wa.me/${data.whatsapp ? data.whatsapp.replace('+', '') : ''}` },
            { label: 'Email Us', icon: 'mail', href: `mailto:${data.email}` },
            { label: 'Location', icon: 'map', href: `https://maps.google.com/?q=${encodeURIComponent(data.address)}` }
        ];

        actionsStack.innerHTML = actions.map(action => `
            <a href="${action.href}" class="action-btn" target="_blank" rel="noopener noreferrer">
                <div class="icon-box">
                    <i data-lucide="${action.icon}"></i>
                </div>
                <span>${action.label}</span>
                <i data-lucide="chevron-right" style="margin-left: auto; width: 16px; opacity: 0.5;"></i>
            </a>
        `).join('');
    }

    // --- 3. Dynamic About Blocks ---
    const aboutSection = document.getElementById('aboutSection');
    if (aboutSection && data.aboutBlocks && data.aboutBlocks.length > 0) {
        aboutSection.innerHTML = data.aboutBlocks.map(block => `
            <div class="about-block mb-4">
                <h2 class="block-title">${block.heading}</h2>
                <div class="block-content">
                    <p>${block.content.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');
    } else if (aboutSection && data.about) {
        // Fallback for legacy string data
        aboutSection.innerHTML = `
            <h2 class="block-title">About Us</h2>
            <div class="block-content"><p>${data.about}</p></div>
        `;
    }

    // --- 4. Dynamic Services ---
    const servicesList = document.getElementById('servicesList');
    if (servicesList && data.services) {
        // Check if string array (legacy) or object array (new)
        if (typeof data.services[0] === 'string') {
            servicesList.innerHTML = data.services.map(s => `<div class="service-tag">${s}</div>`).join('');
        } else {
            // New Object Structure
            servicesList.innerHTML = data.services.map(service => {
                const imagesHtml = service.images && service.images.length > 0 ? `
                    <div class="service-gallery">
                        ${service.images.map(img => `<img src="${img}" alt="${service.title}" onclick="openImageModal('${img}')">`).join('')}
                    </div>
                ` : '';

                return `
                    <div class="service-card">
                        <h3>${service.title}</h3>
                        <p>${service.desc}</p>
                        ${imagesHtml}
                    </div>
                `;
            }).join('');
        }
    }

    // --- 5. Gallery ---
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid && data.gallery && data.gallery.length > 0) {
        galleryGrid.innerHTML = data.gallery.map(img => `
            <div class="gallery-item" onclick="openImageModal('${img}')">
                <img src="${img}" alt="Gallery Image" loading="lazy">
            </div>
        `).join('');
    } else if (galleryGrid) {
        document.getElementById('gallerySection').style.display = 'none';
    }

    // --- 6. Social Links ---
    const socialContainer = document.getElementById('socialLinks');
    if (socialContainer && data.socialLinks) {
        const socialMap = [
            { key: 'linkedin', icon: 'linkedin' },
            { key: 'instagram', icon: 'instagram' },
            { key: 'twitter', icon: 'twitter' },
            { key: 'github', icon: 'github' },
            { key: 'website', icon: 'globe' }
        ];

        let socialHtml = '';
        if (data.website) socialHtml += `<a href="${data.website}" class="social-link"><i data-lucide="globe"></i></a>`;

        socialMap.forEach(platform => {
            if (data.socialLinks[platform.key]) {
                socialHtml += `<a href="${data.socialLinks[platform.key]}" class="social-link"><i data-lucide="${platform.icon}"></i></a>`;
            }
        });
        socialContainer.innerHTML = socialHtml;
    }

    // Refresh Icons
    if (window.lucide) window.lucide.createIcons();

    // Generate QR Code (Hidden initially)
    generateQR();
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
}

// --- Theme Logic ---
function changeTheme(themeName) {
    document.body.className = `theme-${themeName}`;

    // Sync UI: Update active state in Dashboard Theme Grid if present
    const options = document.querySelectorAll('.theme-option');
    if (options.length > 0) {
        options.forEach(opt => opt.classList.remove('active'));
        const activeBtn = document.querySelector(`.theme-option[data-theme="${themeName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Handle Custom Theme
    if (themeName === 'custom') {
        const customColors = JSON.parse(localStorage.getItem('kafty_custom_colors') || '{"primary":"#2563eb","accent":"#f59e0b"}');
        const docStyle = document.documentElement.style;
        docStyle.setProperty('--custom-primary', customColors.primary);
        docStyle.setProperty('--custom-accent', customColors.accent);
        docStyle.setProperty('--custom-primary-light', lightenColor(customColors.primary, 90));

        // Show custom color inputs if in dashboard
        const customInputs = document.getElementById('customColorInputs');
        if (customInputs) customInputs.style.display = 'block';
    } else {
        // Hide custom color inputs if not custom
        const customInputs = document.getElementById('customColorInputs');
        if (customInputs) customInputs.style.display = 'none';
    }

    localStorage.setItem('kafty_current_theme', themeName);
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent / 100));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * percent / 100));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * percent / 100));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// --- Interaction Functions ---

function downloadVCard() {
    const data = loadData();
    const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name}\nORG:${data.company}\nTITLE:${data.designation}\nTEL;TYPE=WORK,VOICE:${data.phone}\nEMAIL:${data.email}\nURL:${data.website}\nADR;TYPE=WORK:;;${data.address}\nEND:VCARD`;
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name.replace(' ', '_')}.vcf`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function shareCard() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out my digital visiting card!',
            url: window.location.href,
        }).catch(console.error);
    } else {
        // Fallback to QR modal
        openQRModal();
    }
}

// --- Feedback Logic ---
function sendFeedback() {
    const data = loadData();
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const rating = ratingEl ? ratingEl.value : '0';
    const name = document.getElementById('feedbackName').value || 'A Visitor';
    const msg = document.getElementById('feedbackMsg').value;

    if (!ratingEl && !msg) {
        alert("Please leave a rating or a message!");
        return;
    }

    // Construct WhatsApp Message
    const text = `*New Feedback for ${data.company}* %0A` +
        `⭐ Rating: ${rating}/5 %0A` +
        `👤 From: ${name} %0A` +
        `💬 Message: ${msg || 'No written message'}`;

    const waNumber = data.whatsapp ? data.whatsapp.replace('+', '').replace(/\s/g, '') : '';

    if (waNumber) {
        const url = `https://wa.me/${waNumber}?text=${text}`;
        window.open(url, '_blank');
    } else {
        alert("Owner hasn't configured a WhatsApp number yet!");
    }
}

// --- QR Code Logic ---
let qrGenerated = false;
function generateQR() {
    if (qrGenerated) return;
    const qrContainer = document.getElementById('qrPlaceholder');
    if (qrContainer && window.QRCode) {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: window.location.href,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        qrGenerated = true;
    }
}

function openQRModal() {
    generateQR();
    document.getElementById('qrModal').style.display = 'flex';
}

function closeQRModal() {
    document.getElementById('qrModal').style.display = 'none';
}

function downloadQR() {
    const qrImg = document.querySelector('#qrPlaceholder img');
    if (qrImg) {
        const link = document.createElement('a');
        link.href = qrImg.src;
        link.download = 'my-card-qr.png';
        link.click();
    }
}

function openImageModal(src) {
    // Simple lightbox logic could go here, for now just open in new tab
    window.open(src, '_blank');
}

// --- Download Hero Card as Image ---
function downloadHeroCard() {
    const heroSection = document.getElementById('heroSection');
    if (!heroSection) {
        alert('Hero section not found!');
        return;
    }

    // Use html2canvas to capture the hero section
    html2canvas(heroSection, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true // Allow cross-origin images
    }).then(canvas => {
        // Convert to blob and download
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const data = loadData(); // Ensure this function exists in scope
            link.download = `${data.company || 'business'}-card.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }).catch(err => {
        console.error('Error capturing hero card:', err);
        alert('Failed to download card. Please try again.');
    });
}

// --- Pro Features Logic ---

function loadDashboardAnalytics() {
    // 1. Analytics Persistence Logic
    // Load existing or initialize
    let stats = JSON.parse(localStorage.getItem('kafty_analytics') || '{"views": 120, "clicks": 45, "saves": 12}');

    // Simulate "Real-time" growth on each load (increment slightly)
    stats.views += Math.floor(Math.random() * 5) + 1;
    if (Math.random() > 0.5) stats.clicks += Math.floor(Math.random() * 2) + 1;
    if (Math.random() > 0.7) stats.saves += 1;

    // Save back
    localStorage.setItem('kafty_analytics', JSON.stringify(stats));

    if (document.getElementById('statViews')) {
        animateValue("statViews", 0, stats.views, 1500);
        animateValue("statClicks", 0, stats.clicks, 1500);
        animateValue("statSaves", 0, stats.saves, 1500);
    }

    // Load Toggle State
    const toggle = document.getElementById('enableTranslate');
    if (toggle) {
        toggle.checked = localStorage.getItem('kafty_enable_translate') === 'true';
        toggle.addEventListener('change', (e) => {
            localStorage.setItem('kafty_enable_translate', e.target.checked);
        });
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Google Translate Injection
function loadGoogleTranslate() {
    if (localStorage.getItem('kafty_enable_translate') === 'true') {
        // Create div if not exists
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.textAlign = 'center';
            div.style.marginBottom = '20px';
            document.querySelector('.app-container').prepend(div); // Add to top
        }

        // Add Script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);

        // Define Callback
        window.googleTranslateElementInit = function () {
            new google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
        }
    }
}


// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // 1. Logic for CARD Page
    if (document.getElementById('card')) {
        const userData = loadData();
        outputCardData(userData);
        loadGoogleTranslate(); // Inject if enabled

        let savedTheme = localStorage.getItem('kafty_current_theme');
        if (!savedTheme) {
            savedTheme = 'vip'; // Default to VIP for premium feel
        }
        // Force re-apply to fix "collapsed" states
        changeTheme(savedTheme);

        // Safety check: If body has no class, default to 'vip'
        if (document.body.className === '') {
            changeTheme('vip');
        }
    }

    // 2. Logic for DASHBOARD Page
    if (document.querySelector('.pro-section')) {
        loadDashboardAnalytics();

        // Also apply theme to dashboard body for consistent feel
        let savedTheme = localStorage.getItem('kafty_current_theme');
        if (savedTheme) {
            changeTheme(savedTheme);
        }
    }
});
