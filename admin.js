document.addEventListener('DOMContentLoaded', async () => {

    // 1. Check Auth & Admin Status
    const userId = Auth.getCurrentUser();
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Since we don't store 'isAdmin' in localStorage, we might need to fetch the user profile first
    // Or we simply hit the admin API and handle 401/403 errors.
    // For now, let's try to fetch the list. If it fails, they aren't admin.

    const tableBody = document.getElementById('users-table-body');
    const logoutBtn = document.getElementById('btn-logout');

    logoutBtn.addEventListener('click', () => {
        Auth.logout();
    });

    try {
        const res = await fetch(`${Auth.API_URL}/admin/users`);
        const data = await res.json();

        if (!data.success) {
            alert('Access Denied: You are not an admin.');
            window.location.href = 'dashboard.html';
            return;
        }

        let allUsers = data.users; // Store for filtering
        renderUsers(allUsers);

        // --- SEARCH LOGIC ---
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allUsers.filter(user =>
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                (user.card && user.card.phone && user.card.phone.includes(term))
            );
            renderUsers(filtered);
        });

        // --- EXPORT LOGIC ---
        const exportBtn = document.getElementById('btn-export');
        exportBtn.addEventListener('click', () => {
            if (allUsers.length === 0) return alert('No data to export');

            const headers = ['Name', 'Email', 'Phone', 'Joined Date', 'Card Status', 'Total Views', 'Total Shares'];
            const rows = allUsers.map(user => [
                user.name,
                user.email,
                user.card ? user.card.phone : '',
                new Date(user.createdAt).toLocaleDateString(),
                user.card ? 'Active' : 'Pending',
                user.card ? user.card.views : 0,
                user.card ? user.card.shares : 0
            ]);

            let csvContent = "data:text/csv;charset=utf-8,"
                + headers.join(",") + "\n"
                + rows.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "kaftycards_users.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

    } catch (err) {
        console.error(err);
        alert('Error loading admin panel.');
    }

    function renderUsers(users) {
        // Update Stats
        document.getElementById('total-users').textContent = users.length;

        tableBody.innerHTML = '';
        if (users.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No users found.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const cardLink = user.card ? `card.html?uid=${user.card.slug}` : '#';
            const cardStatus = user.card ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>' : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>';
            const views = user.card ? user.card.views : 0;
            const shares = user.card ? user.card.shares : 0;
            const phone = user.card ? user.card.phone : '';
            const isAdmin = user.isAdmin ? '<span class="ml-2 text-[10px] text-purple-600 font-bold border border-purple-200 bg-purple-50 px-1.5 py-0.5 rounded uppercase">Admin</span>' : '';

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition border-b border-gray-100 group';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-primary-blue to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-bold text-gray-900 flex items-center">
                                ${user.name} ${isAdmin}
                            </div>
                            <div class="text-xs text-gray-400 mt-0.5">Joined: ${new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col space-y-1">
                        <a href="mailto:${user.email}" class="flex items-center text-sm text-gray-600 hover:text-primary-blue transition">
                            <i class="fa-solid fa-envelope w-5 text-gray-400"></i> ${user.email}
                        </a>
                        ${phone ? `
                        <a href="tel:${phone}" class="flex items-center text-sm text-gray-600 hover:text-primary-blue transition">
                            <i class="fa-solid fa-phone w-5 text-gray-400"></i> ${phone}
                        </a>` : '<span class="text-xs text-gray-400 italic pl-5">No phone</span>'}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                             ${cardStatus}
                             ${user.card ? `<a href="${cardLink}" target="_blank" class="block text-xs text-blue-500 font-medium hover:underline mt-1">View Card <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i></a>` : ''}
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-500">
                             <div class="text-center" title="Total Views">
                                <i class="fa-solid fa-eye text-blue-400 block mb-0.5"></i> ${views}
                             </div>
                             <div class="text-center" title="Total Shares">
                                <i class="fa-solid fa-share-nodes text-orange-400 block mb-0.5"></i> ${shares}
                             </div>
                        </div>
                    </div>
                </td>
                <!-- 
                <td class="px-6 py-4 text-center">
                     <button class="text-gray-300 hover:text-red-500 transition disabled cursor-not-allowed" title="Delete Disabled">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td> 
                -->
            `;
            tableBody.appendChild(row);
        });
    }
});
