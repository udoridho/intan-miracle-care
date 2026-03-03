document.addEventListener('DOMContentLoaded', async () => {
    const authContainer = document.getElementById('authContainer');
    const profileContainer = document.getElementById('profileContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const profileForm = document.getElementById('profileForm');
    const authMessage = document.getElementById('authMessage');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const logoutBtn = document.getElementById('logoutBtn');

    // UI Tab Switching
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }

    // Check current session
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (session) {
        showProfile(session.user);
    } else {
        showAuth();
    }

    function showAuth() {
        if (authContainer) authContainer.style.display = 'block';
        if (profileContainer) profileContainer.style.display = 'none';
    }

    async function showProfile(user) {
        if (authContainer) authContainer.style.display = 'none';
        if (profileContainer) profileContainer.style.display = 'block';

        document.getElementById('displayEmail').textContent = user.email;

        // Fetch profile from members table
        const { data: profile, error } = await window.supabaseClient
            .from('members')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            document.getElementById('displayNamaIbu').textContent = profile.nama_ibu || 'Member';
            document.getElementById('profNamaIbu').value = profile.nama_ibu || '';
            document.getElementById('profNamaBayi').value = profile.nama_bayi || '';
            document.getElementById('profUsiaBayi').value = profile.usia_bayi || '';
            document.getElementById('profWhatsapp').value = profile.whatsapp || '';
            document.getElementById('profAlamat').value = profile.alamat || '';
        }
    }

    // Login logic
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                authMessage.textContent = '❌ ' + error.message;
                authMessage.style.color = 'red';
            } else {
                window.location.reload();
            }
        });
    }

    // Register logic
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            const { data, error } = await window.supabaseClient.auth.signUp({
                email,
                password,
            });

            if (error) {
                authMessage.textContent = '❌ ' + error.message;
                authMessage.style.color = 'red';
            } else {
                authMessage.textContent = '✅ Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.';
                authMessage.style.color = 'green';
            }
        });
    }

    // Profile update logic
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = (await window.supabaseClient.auth.getUser()).data.user;

            const profileData = {
                id: user.id,
                nama_ibu: document.getElementById('profNamaIbu').value,
                nama_bayi: document.getElementById('profNamaBayi').value,
                usia_bayi: document.getElementById('profUsiaBayi').value,
                whatsapp: document.getElementById('profWhatsapp').value,
                alamat: document.getElementById('profAlamat').value,
            };

            const { error } = await window.supabaseClient
                .from('members')
                .upsert(profileData);

            if (error) {
                alert('❌ Gagal menyimpan profil: ' + error.message);
            } else {
                alert('✅ Profil berhasil diperbarui!');
                document.getElementById('displayNamaIbu').textContent = profileData.nama_ibu || 'Member';
            }
        });
    }

    // Logout logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await window.supabaseClient.auth.signOut();
            window.location.reload();
        });
    }
});
