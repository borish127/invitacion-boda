(function () {
    'use strict';

    // ==========================================
    // Configuration & Constants
    // ==========================================
    const CONFIG = {
        SHOW_GAME: false,
        SHOW_SCHEDULE: true,
        WEDDING_DATE: new Date('2027-04-04T10:00:00').getTime(),
        SPECIAL_GROUPS: ['damas', 'caballeros', 'familia', 'inv_esp'],
        MOBILE_WIDTH: 768,
        GOOGLE_MAPS_URL: 'https://maps.app.goo.gl/3apmmqSBGVd8eMAF7?g_st=aw',
        APPLE_MAPS_URL: 'https://maps.apple/p/hI~mG2AbUpvX-z'
    };

    // ==========================================
    // Utility Helpers
    // ==========================================
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    const $id = (id) => document.getElementById(id);

    function isTouchDevice() {
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0);
    }

    function isAppleDevice() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        const isMac = /Macintosh|Mac OS X/.test(ua) && !/Windows/.test(ua);
        return isIOS || isMac;
    }

    // ==========================================
    // Pre-DOM: Adjust mobile AOS directions
    // ==========================================
    function adjustMobileAnimations() {
        if (window.innerWidth > CONFIG.MOBILE_WIDTH) return;

        $$('.timeline-item').forEach(item => {
            item.setAttribute('data-aos', 'fade-right');
        });

        $$('.gallery-item-container').forEach((item, index) => {
            const n = index + 1;
            if (n >= 5 && n <= 9) {
                item.setAttribute('data-aos', n % 2 !== 0 ? 'fade-right' : 'fade-left');
            }
        });
    }

    adjustMobileAnimations();

    AOS.init({ duration: 800 });

    // ==========================================
    // Main Init (DOMContentLoaded)
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {

        // --- URL Parameters ---
        const urlParams = new URLSearchParams(window.location.search);
        const group = urlParams.get('grupo');
        const isSpecialGroup = CONFIG.SPECIAL_GROUPS.includes(group);

        // --- Feature flags ---
        const attendanceBlock = $id('attendance-block');
        const gameBlock = $id('game-block');

        if (attendanceBlock && gameBlock) {
            if (CONFIG.SHOW_GAME) {
                attendanceBlock.classList.add('hidden');
                gameBlock.classList.remove('hidden');
            } else {
                attendanceBlock.classList.remove('hidden');
                gameBlock.classList.add('hidden');
            }
        }

        const scheduleSection = $id('schedule');
        if (scheduleSection) {
            scheduleSection.classList.toggle('hidden', !CONFIG.SHOW_SCHEDULE);
        }

        // --- Contributions: conditional card pricing ---
        const cardPricing = $id('card-pricing');
        if (cardPricing && isSpecialGroup) {
            cardPricing.classList.add('hidden');
        }

        // --- Court sections visibility ---
        const bridesmaidsSection = $id('bridesmaids');
        const groomsmenSection = $id('groomsmen');

        if (group === 'damas' && bridesmaidsSection) {
            bridesmaidsSection.classList.remove('hidden');
        } else if (group === 'caballeros' && groomsmenSection) {
            groomsmenSection.classList.remove('hidden');
        }
        // 'familia' and 'inv_esp' don't show court sections (default hidden)

        // --- Date Formatting ---
        const dateFormatter = new Intl.DateTimeFormat(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        $$('.js-format-date').forEach(element => {
            const dateString = element.dataset.date;
            if (dateString) {
                const date = new Date(dateString + 'T00:00:00');
                element.innerText = dateFormatter.formatToParts(date)
                    .filter(part => part.type !== 'literal')
                    .map(part => part.value)
                    .join(' • ');
            }
        });

        // --- Copy-to-Clipboard ---
        function showFeedback(button, originalText) {
            button.innerText = '¡Copiado!';
            button.setAttribute('aria-live', 'polite');
            setTimeout(() => {
                button.innerText = originalText;
            }, 2000);
        }

        function setupCopyButton(btnId, textId, originalText) {
            const button = $id(btnId);
            const textToCopy = $id(textId)?.innerText;

            if (!button || !textToCopy) return;

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

        setupCopyButton('btn-copy-cbu', 'cbu-contributions', 'Copiar CBU');
        setupCopyButton('btn-copy-alias', 'alias-contributions', 'Copiar Alias');

        // --- Hero Scroll Link ---
        const heroScrollLink = $id('hero-scroll-link');
        if (heroScrollLink) {
            heroScrollLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            });
        }

        AOS.refresh();

        // --- Court Lists (Collapsible) ---
        function toggleList(button, list, showText, hideText) {
            if (!button || !list) return;

            button.addEventListener('click', (e) => {
                e.preventDefault();
                const isActive = list.classList.toggle('active');

                list.style.maxHeight = isActive ? list.scrollHeight + 'px' : '0px';
                button.textContent = isActive ? hideText : showText;

                setTimeout(() => AOS.refresh(), 700);
            });
        }

        toggleList(
            $id('btn-view-bridesmaids'), $id('bridesmaids-list'),
            'Ver todas las damas de honor', 'Ocultar damas de honor'
        );
        toggleList(
            $id('btn-view-groomsmen'), $id('groomsmen-list'),
            'Ver todos los caballeros de honor', 'Ocultar caballeros de honor'
        );

        // --- Prevent Context Menu on Mobile (Long Press) ---
        $$('.secondary-link, .scroll-link').forEach(link => {
            link.addEventListener('contextmenu', (e) => e.preventDefault());
        });

        // --- Countdown Timer ---
        const countdownTimer = $id('countdown-timer');
        const heroSection = $('.hero-section');

        function updateCountdown() {
            const distance = CONFIG.WEDDING_DATE - Date.now();

            if (distance < 0) {
                clearInterval(countdownInterval);
                if (countdownTimer) countdownTimer.style.display = 'none';
                return;
            }

            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            $id('days').innerText = String(d).padStart(2, '0');
            $id('hours').innerText = String(h).padStart(2, '0');
            $id('minutes').innerText = String(m).padStart(2, '0');
            $id('seconds').innerText = String(s).padStart(2, '0');
        }

        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();

        function checkScrollForCountdown() {
            if (!heroSection || !countdownTimer) return;
            const threshold = heroSection.offsetHeight - 50;
            countdownTimer.classList.toggle('visible', window.scrollY > threshold);
        }

        checkScrollForCountdown();

        // --- Form Modal ---
        let formUrl = 'formulario/index.html';
        if (group) formUrl += `?grupo=${group}`;

        const modalOverlay = $id('form-modal-overlay');
        const openModalBtn = $id('open-form-modal');
        const closeModalBtn = $id('close-form-modal');
        const formIframe = $id('form-iframe');

        function openModal() {
            if (!modalOverlay || !formIframe) return;
            modalOverlay.classList.add('modal-loading');
            document.documentElement.classList.add('modal-open');
            document.body.classList.add('modal-open');

            formIframe.addEventListener('load', () => {
                modalOverlay.classList.add('modal-visible');
            }, { once: true });

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
                if (e.target === modalOverlay) closeModal();
            });
        }

        // --- Gallery Interaction (Mobile) ---
        const galleryItems = $$('.gallery-item-container');

        if (isTouchDevice() && galleryItems.length > 0) {
            galleryItems[0].classList.add('hint-animation');
        }

        function checkScrollForHint() {
            if (!isTouchDevice()) return;

            const currentHint = $('.hint-animation');
            if (!currentHint) return;

            const headerOffset = 150;

            for (let i = 0; i < galleryItems.length; i++) {
                const item = galleryItems[i];
                const rect = item.getBoundingClientRect();

                if (rect.bottom > headerOffset && rect.top < window.innerHeight - 100) {
                    if (item !== currentHint) {
                        currentHint.classList.remove('hint-animation');
                        item.classList.add('hint-animation');
                    }
                    break;
                }
            }
        }

        // --- Optimized Scroll Handler (rAF-throttled) ---
        let isScrolling = false;

        function onScroll() {
            if (isScrolling) return;
            isScrolling = true;

            window.requestAnimationFrame(() => {
                checkScrollForCountdown();
                checkScrollForHint();
                isScrolling = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        // --- Gallery Click Handling ---
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const hintItem = $('.hint-animation');
                if (hintItem) hintItem.classList.remove('hint-animation');

                const wasActive = item.classList.contains('active');
                galleryItems.forEach(i => i.classList.remove('active'));

                if (!wasActive) item.classList.add('active');
            });

            item.addEventListener('mouseleave', () => {
                if (window.matchMedia('(hover: hover)').matches) {
                    item.classList.remove('active');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.gallery-item-container')) {
                galleryItems.forEach(i => i.classList.remove('active'));
            }
        });

        // --- Map Button (Apple vs Google) ---
        const mapButton = $id('link-location');
        if (mapButton) {
            mapButton.href = isAppleDevice() ? CONFIG.APPLE_MAPS_URL : CONFIG.GOOGLE_MAPS_URL;
        }

        // --- Prevent Drag on PC ---
        $$('a, button, img, .btn-court-bottom, .secondary-link').forEach(el => {
            el.addEventListener('dragstart', (e) => e.preventDefault());
        });

        // --- Cross-origin Modal Close (from iframe) ---
        window.addEventListener('message', (event) => {
            if (event.data === 'closeFormModal') {
                closeModal();
            }
        });

    }); // end DOMContentLoaded

    // ==========================================
    // Zoom Prevention (runs immediately)
    // ==========================================
    document.addEventListener('wheel', function (e) {
        if (e.ctrlKey) e.preventDefault();
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
            e.preventDefault();
        }
    });

    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });

})();
