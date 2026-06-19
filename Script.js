document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // 1. LOADER & INSTANSI AWAL
    // ==========================================================================
    const loader = document.getElementById("loader");
    window.addEventListener("load", () => {
        // Berikan delay halus untuk pengalaman pengguna premium
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.classList.add("hidden");
            }, 500);
        }, 800);
    });

    // Menarik Nama Tamu dari URL Parameter (Misal: ?to=Budi+Arto)
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get("to");
    const guestPlaceholder = document.getElementById("guest-name-placeholder");
    if (guestName) {
        guestPlaceholder.innerText = decodeURIComponent(guestName.replace(/\+/g, " "));
    } else {
        guestPlaceholder.innerText = "Tamu Undangan";
    }

    // ==========================================================================
    // 2. INTERAKSI COVER & TOMBOL BUKA UNDANGAN & AUDIO
    // ==========================================================================
    const coverSection = document.getElementById("cover");
    const btnOpenInvitation = document.getElementById("btn-open-invitation");
    const weddingAudio = document.getElementById("wedding-audio");
    const musicControl = document.getElementById("music-control");
    const musicIcon = musicControl.querySelector("i");
    const backToTopBtn = document.getElementById("back-to-top");

    btnOpenInvitation.addEventListener("click", () => {
        // Melakukan scroll halus ke section berikutnya
        coverSection.classList.add("unlocked");
        
        // Memulai Memutar Audio
        playAudio();

        // Tampilkan tombol control music & back-to-top
        musicControl.classList.remove("hidden");
        
        // Memulai inisiasi animasi scroll reveal pertama kali
        triggerScrollReveal();
    });

    function playAudio() {
        weddingAudio.play().then(() => {
            musicIcon.className = "fas fa-music disc-rotate";
        }).catch((err) => {
            console.log("Auto-play dibatasi peramban, interaksi diperlukan.");
        });
    }

    musicControl.addEventListener("click", () => {
        if (weddingAudio.paused) {
            weddingAudio.play();
            musicIcon.className = "fas fa-music disc-rotate";
        } else {
            weddingAudio.pause();
            musicIcon.className = "fas fa-play";
        }
    });

    // ==========================================================================
    // 3. COUNTDOWN TIMER
    // ==========================================================================
    const targetDate = new Date("Aug 8, 2026 08:00:00").getTime();

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            clearInterval(countdownInterval);
            document.querySelector(".countdown-container").innerHTML = "<p style='text-align:center; width:100%; font-weight:bold;'>Acara Sedang Berlangsung / Selesai</p>";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    }, 1000);

    // ==========================================================================
    // 4. ANIMASI SCROLL REVEAL & NAVIGATION HIGHLIGHT
    // ==========================================================================
    const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const navItems = document.querySelectorAll(".bottom-nav .nav-item");

    function triggerScrollReveal() {
        const container = document.querySelector(".app-container");
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach((el) => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add("active");
            }
        });

        // Progress Bar & Back to Top (Menggunakan referensi container)
        const containerScrollTop = container.scrollTop || window.scrollY;
        const containerScrollHeight = container.scrollHeight - window.innerHeight;
        const progress = Math.min(containerScrollTop / containerScrollHeight, 1);
        document.getElementById("progress-bar").style.transform = `translateX(-50%) scaleX(${progress})`;

        if (containerScrollTop > 400) {
            backToTopBtn.classList.remove("hidden");
        } else {
            backToTopBtn.classList.add("hidden");
        }

        // Active State Navigasi Bawah Berdasarkan Posisi Halaman
        let currentSectionId = "";
        const sections = document.querySelectorAll("section");
        sections.forEach((sec) => {
            const secTop = sec.offsetTop;
            const secHeight = sec.clientHeight;
            if (containerScrollTop >= secTop - 200) {
                currentSectionId = sec.getAttribute("id");
            }
        });

        navItems.forEach((item) => {
            item.classList.remove("active");
            if (item.getAttribute("data-section") === currentSectionId) {
                item.classList.add("active");
            }
        });
    }

    // Pendengar scroll ganda (untuk layar mobile penuh maupun desktop simulated frame)
    window.addEventListener("scroll", triggerScrollReveal);
    document.querySelector(".app-container").addEventListener("scroll", triggerScrollReveal);

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.querySelector(".app-container").scrollTo({ top: 0, behavior: "smooth" });
    });

    // ==========================================================================
    // 5. COPY TO CLIPBOARD (COPAS NOREK)
    // ==========================================================================
    const copyButtons = document.querySelectorAll(".btn-copy");
    const toast = document.getElementById("toast");

    copyButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const rawText = document.getElementById(targetId).innerText;
            
            navigator.clipboard.writeText(rawText).then(() => {
                showToast("Salin Berhasil!");
                const originalText = btn.innerHTML;
                btn.innerHTML = "<i class='fas fa-check'></i> Tersalin!";
                btn.style.backgroundColor = "#245418";
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = "";
                }, 2000);
            }).catch(err => {
                console.error("Gagal menyalin text: ", err);
            });
        });
    });

    function showToast(message) {
        toast.innerText = message;
        toast.classList.remove("hidden");
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 2000);
    }

    // ==========================================================================
    // 6. LIGHTBOX GALLERY DENGAN SWIPE & CONTROLS
    // ==========================================================================
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.querySelector(".lightbox-close");
    const prevBtn = document.querySelector(".lightbox-prev");
    const nextBtn = document.querySelector(".lightbox-next");
    
    let currentImgIndex = 0;
    const imagesSrcArray = Array.from(galleryItems).map(item => item.querySelector("img").src);

    galleryItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            currentImgIndex = index;
            openLightbox();
        });
    });

    function openLightbox() {
        lightboxImg.src = imagesSrcArray[currentImgIndex];
        lightbox.classList.remove("hidden");
    }

    function closeLightbox() {
        lightbox.classList.add("hidden");
    }

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-content-wrapper")) {
            closeLightbox();
        }
    });

    function showPrevImg() {
        currentImgIndex = (currentImgIndex - 1 + imagesSrcArray.length) % imagesSrcArray.length;
        lightboxImg.src = imagesSrcArray[currentImgIndex];
    }

    function showNextImg() {
        currentImgIndex = (currentImgIndex + 1) % imagesSrcArray.length;
        lightboxImg.src = imagesSrcArray[currentImgIndex];
    }

    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showPrevImg();
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showNextImg();
    });

    // Swipe Support untuk Mobile Lightbox
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            showNextImg(); // Swipe Kiri
        }
        if (touchEndX > touchStartX + 50) {
            showPrevImg(); // Swipe Kanan
        }
    }

    // ==========================================================================
    // 7. FORM RSVP (LOCALSTORAGE SIMULATOR)
    // ==========================================================================
    const rsvpForm = document.getElementById("rsvp-form");
    const rsvpSuccessMsg = document.getElementById("rsvp-success-msg");

    rsvpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const rsvpData = {
            name: document.getElementById("rsvp-name").value,
            guests: document.getElementById("rsvp-guests").value,
            attendance: document.querySelector('input[name="attendance"]:checked').value
        };

        // Menyimpan data ke localStorage
        localStorage.setItem("rsvp_wedding_arie_nadia", JSON.stringify(rsvpData));

        rsvpForm.classList.add("hidden");
        rsvpSuccessMsg.classList.remove("hidden");
    });

    // ==========================================================================
    // 8. WISHEBOX / GUESTBOOK (LOCALSTORAGE PERSISTENCE)
    // ==========================================================================
    const wishForm = document.getElementById("wish-form");
    const wishesContainer = document.getElementById("wishes-container");

    // Mengambil ucapan yang sudah tersimpan saat pertama kali masuk halaman
    loadWishes();

    wishForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("wish-name");
        const messageInput = document.getElementById("wish-message");

        const newWish = {
            id: Date.now(),
            name: nameInput.value,
            message: messageInput.value
        };

        // Simpan ke daftar lokal
        saveWishToLocal(newWish);

        // Langsung lampirkan ucapan baru ke struktur feed paling atas
        renderWishElement(newWish, true);

        // Reset Formulir
        nameInput.value = "";
        messageInput.value = "";
        showToast("Ucapan terkirim!");
    });

    function saveWishToLocal(wish) {
        let wishes = JSON.parse(localStorage.getItem("wishes_wedding_arie_nadia")) || [];
        wishes.unshift(wish); // Urutan paling baru di atas
        localStorage.setItem("wishes_wedding_arie_nadia", JSON.stringify(wishes));
    }

    function loadWishes() {
        let wishes = JSON.parse(localStorage.getItem("wishes_wedding_arie_nadia")) || [];
        wishes.forEach(wish => {
            renderWishElement(wish, false);
        });
    }

    function renderWishElement(wish, prepend = false) {
        const card = document.createElement("div");
        card.className = "wish-card";
        card.innerHTML = `
            <h4>${escapeHTML(wish.name)}</h4>
            <p>${escapeHTML(wish.message)}</p>
        `;

        if (prepend) {
            wishesContainer.prepend(card);
        } else {
            wishesContainer.appendChild(card);
        }
    }

    // Menghindari serangan XSS pada form masukan tamu
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
