document.addEventListener('DOMContentLoaded', function () {

    // --- AUTH CHECK ---
    const userId = Auth.getCurrentUser();
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // --- Load Data ---
    let appData = Auth.getData(userId);
    if (!appData) {
        // Fallback should not happen due to seeding, but just in case
        Auth.init();
        appData = Auth.getData(userId);
    }

    // Integrity Checks
    if (!appData.profile.logo) appData.profile.logo = "";
    if (!appData.customSections) appData.customSections = [];
    if (!appData.faqs) appData.faqs = [];

    function saveData() {
        Auth.saveData(userId, appData);
    }

    // --- Update View Card Button Logic (Add ?uid param) ---
    document.querySelectorAll('[onclick*="card.html"]').forEach(btn => {
        btn.setAttribute('onclick', `window.open('card.html?uid=${userId}', '_blank')`);
    });
    document.getElementById('profile-preview').parentElement.parentElement.parentElement // Find Share Card button context if complex
    // Or just simple bind

    // Update "Share Card" button if exists
    const shareBtn = document.querySelector('.fa-whatsapp')?.parentElement;
    if (shareBtn) {
        shareBtn.onclick = () => {
            const url = window.location.origin + window.location.pathname.replace('dashboard.html', `card.html?uid=${userId}`);
            window.open(`https://wa.me/?text=Check out my digital card: ${encodeURIComponent(url)}`, '_blank');
        };
    }

    // --- Navigation (Keep existing) ---
    const navLinks = document.querySelectorAll('.dashboard-nav-link');
    const views = document.querySelectorAll('.dashboard-view');
    function switchView(targetId) {
        views.forEach(view => view.classList.add('hidden'));
        document.getElementById(targetId)?.classList.remove('hidden');
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('bg-blue-800', 'text-white');
                link.classList.remove('text-blue-100');
            } else {
                link.classList.remove('bg-blue-800', 'text-white');
                link.classList.add('text-blue-100');
            }
        });
    }
    navLinks.forEach(link => link.addEventListener('click', function (e) { e.preventDefault(); switchView(this.getAttribute('data-target')); }));
    switchView('view-dashboard');


    // --- Helpers ---
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    let toastTimeout;
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
    }
    const fileToDataUri = (file) => new Promise((resolve) => {
        if (!file) resolve(null);
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
    });


    // --- Profile Logic ---
    function renderProfileInputs() {
        if (document.getElementById('input-name')) {
            document.getElementById('input-name').value = appData.profile.name;
            document.getElementById('input-phone').value = appData.profile.phone;
            document.getElementById('input-whatsapp').value = appData.profile.whatsapp;
            document.getElementById('input-email').value = appData.profile.email;
            document.getElementById('input-desc').value = appData.profile.description;
            document.getElementById('profile-preview').src = appData.profile.img;
            document.getElementById('input-address').value = appData.profile.address;
            document.getElementById('input-hours').value = appData.profile.hours;
            document.getElementById('input-map').value = appData.profile.map || '';

            // Logo Preview
            const logoPrev = document.getElementById('logo-preview');
            if (logoPrev) logoPrev.src = appData.profile.logo || "https://via.placeholder.com/100?text=Logo";

            // Update Welcome Message
            const welcomeMsg = document.getElementById('welcome-msg');
            if (welcomeMsg) welcomeMsg.textContent = `Namaste, ${appData.profile.name}`;
        }
    }

    const profileForm = document.querySelector('#view-profile form');
    if (profileForm) {
        profileForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            appData.profile.name = document.getElementById('input-name').value;
            appData.profile.phone = document.getElementById('input-phone').value;
            appData.profile.whatsapp = document.getElementById('input-whatsapp').value;
            appData.profile.email = document.getElementById('input-email').value;
            appData.profile.description = document.getElementById('input-desc').value;
            appData.profile.address = document.getElementById('input-address').value;
            appData.profile.map = document.getElementById('input-map').value;
            appData.profile.hours = document.getElementById('input-hours').value;

            // Profile Photo
            const fileInput = document.getElementById('profile-upload');
            if (fileInput.files[0]) {
                appData.profile.img = await fileToDataUri(fileInput.files[0]);
                document.getElementById('profile-preview').src = appData.profile.img;
            }

            // Logo Upload
            const logoInput = document.getElementById('logo-upload');
            if (logoInput.files[0]) {
                appData.profile.logo = await fileToDataUri(logoInput.files[0]);
                document.getElementById('logo-preview').src = appData.profile.logo;
            }

            saveData();
            showToast('Profile Updated!');
        });
    }

    // --- Settings Logic ---
    function renderSettings() {
        // Layout
        const currentLayout = appData.settings.layout || 'standard';
        if (currentLayout === 'modern') {
            document.getElementById('layout-modern').checked = true;
        } else {
            document.getElementById('layout-standard').checked = true;
        }
        updateVisuals(); // Helper to update selected border styles

        // Colors is handled by renderThemes/color pickers init
        document.getElementById('primary-color-picker').value = appData.settings.color || '#2C3E50';
        document.getElementById('secondary-color-picker').value = appData.settings.secondaryColor || '#F39C12';
    }

    function updateVisuals() {
        // Layout Visuals
        document.querySelectorAll('input[name="layout"]').forEach(radio => {
            const label = radio.parentElement;
            if (radio.checked) {
                label.classList.add('border-2', 'border-primary-blue', 'bg-blue-50');
                label.classList.remove('border-gray-200');
            } else {
                label.classList.remove('border-2', 'border-primary-blue', 'bg-blue-50');
                label.classList.add('border-gray-200');
            }
        });
    }

    // Change Listeners
    document.querySelectorAll('input[name="layout"]').forEach(radio => {
        radio.addEventListener('change', updateVisuals);
    });

    document.getElementById('btn-update-settings')?.addEventListener('click', () => {
        // Save Layout
        const selectedLayout = document.querySelector('input[name="layout"]:checked')?.value || 'standard';
        appData.settings.layout = selectedLayout;

        // Save Colors (Manual Picker)
        appData.settings.color = document.getElementById('primary-color-picker').value;
        appData.settings.secondaryColor = document.getElementById('secondary-color-picker').value;

        // Save Button Visibility (Future implementation, checkboxes placeholders currently)
        // ...

        saveData();
        showToast('Card Settings Updated!');
    });

    // --- Modal & Renders ---
    const modal = document.getElementById('modal-backdrop');
    function openModal(title, html) { document.getElementById('modal-title').textContent = title; document.getElementById('modal-content').innerHTML = html; modal.classList.remove('hidden'); }
    function closeModal() { modal.classList.add('hidden'); }
    modal.querySelector('#modal-close').addEventListener('click', closeModal);

    // Render Functions
    function renderServices() {
        const c = document.getElementById('services-list'); c.innerHTML = '';
        if (appData.services.length === 0) c.innerHTML = '<p class="text-gray-400 py-4 text-center">No services.</p>';
        else appData.services.forEach(i => c.innerHTML += `
            <div class="bg-white p-4 rounded-xl border flex gap-4">
                <img src="${i.img}" class="w-16 h-16 rounded object-cover">
                <div class="flex-1">
                    <h3 class="font-bold">${i.title}</h3>
                    <p class="text-sm text-gray-500 font-bold">${i.price}</p>
                    ${i.desc ? `<p class="text-xs text-gray-400 mt-1 line-clamp-2">${i.desc}</p>` : ''}
                </div>
                <button onclick="deleteService(${i.id})" class="text-red-500"><i class="fa fa-trash"></i></button>
            </div>`);
    }
    function renderPortfolio() {
        const c = document.getElementById('portfolio-list'); c.innerHTML = '';
        appData.portfolio.forEach(i => c.innerHTML += `<div class="bg-white rounded-xl border overflow-hidden"><img src="${i.img}" class="h-32 w-full object-cover"><div class="p-2 relative"><h3 class="font-bold text-sm">${i.title}</h3><button onclick="deletePortfolio(${i.id})" class="absolute top-[-110px] right-2 bg-white text-red-500 p-1 rounded"><i class="fa fa-trash"></i></button></div></div>`);
    }
    function renderGallery() {
        const c = document.getElementById('gallery-list'); c.innerHTML = '';
        appData.gallery.forEach((url, i) => c.innerHTML += `<div class="aspect-square bg-gray-100 rounded relative"><img src="${url}" class="w-full h-full object-cover"><button onclick="deleteGalleryImage(${i})" class="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 flex justify-center items-center"><i class="fa fa-times"></i></button></div>`);
    }
    function renderTestimonials() {
        const c = document.getElementById('testimonials-list'); c.innerHTML = '';
        appData.testimonials.forEach(i => c.innerHTML += `<div class="bg-white p-4 rounded border relative"><button onclick="deleteTestimonial(${i.id})" class="absolute top-2 right-2 text-gray-400"><i class="fa fa-trash"></i></button><h3 class="font-bold">${i.name}</h3><p class="text-xs">"${i.text}"</p></div>`);
    }
    function renderCustomSections() {
        const c = document.getElementById('custom-sections-list'); c.innerHTML = '';
        appData.customSections.forEach(i => c.innerHTML += `<div class="bg-white p-4 rounded border flex justify-between"><div><span class="bg-blue-50 px-2 py-1 text-xs font-bold rounded">${i.type}</span> ${i.title}</div><button onclick="deleteCustomSection(${i.id})" class="text-red-500"><i class="fa fa-trash"></i></button></div>`);
    }
    function renderFAQs() {
        const c = document.getElementById('faq-list'); c.innerHTML = '';
        if (appData.faqs.length === 0) c.innerHTML = '<p class="text-gray-400 py-4 text-center">No FAQs.</p>';
        else appData.faqs.forEach(i => c.innerHTML += `<div class="bg-white p-4 rounded border relative"><button onclick="deleteFAQ(${i.id})" class="absolute top-2 right-2 text-gray-400 hover:text-red-500"><i class="fa fa-trash"></i></button><h3 class="font-bold text-primary-blue">Q: ${i.q}</h3><p class="text-sm mt-1">${i.a}</p></div>`);
    }
    function renderEnquiries() {
        const c = document.getElementById('enquiries-list'); c.innerHTML = '';
        if (appData.enquiries.length === 0) c.innerHTML = '<div class="text-center py-8 bg-white border rounded"><p class="text-gray-500">Inbox empty.</p></div>';
        else[...appData.enquiries].reverse().forEach((i, idx) => c.innerHTML += `<div class="bg-white p-4 rounded border relative"><button onclick="deleteEnquiry(${appData.enquiries.length - 1 - idx})" class="absolute top-2 right-2 text-gray-300 hover:text-red-500"><i class="fa fa-trash"></i></button><h3 class="font-bold">${i.name}</h3><p class="text-xs text-gray-500">${i.date || ''}</p><p class="text-sm mt-1 bg-gray-50 p-2 rounded">"${i.msg}"</p><a href="https://wa.me/${i.phone}" target="_blank" class="text-green-600 text-xs font-bold mt-2 inline-block">Reply WhatsApp</a></div>`);
    }
    function renderThemes() {
        const t = [
            { p: '#2C3E50', s: '#F39C12' }, // Corporate (Default)
            { p: '#1a237e', s: '#c2185b' }, // Royal Blue/Pink
            { p: '#004d40', s: '#ffca28' }, // Teal/Amber
            { p: '#b71c1c', s: '#212121' }, // Red/Black
            { p: '#4a148c', s: '#00e5ff' }, // Purple/Cyan
            { p: '#1b5e20', s: '#aeea00' }, // Forest/Lime
            { p: '#3e2723', s: '#d7ccc8' }, // Brown/Beige
            { p: '#263238', s: '#ff5722' }, // Dark/Orange
            { p: '#0d47a1', s: '#ffeb3b' }, // Navy/Yellow
            { p: '#000000', s: '#ffffff' }  // Black/White
        ];
        const c = document.getElementById('theme-grid');
        if (c) {
            c.innerHTML = '';
            t.forEach(x => {
                c.innerHTML += `
                <button type="button" onclick="applyTheme('${x.p}','${x.s}')" 
                    class="h-12 w-full border-2 border-gray-200 rounded-lg overflow-hidden flex hover:scale-105 transition hover:shadow-md hover:border-blue-500" 
                    title="Primary: ${x.p}, Secondary: ${x.s}">
                    <div class="w-1/2 h-full" style="background:${x.p}"></div>
                    <div class="w-1/2 h-full" style="background:${x.s}"></div>
                </button>`;
            });
        }
    }


    // --- Global Actions ---
    window.deleteService = function (id) { if (confirm('Delete?')) { appData.services = appData.services.filter(x => x.id !== id); saveData(); renderServices(); showToast('Deleted'); } };
    window.deletePortfolio = function (id) { if (confirm('Delete?')) { appData.portfolio = appData.portfolio.filter(x => x.id !== id); saveData(); renderPortfolio(); showToast('Deleted'); } };
    window.deleteGalleryImage = function (i) { if (confirm('Delete?')) { appData.gallery.splice(i, 1); saveData(); renderGallery(); showToast('Deleted'); } };
    window.deleteTestimonial = function (id) { if (confirm('Delete?')) { appData.testimonials = appData.testimonials.filter(x => x.id !== id); saveData(); renderTestimonials(); showToast('Deleted'); } };
    window.deleteCustomSection = function (id) { if (confirm('Delete?')) { appData.customSections = appData.customSections.filter(x => x.id !== id); saveData(); renderCustomSections(); showToast('Deleted'); } };
    window.deleteFAQ = function (id) { if (confirm('Delete?')) { appData.faqs = appData.faqs.filter(x => x.id !== id); saveData(); renderFAQs(); showToast('Deleted'); } };
    window.deleteEnquiry = function (i) { if (confirm('Delete?')) { appData.enquiries.splice(i, 1); saveData(); renderEnquiries(); showToast('Deleted'); } };
    window.applyTheme = function (p, s) { document.getElementById('primary-color-picker').value = p; document.getElementById('secondary-color-picker').value = s; appData.settings.color = p; appData.settings.secondaryColor = s; saveData(); showToast('Theme Applied'); };


    // --- Add Buttons ---
    // --- Add Buttons ---
    document.getElementById('btn-add-service').onclick = () => {
        openModal('Add Service', `
            <form id="fs" class="space-y-3">
                <input id="st" placeholder="Name" class="w-full border p-2 rounded" required>
                <input id="sp" placeholder="Price" class="w-full border p-2 rounded">
                <textarea id="sd" placeholder="Description (Optional)" class="w-full border p-2 rounded h-20"></textarea>
                <input type="file" id="si" class="w-full">
                <button class="w-full bg-blue-800 text-white py-2 rounded">Add</button>
            </form>
        `);
        document.getElementById('fs').onsubmit = async (e) => {
            e.preventDefault();
            let img = "https://images.unsplash.com/photo-1581094794320-c91bed78281f?w=200&q=80";
            const f = document.getElementById('si').files[0];
            if (f) img = await fileToDataUri(f);
            appData.services.push({
                id: Date.now(),
                title: document.getElementById('st').value,
                price: document.getElementById('sp').value,
                desc: document.getElementById('sd').value,
                img
            });
            saveData();
            renderServices();
            closeModal();
            showToast('Added');
        }
    };

    document.getElementById('btn-add-portfolio').onclick = () => { openModal('Add Work', `<form id="fp" class="space-y-3"><input id="pt" placeholder="Title" class="w-full border p-2 rounded" required><input id="pc" placeholder="Client" class="w-full border p-2 rounded"><input type="file" id="pi" class="w-full"><button class="w-full bg-blue-800 text-white py-2 rounded">Add</button></form>`); document.getElementById('fp').onsubmit = async (e) => { e.preventDefault(); let img = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80"; const f = document.getElementById('pi').files[0]; if (f) img = await fileToDataUri(f); appData.portfolio.push({ id: Date.now(), title: document.getElementById('pt').value, client: document.getElementById('pc').value, img }); saveData(); renderPortfolio(); closeModal(); showToast('Added'); } };

    document.getElementById('btn-add-gallery').onclick = () => {
        const modalHtml = `
            <div id="drop-zone" class="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                <input type="file" id="gi" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" multiple>
                <div class="pointer-events-none">
                    <i class="fa-solid fa-cloud-arrow-up text-3xl text-primary-blue mb-2"></i>
                    <p class="text-gray-600 font-medium">Drag & Drop images here</p>
                    <p class="text-xs text-gray-400 mt-1">or click to browse</p>
                </div>
            </div>
            <div id="preview-area" class="mt-4 grid grid-cols-3 gap-2"></div>
            <button id="upload-btn" class="w-full bg-primary-blue text-white py-2 rounded-lg mt-4 hidden">Upload Selected</button>
        `;

        openModal('Upload Images', modalHtml);

        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('gi');
        const previewArea = document.getElementById('preview-area');
        const uploadBtn = document.getElementById('upload-btn');
        let selectedFiles = [];

        // Drag & Drop Visuals
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('border-primary-blue', 'bg-blue-50');
            }, false)
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('border-primary-blue', 'bg-blue-50');
            }, false)
        });

        // Handle File Selection
        const handleFiles = (files) => {
            if (!files.length) return;
            selectedFiles = [...selectedFiles, ...Array.from(files)];
            updatePreview();
        };

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        });

        fileInput.addEventListener('change', function () {
            handleFiles(this.files);
        });

        // Update Preview
        function updatePreview() {
            previewArea.innerHTML = '';
            if (selectedFiles.length > 0) {
                uploadBtn.classList.remove('hidden');
                selectedFiles.forEach((file, index) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewArea.innerHTML += `
                            <div class="relative bg-gray-100 rounded overflow-hidden aspect-square">
                                <img src="${e.target.result}" class="w-full h-full object-cover">
                                <button onclick="window.removeSelectedFile(${index})" class="absolute top-1 right-1 bg-white text-red-500 rounded-full w-5 h-5 flex justify-center items-center shadow-sm text-xs"><i class="fa fa-times"></i></button>
                            </div>`;
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                uploadBtn.classList.add('hidden');
            }
        }

        // Global helper for the preview remove button limitation (quick hack for modal scope)
        window.removeSelectedFile = (index) => {
            selectedFiles.splice(index, 1);
            updatePreview();
        };

        // Upload Action
        uploadBtn.onclick = async () => {
            uploadBtn.textContent = 'Uploading...';
            uploadBtn.disabled = true;

            for (const file of selectedFiles) {
                const base64 = await fileToDataUri(file);
                appData.gallery.push(base64);
            }

            saveData();
            renderGallery();
            closeModal();
            showToast('Images Uploaded!');
            delete window.removeSelectedFile; // Cleanup
        };
    };

    document.getElementById('btn-add-testimonial').onclick = () => { openModal('Add Review', `<form id="ft" class="space-y-3"><input id="tn" placeholder="Name" class="w-full border p-2 rounded" required><textarea id="tt" placeholder="Review" class="w-full border p-2 rounded" required></textarea><button class="w-full bg-blue-800 text-white py-2 rounded">Add</button></form>`); document.getElementById('ft').onsubmit = (e) => { e.preventDefault(); appData.testimonials.push({ id: Date.now(), name: document.getElementById('tn').value, text: document.getElementById('tt').value }); saveData(); renderTestimonials(); closeModal(); showToast('Added'); } };

    document.getElementById('btn-add-custom').onclick = () => { openModal('Add Section', `<form id="fc" class="space-y-3"><input id="ct" placeholder="Title" class="w-full border p-2 rounded" required><select id="cy" class="w-full border p-2 rounded"><option value="text">Text</option><option value="list">List</option></select><textarea id="cc" class="w-full border p-2 rounded h-20" placeholder="Content (comma sep for list)"></textarea><button class="w-full bg-blue-800 text-white py-2 rounded">Add</button></form>`); document.getElementById('fc').onsubmit = (e) => { e.preventDefault(); const y = document.getElementById('cy').value; const i = { id: Date.now(), title: document.getElementById('ct').value, type: y }; if (y === 'list') i.items = document.getElementById('cc').value.split(','); else i.content = document.getElementById('cc').value; appData.customSections.push(i); saveData(); renderCustomSections(); closeModal(); showToast('Added'); } };

    document.getElementById('btn-add-faq').onclick = () => { openModal('Add FAQ', `<form id="ff" class="space-y-3"><input id="fq" placeholder="Question" class="w-full border p-2 rounded" required><textarea id="fa" placeholder="Answer" class="w-full border p-2 rounded h-20" required></textarea><button class="w-full bg-blue-800 text-white py-2 rounded">Add</button></form>`); document.getElementById('ff').onsubmit = (e) => { e.preventDefault(); appData.faqs.push({ id: Date.now(), q: document.getElementById('fq').value, a: document.getElementById('fa').value }); saveData(); renderFAQs(); closeModal(); showToast('Added'); } };

    // Init

    // Expose applyTheme globally
    window.applyTheme = function (p, s) {
        document.getElementById('primary-color-picker').value = p;
        document.getElementById('secondary-color-picker').value = s;
        showToast('Theme Colors Applied! Click "Update Card" to Save.');
    };

    renderProfileInputs(); renderSettings(); renderThemes(); renderServices(); renderPortfolio(); renderGallery(); renderTestimonials(); renderCustomSections(); renderFAQs(); renderEnquiries();

    document.querySelectorAll('.btn-save-section').forEach(b => b.addEventListener('click', () => showToast('Saved')));
});
