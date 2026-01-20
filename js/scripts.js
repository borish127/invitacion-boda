// Feature Flags
const SHOW_GAME = false;
const SHOW_SCHEDULE = false;

function adjustMobileAnimations() {
    const mobileWidth = 768;

    if (window.innerWidth <= mobileWidth) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.setAttribute('data-aos', 'fade-right');
        });

        const galleryItems = document.querySelectorAll('.gallery-item-container');
        galleryItems.forEach((item, index) => {
            const photoNumber = index + 1;
            if (photoNumber >= 5 && photoNumber <= 9) {
                if (photoNumber % 2 !== 0) {
                    item.setAttribute('data-aos', 'fade-right');
                } else {
                    item.setAttribute('data-aos', 'fade-left');
                }
            }
        });
    }
}

adjustMobileAnimations();

AOS.init({
    duration: 800,
});

document.addEventListener('DOMContentLoaded', () => {

    // Feature Flags Logic
    const attendanceBlock = document.getElementById('attendance-block');
    const gameBlock = document.getElementById('game-block');

    if (attendanceBlock && gameBlock) {
        if (SHOW_GAME) {
            attendanceBlock.classList.add('hidden');
            gameBlock.classList.remove('hidden');
        } else {
            attendanceBlock.classList.remove('hidden');
            gameBlock.classList.add('hidden');
        }
    }

    const scheduleSection = document.getElementById('schedule');

    if (scheduleSection) {
        if (SHOW_SCHEDULE) {
            scheduleSection.classList.remove('hidden');
        } else {
            scheduleSection.classList.add('hidden');
        }
    }

    function setupCopyButton(btnId, textId, originalText) {
        const button = document.getElementById(btnId);
        const textToCopy = document.getElementById(textId)?.innerText;

        if (button && textToCopy) {
            button.addEventListener('click', () => {
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showFeedback(button, originalText);
                    });
                } else {
                    // Fallback for non-secure contexts (e.g., http)
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'absolute';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showFeedback(button, originalText);
                    } catch (err) {
                        console.error('Error al copiar: ', err);
                    }
                    document.body.removeChild(textArea);
                }
            });
        }
    }

    function showFeedback(button, originalText) {
        button.innerText = '¡Copiado!';
        setTimeout(() => {
            button.innerText = originalText;
        }, 2000);
    }

    setupCopyButton('btn-copy-card', 'cbu-card', 'Copiar CBU');
    setupCopyButton('btn-copy-alias-card', 'alias-card', 'Copiar Alias');
    setupCopyButton('btn-copy-gift', 'cbu-gift', 'Copiar CBU');
    setupCopyButton('btn-copy-alias-gift', 'alias-gift', 'Copiar Alias');

    const dateElements = document.querySelectorAll('.js-format-date');
    const dateFormatter = new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    dateElements.forEach(element => {
        const dateString = element.dataset.date;
        if (dateString) {
            const date = new Date(dateString + 'T00:00:00');
            const formattedDate = dateFormatter.formatToParts(date)
                .filter(part => part.type !== 'literal')
                .map(part => part.value)
                .join(' • ');
            element.innerText = formattedDate;
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const group = urlParams.get('grupo');

    let formUrl = 'formulario/index.html';
    if (group) {
        formUrl += `?grupo=${group}`;
    }

    const cardSection = document.getElementById('card');
    const bridesmaidsSection = document.getElementById('bridesmaids');
    const groomsmenSection = document.getElementById('groomsmen');
    const heroScrollLink = document.getElementById('hero-scroll-link');

    if (group === 'damas') {
        if (bridesmaidsSection) bridesmaidsSection.classList.remove('hidden');
    } else if (group === 'caballeros') {
        if (groomsmenSection) groomsmenSection.classList.remove('hidden');
    } else if (group === 'familia' || group === 'inv_esp') {
    } else {
        if (cardSection) cardSection.classList.remove('hidden');
    }

    if (heroScrollLink) {
        heroScrollLink.addEventListener('click', (e) => {
            e.preventDefault();
            const scrollHeight = window.innerHeight;
            window.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
        });
    }
    AOS.refresh();

    const btnViewBridesmaids = document.getElementById('btn-view-bridesmaids');
    const btnViewGroomsmen = document.getElementById('btn-view-groomsmen');
    const bridesmaidsList = document.getElementById('bridesmaids-list');
    const groomsmenList = document.getElementById('groomsmen-list');

    function toggleList(button, list, originalText, activeText) {
        if (!button || !list) return;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = list.classList.toggle('active');

            if (isActive) {
                list.style.maxHeight = list.scrollHeight + "px";
            } else {
                list.style.maxHeight = "0px";
            }

            button.textContent = isActive ? originalText : originalText;

            setTimeout(() => {
                AOS.refresh();
            }, 700);
        });
    }

    toggleList(btnViewBridesmaids, bridesmaidsList, 'Ver todas las damas de honor', 'Ocultar damas de honor');
    toggleList(btnViewGroomsmen, groomsmenList, 'Ver todos los caballeros de honor', 'Ocultar caballeros de honor');

    // --- BLOCK 4.5: PREVENT CONTEXT MENU ON MOBILE (LONG PRESS) ---
    // We keep this logic in JS as it is more robust than just CSS
    const linksToBlock = document.querySelectorAll('.secondary-link, .scroll-link');
    linksToBlock.forEach(link => {
        // 'contextmenu' is the event for "right click" or "long press"
        link.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevents the menu from appearing
        });
    });

    const countdownTimer = document.getElementById('countdown-timer');
    const heroSection = document.querySelector('.hero-section');

    const weddingDate = new Date('2027-04-04T10:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            if (countdownTimer) countdownTimer.style.display = 'none';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();

    function checkScrollForCountdown() {
        if (!heroSection || !countdownTimer) return;

        const threshold = heroSection.offsetHeight - 50;

        if (window.scrollY > threshold) {
            countdownTimer.classList.add('visible');
        } else {
            countdownTimer.classList.remove('visible');
        }
    }

    // Initial check
    checkScrollForCountdown();

    const modalOverlay = document.getElementById('form-modal-overlay');
    const openModalBtn = document.getElementById('open-form-modal');
    const closeModalBtn = document.getElementById('close-form-modal');
    const formIframe = document.getElementById('form-iframe');

    function openModal() {
        if (!modalOverlay || !formIframe) return;
        // 1. Shows the dark overlay and blocks scroll
        modalOverlay.classList.add('modal-loading');
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');

        // 2. Listen for the iframe 'load' event
        formIframe.addEventListener('load', () => {
            // 3. When the iframe has loaded, activate the final animation
            modalOverlay.classList.add('modal-visible');
        }, { once: true }); // 'once: true' ensures it only runs once

        // 4. Starts loading the iframe
        formIframe.src = formUrl;
    }

    function closeModal() {
        if (!modalOverlay || !formIframe) return;
        modalOverlay.classList.remove('modal-visible');
        modalOverlay.classList.remove('modal-loading');
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        formIframe.src = 'about:blank';
    }

    if (openModalBtn) {
        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // --- GALLERY INTERACTION (MOBILE) ---
    const galleryItems = document.querySelectorAll('.gallery-item-container');

    function isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }

    // Add "tap" animation to the first photo if touch device
    if (isTouchDevice() && galleryItems.length > 0) {
        galleryItems[0].classList.add('hint-animation');
    }

    // Function to update hint position on scroll
    function checkScrollForHint() {
        // Only for touch devices
        if (!isTouchDevice()) return;

        // Check if there is any element with the hint class (if not, the user has already interacted)
        const currentHint = document.querySelector('.hint-animation');
        if (!currentHint) return;

        // Find the first visible element
        // We consider it visible if its bottom edge is significantly within the screen (below the top)
        // and its top edge is not below the screen
        const headerOffset = 150; // Approximate offset in case there is a fixed header or to avoid picking photos that are leaving

        let found = false;

        for (let i = 0; i < galleryItems.length; i++) {
            const item = galleryItems[i];
            const rect = item.getBoundingClientRect();

            // Condition: 
            // rect.bottom > headerOffset -> The bottom part of the photo is visible beyond the top offset
            // rect.top < window.innerHeight - 100 -> The top part is on screen (it's not a photo that hasn't entered from below yet)

            if (rect.bottom > headerOffset && rect.top < window.innerHeight - 100) {
                if (item !== currentHint) {
                    currentHint.classList.remove('hint-animation');
                    item.classList.add('hint-animation');
                }
                found = true;
                break; // Found the first one, stop searching
            }
        }
    }

    // Add specific scroll listener for this (ideally with throttle, but simple for now)
    // Optimized Scroll Handler (Throttled)
    let isScrolling = false;
    function onScroll() {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (typeof checkScrollForCountdown === 'function') checkScrollForCountdown();
                if (typeof checkScrollForHint === 'function') checkScrollForHint();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });


    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent the click from propagating to the document and closing immediately
            e.stopPropagation();

            // Remove hint animation on first touch of ANY photo
            const hintItem = document.querySelector('.hint-animation');
            if (hintItem) {
                hintItem.classList.remove('hint-animation');
            }

            const wasActive = item.classList.contains('active');

            // Remove active from all
            galleryItems.forEach(i => i.classList.remove('active'));

            // If it wasn't active, activate it
            if (!wasActive) {
                item.classList.add('active');
            }
        });

        // Clear state on mouse leave (for desktop if clicked)
        item.addEventListener('mouseleave', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                item.classList.remove('active');
            }
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.gallery-item-container')) {
            galleryItems.forEach(i => i.classList.remove('active'));
        }
    });
});

