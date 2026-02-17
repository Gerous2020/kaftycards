document.addEventListener('DOMContentLoaded', async function () {

    // Get UID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uid');

    if (!userId) {
        document.body.innerHTML = '<p class="text-white text-center mt-10">No User ID provided.</p>';
        return;
    }

    const data = await Auth.getData(userId);

    // Increment View Count
    if (userId) {
        fetch(`${Auth.API_URL}/card/${userId}/view`, { method: 'POST' }).catch(err => console.error(err));
    }

    if (!data) {
        console.log('Card data load failed for:', userId);
        document.body.innerHTML = `<div class="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <p class="text-gray-800 text-xl font-bold mb-2">Card not found</p>
            <p class="text-gray-500 text-sm">Could not load data for ID: ${userId}</p>
            <p class="text-xs text-red-400 mt-2">Ensure the user has saved their card details.</p>
            <a href="login.html" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Login to Create</a>
        </div>`;
        return;
    }

    if (data) {
        const { profile, settings, services, portfolio, gallery, testimonials, customSections, faqs } = data;

        // --- 1. THEME & COLORS ---
        const pColor = settings.color || '#2C3E50';
        const sColor = settings.secondaryColor || '#F39C12';

        // Apply Colors (Header, Buttons, Titles)
        document.querySelector('.bg-primary-blue').style.backgroundColor = pColor;
        document.querySelectorAll('.text-primary-blue').forEach(el => el.style.color = pColor);
        document.querySelector('#card-enquiry-form button').style.backgroundColor = pColor; // Form Button

        document.querySelectorAll('.bg-accent-saffron').forEach(el => el.style.backgroundColor = sColor);
        document.querySelectorAll('.text-accent-saffron').forEach(el => el.style.color = sColor);
        document.querySelectorAll('.border-accent-saffron').forEach(el => el.style.borderColor = sColor);

        // Name title
        if (profile.name) {
            document.querySelector('h1').textContent = profile.name;
            document.querySelector('h1').style.color = pColor;
            document.title = profile.name;
        }

        // --- LAYOUT LOGIC ---
        // --- LAYOUT LOGIC ---
        if (settings.layout === 'modern') {
            const cardContainer = document.querySelector('.max-w-md'); // Main card wrapper
            const profileSection = document.querySelector('.px-6.-mt-24'); // Profile Image Section

            // 1. Change Background and Border
            cardContainer.classList.remove('md:rounded-3xl');
            cardContainer.classList.add('md:rounded-xl', 'border-t-8');
            cardContainer.style.borderColor = pColor;

            // 2. Hide Standard Header Curve
            const header = document.querySelector('.relative.h-48');
            header.classList.add('hidden');

            // 3. Re-style Profile Section (Left Aligned, Top Padding)
            profileSection.classList.remove('-mt-24', 'text-center');
            profileSection.classList.add('pt-12', 'pb-4', 'flex', 'flex-col', 'items-start', 'text-left');

            // Profile Image styling
            const imgContainer = profileSection.querySelector('.inline-block');
            imgContainer.classList.remove('p-1', 'bg-white', 'profile-shadow');
            const imgDiv = imgContainer.querySelector('div'); // The div with the image
            imgDiv.classList.remove('border-4', 'border-white', 'rounded-full');
            imgDiv.classList.add('rounded-xl', 'shadow-md');
            imgDiv.style.width = '100px';
            imgDiv.style.width = '100px';
            imgDiv.style.height = '100px';

            // Payment QR Render (Modern)
            if (profile.paymentQr) {
                const qrContainer = document.createElement('div');
                qrContainer.className = 'mt-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100';
                qrContainer.innerHTML = `<p class="text-[10px] text-center font-bold mb-1 text-gray-500">SCAN TO PAY</p><img src="${profile.paymentQr}" class="w-20 h-20 object-contain">`;
                profileSection.appendChild(qrContainer);
            }


            // 4. Update Header Text Alignment
            const profileTexts = profileSection.querySelectorAll('p, h1, div');
            profileTexts.forEach(el => {
                if (el.classList.contains('justify-center')) {
                    el.classList.remove('justify-center');
                    el.classList.add('justify-start');
                }
            });

            // 5. Update Action Buttons (Vibrant & Aligned)
            const btnGrid = document.querySelector('.grid.grid-cols-4');
            btnGrid.classList.remove('grid-cols-4', 'gap-4');
            btnGrid.classList.add('grid-cols-2', 'gap-3');

            btnGrid.querySelectorAll('a').forEach(btn => {
                btn.classList.remove('flex-col', 'items-center', 'gap-2');
                btn.classList.add('flex-row', 'items-center', 'gap-3', 'p-3', 'rounded-xl', 'border', 'transition', 'hover:shadow-md');

                // Color Styling
                btn.style.borderColor = `${pColor}20`; // Very light border
                btn.style.backgroundColor = 'white';

                const iconDiv = btn.querySelector('div');
                // Remove old circle backgrounds
                iconDiv.className = ''; // Reset class
                iconDiv.classList.add('text-2xl');
                iconDiv.style.color = pColor; // Primary color for icons

                const label = btn.querySelector('span');
                label.classList.remove('text-xs', 'text-gray-600');
                label.classList.add('text-sm', 'font-bold', 'text-gray-700');
            });

            // 6. Section Headers (Left Align Borders)
            document.querySelectorAll('.border-l-4').forEach(h2 => {
                h2.style.borderColor = sColor; // Secondary color accent
            });
        }


        // --- SHARE LOGIC ---
        const shareBtn = document.getElementById('btn-share-card'); // Correctly target the share button
        if (shareBtn) {
            shareBtn.onclick = async (e) => {
                e.preventDefault();

                // Track Share
                fetch(`${Auth.API_URL}/card/${userId}/share`, { method: 'POST' }).catch(console.error);

                const shareData = {
                    title: profile.name || 'Digital Business Card',
                    text: `Check out my digital business card: ${profile.name}`,
                    url: window.location.href
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (err) {
                        console.log('Share canceled');
                    }
                } else {
                    // Fallback to WhatsApp
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
                }
            };
        }

        // --- SAVE CONTACT LOGIC ---
        const saveContactBtn = document.getElementById('btn-save-contact');
        if (saveContactBtn) {
            saveContactBtn.onclick = () => {
                const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name || 'Business Contact'}
ORG:${profile.industry || 'KaftyCards User'}
TEL;TYPE=WORK,VOICE:${profile.phone || ''}
EMAIL:${profile.email || ''}
URL:${window.location.href}
ADR;TYPE=WORK:;;${(profile.address || '').replace(/\n/g, ', ')};;;;
END:VCARD`;

                const blob = new Blob([vCard], { type: 'text/vcard' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${(profile.name || 'contact').replace(/\s+/g, '_')}.vcf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        }

        // --- FAVICON LOGIC ---
        if (profile.logo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = profile.logo;
        }

        // --- 2. PROFILE DATA ---
        if (profile.img) document.querySelector('img[alt="Logo"]').src = profile.img;
        document.querySelector('.text-accent-saffron.uppercase').textContent = profile.industry || "Business";
        document.querySelector('#card-desc').textContent = profile.description || "Welcome to our business page.";

        if (document.getElementById('card-address')) document.getElementById('card-address').innerHTML = profile.address.replace(/\n/g, '<br>');
        if (document.getElementById('card-phone')) document.getElementById('card-phone').textContent = profile.phone;
        if (document.getElementById('card-email')) document.getElementById('card-email').textContent = profile.email;

        // Links
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => link.href = `tel:${profile.phone}`);
        const waLinks = document.querySelectorAll('a[href^="https://wa.me"]');
        waLinks.forEach(link => link.href = `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`);


        // --- 3. DYNAMIC SECTIONS ---

        // Services
        const servicesList = document.getElementById('card-services-list');
        if (servicesList && services && services.length > 0) {
            servicesList.innerHTML = '';
            services.forEach(item => {
                servicesList.innerHTML += `
                    <div class="bg-white border border-gray-100 p-3 rounded-lg shadow-sm text-center flex flex-col items-center">
                        <div class="w-12 h-12 mb-2 rounded-full overflow-hidden bg-gray-50">
                            <img src="${item.img}" class="w-full h-full object-cover">
                        </div>
                        <p class="text-sm font-bold text-gray-800 line-clamp-1">${item.title}</p>
                        <p class="text-xs text-gray-500 mt-1 font-bold" style="color: ${pColor}">${item.price}</p>
                        ${item.desc ? `<p class="text-xs text-gray-400 mt-1 line-clamp-2 leading-tight">${item.desc}</p>` : ''}
                    </div>`;
            });
        } else {
            document.getElementById('card-services-section').classList.add('hidden');
        }

        // Portfolio
        const portfolioList = document.getElementById('card-portfolio-list');
        if (portfolioList && portfolio && portfolio.length > 0) {
            document.getElementById('card-portfolio-section').classList.remove('hidden');
            portfolioList.innerHTML = '';
            portfolio.forEach(item => {
                portfolioList.innerHTML += `
                    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                        <div class="h-40 bg-gray-200">
                            <img src="${item.img}" class="w-full h-full object-cover">
                        </div>
                        <div class="p-3">
                            <h3 class="font-bold text-gray-800 text-sm">${item.title}</h3>
                            <p class="text-xs text-gray-500">${item.client || ''}</p>
                        </div>
                    </div>`;
            });
        }

        // Gallery
        const galleryList = document.getElementById('card-gallery-list');
        if (galleryList && gallery && gallery.length > 0) {
            document.getElementById('card-gallery-section').classList.remove('hidden');
            galleryList.innerHTML = '';
            gallery.forEach(url => {
                galleryList.innerHTML += `<div class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"><img src="${url}" class="w-full h-full object-cover hover:scale-105 transition"></div>`;
            });
        }

        // Testimonials
        const testimList = document.getElementById('card-testimonials-list');
        if (testimList && testimonials && testimonials.length > 0) {
            document.getElementById('card-testimonials-section').classList.remove('hidden');
            testimList.innerHTML = '';
            testimonials.forEach(item => {
                testimList.innerHTML += `
                    <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative">
                        <div class="text-yellow-400 text-xs mb-1">${'<i class="fa-solid fa-star"></i>'.repeat(item.rating)}</div>
                        <p class="text-gray-600 text-xs italic mb-2">"${item.text}"</p>
                        <p class="text-gray-800 text-xs font-bold text-right">- ${item.name}</p>
                    </div>`;
            });
        }

        // Customs
        const customContainer = document.getElementById('card-custom-sections');
        if (customContainer && customSections) {
            customContainer.innerHTML = '';
            customSections.forEach(sect => {
                let contentHtml = '';
                if (sect.type === 'text') contentHtml = `<p class="text-gray-600 text-sm leading-relaxed">${sect.content}</p>`;
                else if (sect.type === 'list') contentHtml = `<ul class="space-y-2 mt-2">` + sect.items.map(i => `<li class="flex items-start gap-2 text-sm text-gray-700"><i class="fa-solid fa-check text-green-500 mt-1"></i> ${i}</li>`).join('') + `</ul>`;
                customContainer.innerHTML += `
                    <div class="bg-white border-t border-gray-100 pt-6">
                        <h2 class="text-lg font-bold text-gray-800 mb-3 border-l-4 pl-3" style="border-color: ${pColor}">${sect.title}</h2>
                        ${contentHtml}
                    </div>`;
            });
        }

        // --- NEW: FAQ RENDER ---
        const faqList = document.getElementById('card-faq-list');
        if (faqList && faqs && faqs.length > 0) {
            document.getElementById('card-faq-section').classList.remove('hidden');
            faqList.innerHTML = '';
            faqs.forEach(item => {
                faqList.innerHTML += `
                    <details class="bg-white rounded-lg border border-gray-100 overflow-hidden group">
                        <summary class="px-4 py-3 font-medium text-gray-800 cursor-pointer flex justify-between items-center text-sm">
                            ${item.q}
                            <i class="fa-solid fa-chevron-down text-gray-400 text-xs group-open:rotate-180 transition"></i>
                        </summary>
                        <div class="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-2">
                            ${item.a}
                        </div>
                    </details>`;
            });
        }

        // --- NEW: ENQUIRY FORM LOGIC ---
        const enquiryForm = document.getElementById('card-enquiry-form');
        if (enquiryForm) {
            enquiryForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const formData = {
                    name: this.name.value,
                    phone: this.phone.value,
                    msg: this.msg.value,
                    date: new Date().toLocaleDateString()
                };

                // DIRECT SUBMIT TO API
                fetch(`${Auth.API_URL}/card/${userId}/enquiry`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                    .then(res => res.json())
                    .then(data => {
                        if (!data.success) console.error('Enquiry failed', data);
                    })
                    .catch(err => console.error(err));

                this.reset();
                const successMsg = document.getElementById('enquiry-success');
                successMsg.classList.remove('hidden');
                setTimeout(() => successMsg.classList.add('hidden'), 5000);
            });
        }
    }
});
