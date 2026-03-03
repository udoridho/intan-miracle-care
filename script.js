// ============================================
// INTAN MIRACLE — Main Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // --- Mobile Nav Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.navbar-nav');
    const navOverlay = document.querySelector('.nav-overlay');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        if (navOverlay) {
            navOverlay.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close nav on link click (mobile)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                if (navOverlay) navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Scroll Animations ---
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    if (animateElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        animateElements.forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.08}s`;
            observer.observe(el);
        });
    }

    // --- Mobile Hero Slider Dots ---
    const heroTrack = document.querySelector('.hero-slider-track');
    const heroDots = document.querySelectorAll('.hero-slider-dots .dot');

    if (heroTrack && heroDots.length > 0) {
        let heroAutoSlideInterval;

        const startHeroAutoSlide = () => {
            // Only auto-slide on mobile where slider is active
            if (window.innerWidth <= 1024) {
                heroAutoSlideInterval = setInterval(() => {
                    const slideWidth = heroTrack.clientWidth;
                    const maxScroll = heroTrack.scrollWidth - slideWidth;

                    let nextScroll = heroTrack.scrollLeft + slideWidth;

                    // If we've reached the end, go back to start
                    if (nextScroll > maxScroll + 10) {
                        nextScroll = 0;
                    }

                    heroTrack.scrollTo({
                        left: nextScroll,
                        behavior: 'smooth'
                    });
                }, 4000); // Slide every 4 seconds
            }
        };

        const stopHeroAutoSlide = () => {
            clearInterval(heroAutoSlideInterval);
        };

        heroTrack.addEventListener('scroll', () => {
            // Calculate which slide is mostly in view based on scrollLeft
            const scrollPos = heroTrack.scrollLeft;
            const slideWidth = heroTrack.clientWidth;
            // Prevent division by zero
            if (slideWidth > 0) {
                const activeIndex = Math.round(scrollPos / slideWidth);
                heroDots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeIndex);
                });
            }
        });

        // Click on dots to scroll to slide
        heroDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopHeroAutoSlide(); // Pause auto-slide when user interacts
                const slideWidth = heroTrack.clientWidth;
                heroTrack.scrollTo({
                    left: index * slideWidth,
                    behavior: 'smooth'
                });
                startHeroAutoSlide(); // Resume after interaction
            });
        });

        // Pause auto-slide when user interacts via touch
        heroTrack.addEventListener('touchstart', stopHeroAutoSlide, { passive: true });
        heroTrack.addEventListener('touchend', startHeroAutoSlide, { passive: true });

        // Start auto-slide initially
        setTimeout(() => {
            startHeroAutoSlide();
        }, 1000); // Delay start slightly

        // Handle window resize accurately
        window.addEventListener('resize', () => {
            stopHeroAutoSlide();
            startHeroAutoSlide();
        });
    }

    // --- Reservation Form ---
    const form = document.getElementById('reservationForm');

    // Auto-fill member data if logged in
    async function checkAndPrefillMember() {
        if (typeof window.supabaseClient !== 'undefined' && form) {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (session) {
                const { data: profile } = await window.supabaseClient
                    .from('members')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    if (document.getElementById('namaIbu')) document.getElementById('namaIbu').value = profile.nama_ibu || '';
                    if (document.getElementById('namaBayi')) document.getElementById('namaBayi').value = profile.nama_bayi || '';
                    if (document.getElementById('usiaBayi')) document.getElementById('usiaBayi').value = profile.usia_bayi || '';
                    if (document.getElementById('whatsapp')) document.getElementById('whatsapp').value = profile.whatsapp || '';
                    if (document.getElementById('alamat')) document.getElementById('alamat').value = profile.alamat || '';
                }
            }
        }
    }
    checkAndPrefillMember();

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nama = form.querySelector('#namaIbu').value;
            const namaBayi = form.querySelector('#namaBayi').value;
            const usiaBayi = form.querySelector('#usiaBayi').value;
            const whatsapp = form.querySelector('#whatsapp').value;
            const layanan = form.querySelector('#layanan').value;
            const tanggal = form.querySelector('#tanggal').value;
            const jam = form.querySelector('#jam').value;
            const alamat = form.querySelector('#alamat').value;
            const catatan = form.querySelector('#catatan').value;

            // Format WA message with icons and aligned colons (exactly as contoh.jpeg)
            const message =
                `Halo Intan Miracle! 🌸

👤 Nama Ibu     : ${nama}
👶 Nama Bayi    : ${namaBayi || '-'}
🍼 Usia Bayi    : ${usiaBayi || '-'}
✨ Layanan      : ${layanan}
📅 Tanggal      : ${tanggal}
⏰ Jam          : ${jam}
📍 Alamat       : ${alamat}
📝 Catatan      : ${catatan || '-'}

Terima kasih! ✨`;

            const waNumber = '6285267474943';
            const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

            // 1. Save to Supabase (Database)
            const saveReservation = async () => {
                if (typeof window.supabaseClient !== 'undefined') {
                    const { data: { session } } = await window.supabaseClient.auth.getSession();
                    const reservationData = {
                        user_id: session ? session.user.id : null,
                        nama_ibu: nama,
                        nama_bayi: namaBayi,
                        usia_bayi: usiaBayi,
                        whatsapp: whatsapp,
                        layanan: layanan,
                        tanggal: tanggal,
                        jam: jam,
                        alamat: alamat,
                        catatan: catatan
                    };

                    const { error } = await window.supabaseClient
                        .from('reservations')
                        .insert(reservationData);

                    if (error) {
                        console.error('Error saving reservation:', error);
                    }
                }
            };

            // Show success feedback
            const submitBtn = form.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⌛ Memproses Reservasi...';
            submitBtn.style.pointerEvents = 'none';

            // Save then show success
            saveReservation().then(() => {
                setTimeout(() => {
                    submitBtn.innerHTML = '✅ Reservasi Berhasil! Terima kasih.';
                    form.reset(); // Clear the form

                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.pointerEvents = '';
                    }, 5000);
                }, 800);
            });
        });
    }

    // --- Active Nav Link ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Counter Animation (for stats if any) ---
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    let current = 0;
                    const increment = target / 40;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        entry.target.textContent = Math.floor(current) + '+';
                    }, 30);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    // --- Custom Time Picker Logic (Scroll Version) ---
    const timeInput = document.getElementById('jam');
    const timePicker = document.getElementById('timePicker');
    const hourColumn = document.getElementById('hourColumn');
    const minColumn = document.getElementById('minColumn');
    const closePicker = document.querySelector('.close-picker');
    const confirmTimeBtn = document.querySelector('.confirm-time');

    if (timeInput && timePicker) {
        const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')); // 00-23
        const mins = ['00', '15', '30', '45'];

        const createOptions = (container, data) => {
            container.innerHTML = '';
            data.forEach(val => {
                const opt = document.createElement('div');
                opt.className = 'time-option';
                opt.textContent = val;
                opt.dataset.value = val;
                container.appendChild(opt);
            });

            container.addEventListener('scroll', () => {
                const scrollTop = container.scrollTop;
                const index = Math.round(scrollTop / 44);
                const options = container.querySelectorAll('.time-option');
                options.forEach((opt, i) => {
                    opt.classList.toggle('active', i === index);
                });
            });
        };

        createOptions(hourColumn, hours);
        createOptions(minColumn, mins);

        const getSelectedTime = () => {
            const h = hourColumn.querySelectorAll('.time-option')[Math.round(hourColumn.scrollTop / 44)]?.dataset.value || '08';
            const m = minColumn.querySelectorAll('.time-option')[Math.round(minColumn.scrollTop / 44)]?.dataset.value || '00';
            return `${h}:${m}`;
        };

        timeInput.addEventListener('click', (e) => {
            e.stopPropagation();
            timePicker.classList.add('active');
            // Reset to current selection or 08:00
            setTimeout(() => {
                hourColumn.scrollTop = 0;
                minColumn.scrollTop = 0;
                hourColumn.querySelectorAll('.time-option')[0].classList.add('active');
                minColumn.querySelectorAll('.time-option')[0].classList.add('active');
            }, 50);
        });

        confirmTimeBtn.addEventListener('click', () => {
            timeInput.value = getSelectedTime();
            timePicker.classList.remove('active');
        });

        closePicker.addEventListener('click', (e) => {
            e.stopPropagation();
            timePicker.classList.remove('active');
        });

        document.addEventListener('click', (e) => {
            if (!timePicker.contains(e.target) && e.target !== timeInput) {
                timePicker.classList.remove('active');
            }
        });
    }

    // --- Testimonial Screenshot Slider ---
    const track = document.getElementById('screenshotTrack');
    const dotsContainer = document.getElementById('sliderDots');

    if (track && dotsContainer) {
        const items = track.querySelectorAll('.screenshot-item');
        const itemCount = items.length;
        let currentIndex = 0;
        let autoSlideInterval;
        const gap = 20; // Must match CSS gap

        const getVisibleItems = () => {
            if (window.innerWidth > 1024) return 3;
            // if (window.innerWidth > 768) return 2; // User wants mobile to be responsive too, typically 1 or 2
            return 1; // Simplest: 3 on desktop, 1 on mobile
        };

        const createDots = () => {
            dotsContainer.innerHTML = '';
            const visibleItems = getVisibleItems();
            const numViews = itemCount - visibleItems + 1;

            for (let i = 0; i < numViews; i++) {
                const dot = document.createElement('div');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoSlide();
                });
                dotsContainer.appendChild(dot);
            }
        };

        const updateDots = (index) => {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        const goToSlide = (index) => {
            const visibleItems = getVisibleItems();
            const maxIndex = itemCount - visibleItems;

            if (index < 0) index = 0;
            if (index > maxIndex) index = maxIndex;

            const trackWidth = track.parentElement.offsetWidth;
            const itemWidth = (trackWidth - (visibleItems - 1) * gap) / visibleItems;

            const moveX = index * (itemWidth + gap);
            track.style.transform = `translateX(-${moveX}px)`;
            currentIndex = index;
            updateDots(index);
        };

        const nextSlide = () => {
            const visibleItems = getVisibleItems();
            const maxIndex = itemCount - visibleItems;

            let next = currentIndex + 1;
            if (next > maxIndex) next = 0;
            goToSlide(next);
        };

        const startAutoSlide = () => {
            autoSlideInterval = setInterval(nextSlide, 4500);
        };

        const resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        };

        // Swipe/Drag logic
        let startX = 0;
        let isDragging = false;
        let currentTranslate = 0;
        let prevTranslate = 0;

        track.addEventListener('mousedown', dragStart);
        track.addEventListener('touchstart', dragStart);
        track.addEventListener('mouseup', dragEnd);
        track.addEventListener('touchend', dragEnd);
        track.addEventListener('mousemove', dragMove);
        track.addEventListener('touchmove', dragMove);

        function dragStart(e) {
            startX = e.type.includes('touch') ? e.touches[0].clientX : e.pageX;
            isDragging = true;
            clearInterval(autoSlideInterval);
            track.style.transition = 'none';
        }

        function dragMove(e) {
            if (!isDragging) return;
            const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.pageX;
            const diff = currentX - startX;

            const visibleItems = getVisibleItems();
            const trackWidth = track.parentElement.offsetWidth;
            const itemWidth = (trackWidth - (visibleItems - 1) * gap) / visibleItems;
            const moveX = currentIndex * (itemWidth + gap);

            track.style.transform = `translateX(${-moveX + diff}px)`;
        }

        function dragEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = '';

            const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.pageX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else goToSlide(currentIndex - 1);
            } else {
                goToSlide(currentIndex);
            }
            startAutoSlide();
        }

        // Init
        createDots();
        goToSlide(0);
        startAutoSlide();

        // Resize
        window.addEventListener('resize', () => {
            createDots();
            goToSlide(currentIndex);
        });
    }
});