const mapButton = document.getElementById('link-location');
if (mapButton) {
    const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/3apmmqSBGVd8eMAF7?g_st=aw";
    const APPLE_MAPS_URL = "https://maps.apple/p/hI~mG2AbUpvX-z";

    // Simple detection for iOS/Mac
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMac = /Macintosh|Mac OS X/.test(userAgent) && !/Windows/.test(userAgent);

    if (isIOS || isMac) {
        mapButton.href = APPLE_MAPS_URL;
    } else {
        mapButton.href = GOOGLE_MAPS_URL;
    }
}

window.addEventListener('message', (event) => {
    if (event.data === 'closeFormModal') {
        const modalOverlay = document.getElementById('form-modal-overlay');
        const formIframe = document.getElementById('form-iframe');

        if (modalOverlay) modalOverlay.classList.remove('modal-visible');
        if (formIframe) formIframe.src = 'about:blank';
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
    }
});

// --- PREVENT DRAG ON PC ---
// This prevents links and buttons from being dragged as if they were files
const noDragElements = document.querySelectorAll('a, button, img, .btn-court-bottom, .secondary-link');

noDragElements.forEach(element => {
    element.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
});

// --- PREVENT ZOOM ON DESKTOP ---
document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
        e.preventDefault();
    }
});

// Prevent gesture zoom (Safari)
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});
