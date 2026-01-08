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
                    // Fallback para contextos no seguros (ej. http)
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
        if (heroScrollLink) heroScrollLink.href = '#bridesmaids';
    } else if (group === 'caballeros') {
        if (groomsmenSection) groomsmenSection.classList.remove('hidden');
        if (heroScrollLink) heroScrollLink.href = '#groomsmen';
    } else if (group === 'familia' || group === 'inv_esp') {
    } else {
        if (cardSection) cardSection.classList.remove('hidden');
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

    // --- BLOQUE 4.5: PREVENIR MENÚ CONTEXTUAL EN MÓVIL (LONG PRESS) ---
    // Mantenemos esta lógica en JS ya que es más robusta que solo CSS
    const linksToBlock = document.querySelectorAll('.secondary-link, .scroll-link');
    linksToBlock.forEach(link => {
        // 'contextmenu' es el evento para "click derecho" o "pulsación larga"
        link.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Previene que aparezca el menú
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

    window.addEventListener('scroll', checkScrollForCountdown);
    checkScrollForCountdown();

    const modalOverlay = document.getElementById('form-modal-overlay');
    const openModalBtn = document.getElementById('open-form-modal');
    const closeModalBtn = document.getElementById('close-form-modal');
    const formIframe = document.getElementById('form-iframe');

    function openModal() {
        if (!modalOverlay || !formIframe) return;
        // 1. Muestra el overlay oscuro y bloquea el scroll
        modalOverlay.classList.add('modal-loading');
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');

        // 2. Escucha el evento 'load' del iframe
        formIframe.addEventListener('load', () => {
            // 3. Cuando el iframe cargó, activa la animación final
            modalOverlay.classList.add('modal-visible');
        }, { once: true }); // 'once: true' asegura que solo se ejecute 1 vez

        // 4. Inicia la carga del iframe
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

    // --- INTERACCIÓN GALERÍA (MÓVIL) ---
    const galleryItems = document.querySelectorAll('.gallery-item-container');

    // Agregar animación de "tap" a la primera foto si es móvil
    if (window.innerWidth <= 768 && galleryItems.length > 0) {
        galleryItems[0].classList.add('hint-animation');
    }

    // Función para actualizar la posición del hint al hacer scroll
    function checkScrollForHint() {
        // Solo para móvil
        if (window.innerWidth > 768) return;

        // Verificar si existe algún elemento con la clase hint (si no hay, el usuario ya interactuó)
        const currentHint = document.querySelector('.hint-animation');
        if (!currentHint) return;

        // Buscar el primer elemento visible
        // Consideramos visible si su borde inferior está significativamente dentro de la pantalla (más abajo del top)
        // y su borde superior no está por debajo de la pantalla
        const headerOffset = 150; // Compensación aproximada por si hay header fijo o para no tomar fotos que se están yendo

        let found = false;

        for (let i = 0; i < galleryItems.length; i++) {
            const item = galleryItems[i];
            const rect = item.getBoundingClientRect();

            // Condición: 
            // rect.bottom > headerOffset -> La parte de abajo de la foto está visible más allá del offset superior
            // rect.top < window.innerHeight - 100 -> La parte de arriba está en pantalla (no es una foto que aún no entra por abajo)

            if (rect.bottom > headerOffset && rect.top < window.innerHeight - 100) {
                if (item !== currentHint) {
                    currentHint.classList.remove('hint-animation');
                    item.classList.add('hint-animation');
                }
                found = true;
                break; // Encontramos el primero, dejamos de buscar
            }
        }
    }

    // Añadir listener de scroll específico para esto (con throttle idealmente, pero simple por ahora)
    window.addEventListener('scroll', checkScrollForHint, { passive: true });


    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Evitar que el click se propague al document y cierre inmediatamente
            e.stopPropagation();

            // Remover la animación de hint al primer toque de CUALQUIER foto
            const hintItem = document.querySelector('.hint-animation');
            if (hintItem) {
                hintItem.classList.remove('hint-animation');
            }

            const wasActive = item.classList.contains('active');

            // Quitar active de todas
            galleryItems.forEach(i => i.classList.remove('active'));

            // Si no estaba activa, activarla
            if (!wasActive) {
                item.classList.add('active');
            }
        });

        // Limpiar estado al salir el mouse (para desktop si se hizo click)
        item.addEventListener('mouseleave', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                item.classList.remove('active');
            }
        });
    });

    // Cerrar al hacer click fuera
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

    // Detección simple de iOS/Mac
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

// --- BLOQUEO DE ARRASTRE EN PC ---
// Esto previene que se arrastren enlaces y botones como si fueran archivos
const noDragElements = document.querySelectorAll('a, button, img, .btn-court-bottom, .secondary-link');

noDragElements.forEach(element => {
    element.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
});

// --- BLOQUEO DE ZOOM EN ESCRITORIO ---
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
