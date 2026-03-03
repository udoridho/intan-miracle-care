document.addEventListener('DOMContentLoaded', async () => {
    const loginOverlay = document.getElementById('loginOverlay');
    const reservationsBody = document.getElementById('reservationsBody');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Stats elements
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');
    const monthCount = document.getElementById('monthCount');

    // Check session
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (!session) {
        loginOverlay.style.display = 'flex';
        return;
    }

    // Attempt to fetch to check RLS / Admin access
    loginOverlay.style.display = 'none';
    fetchReservations();

    async function fetchReservations() {
        const { data, error } = await window.supabaseClient
            .from('reservations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reservations:', error);
            if (error.code === '42501') {
                alert('Akses Ditolak: Anda bukan Admin atau RLS belum diatur.');
                window.location.href = 'member.html';
            }
            return;
        }

        renderReservations(data);
        updateStats(data);
    }

    function renderReservations(reservations) {
        reservationsBody.innerHTML = '';
        reservations.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${formatDate(res.tanggal)}</strong><br>
                    <small>${res.jam}</small>
                </td>
                <td>
                    <strong>${res.nama_ibu}</strong><br>
                    <small>${res.nama_bayi || '-'} (${res.usia_bayi || '-'})</small>
                </td>
                <td>
                    <a href="https://wa.me/${res.whatsapp.replace(/\D/g, '')}" target="_blank" style="color: var(--pink-600); font-weight: 600;">${res.whatsapp}</a><br>
                    <small style="display: block; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${res.alamat}">${res.alamat}</small>
                </td>
                <td>${res.layanan}</td>
                <td><span class="status-badge status-${res.status}">${res.status}</span></td>
                <td>
                    <select class="status-select" data-id="${res.id}">
                        <option value="pending" ${res.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${res.status === 'confirmed' ? 'selected' : ''}>Confirm</option>
                        <option value="completed" ${res.status === 'completed' ? 'selected' : ''}>Done</option>
                        <option value="cancelled" ${res.status === 'cancelled' ? 'selected' : ''}>Cancel</option>
                    </select>
                </td>
            `;
            reservationsBody.appendChild(row);
        });

        // Add event listeners for status change
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.dataset.id;
                const newStatus = e.target.value;
                await updateStatus(id, newStatus);
            });
        });
    }

    async function updateStatus(id, status) {
        const { error } = await window.supabaseClient
            .from('reservations')
            .update({ status })
            .eq('id', id);

        if (error) {
            alert('Gagal memperbarui status: ' + error.message);
        } else {
            fetchReservations(); // Refresh
        }
    }

    function updateStats(data) {
        totalCount.textContent = data.length;
        pendingCount.textContent = data.filter(r => r.status === 'pending').length;

        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        monthCount.textContent = data.filter(r => {
            const date = new Date(r.created_at);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).length;
    }

    function formatDate(dateStr) {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    }

    refreshBtn.addEventListener('click', fetchReservations);
    logoutBtn.addEventListener('click', async () => {
        await window.supabaseClient.auth.signOut();
        window.location.href = 'member.html';
    });
});
