function ajustarAnimacionesMovil() {
    const anchoMovil = 768;

    if (window.innerWidth <= anchoMovil) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.setAttribute('data-aos', 'fade-right');
        });

        const galeriaImages = document.querySelectorAll('.galeria-cuadricula img');
        galeriaImages.forEach((img, index) => {
            const numeroDeFoto = index + 1;
            if (numeroDeFoto >= 5 && numeroDeFoto <= 9) {
                if (numeroDeFoto % 2 !== 0) {
                    img.setAttribute('data-aos', 'fade-right');
                } else {
                    img.setAttribute('data-aos', 'fade-left');
                }
            }
        });
    }
}

ajustarAnimacionesMovil();

AOS.init({
    duration: 800,
    once: false
});

document.addEventListener('DOMContentLoaded', () => {

    function setupCopyButton(btnId, textId, originalText) {
        const boton = document.getElementById(btnId);
        const textoParaCopiar = document.getElementById(textId)?.innerText;

        if (boton && textoParaCopiar) {
            boton.addEventListener('click', () => {
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textoParaCopiar).then(() => {
                        showFeedback(boton, originalText);
                    });
                } else {
                    // Fallback para contextos no seguros (ej. http)
                    const textArea = document.createElement('textarea');
                    textArea.value = textoParaCopiar;
                    textArea.style.position = 'absolute';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showFeedback(boton, originalText);
                    } catch (err) {
                        console.error('Error al copiar: ', err);
                    }
                    document.body.removeChild(textArea);
                }
            });
        }
    }

    function showFeedback(boton, originalText) {
        boton.innerText = '¡Copiado!';
        setTimeout(() => {
            boton.innerText = originalText;
        }, 2000);
    }

    setupCopyButton('btn-copiar-tarjeta', 'cbu-tarjeta', 'Copiar CBU');
    setupCopyButton('btn-copiar-alias-tarjeta', 'alias-tarjeta', 'Copiar Alias');
    setupCopyButton('btn-copiar-regalo', 'cbu-regalo', 'Copiar CBU');
    setupCopyButton('btn-copiar-alias-regalo', 'alias-regalo', 'Copiar Alias');

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
    const grupo = urlParams.get('grupo');

    let formUrl = 'formulario/index.html';
    if (grupo) {
        formUrl += `?grupo=${grupo}`;
    }

    const seccionTarjeta = document.getElementById('tarjeta');
    const seccionDamas = document.getElementById('damas');
    const seccionCaballeros = document.getElementById('caballeros');
    const heroScrollLink = document.getElementById('hero-scroll-link');
    
    if (grupo === 'damas') {
        if (seccionDamas) seccionDamas.classList.remove('hidden');
        if (heroScrollLink) heroScrollLink.href = '#damas';
    } else if (grupo === 'caballeros') {
        if (seccionCaballeros) seccionCaballeros.classList.remove('hidden');
        if (heroScrollLink) heroScrollLink.href = '#caballeros';
    } else if (grupo === 'familia' || grupo === 'inv_esp') {
    } else {
        if (seccionTarjeta) seccionTarjeta.classList.remove('hidden');
    }
    AOS.refresh();

    const btnVerDamas = document.getElementById('btn-ver-damas');
    const btnVerCaballeros = document.getElementById('btn-ver-caballeros');
    const listaDamas = document.getElementById('lista-damas');
    const listaCaballeros = document.getElementById('lista-caballeros');

    function toggleLista(boton, lista, textoOriginal, textoActivo) {
        if (!boton || !lista) return;

        boton.addEventListener('click', (e) => {
            e.preventDefault();
            const estaActivo = lista.classList.toggle('activo');
            
            if (estaActivo) {
                lista.style.maxHeight = lista.scrollHeight + "px";
            } else {
                lista.style.maxHeight = "0px";
            }

            boton.textContent = estaActivo ? textoOriginal : textoOriginal;

            setTimeout(() => {
                AOS.refresh();
            }, 700);
        });
    }

    toggleLista(btnVerDamas, listaDamas, 'Ver todas las damas de honor', 'Ocultar damas de honor');
    toggleLista(btnVerCaballeros, listaCaballeros, 'Ver todos los caballeros de honor', 'Ocultar caballeros de honor');


    const countdownTimer = document.getElementById('countdown-timer');
    const heroSection = document.querySelector('.hero-section');
    
    const fechaBoda = new Date('2027-04-04T17:00:00').getTime();

    function actualizarCuentaRegresiva() {
        const ahora = new Date().getTime();
        const distancia = fechaBoda - ahora;

        if (distancia < 0) {
            clearInterval(intervaloCuenta);
            if(countdownTimer) countdownTimer.style.display = 'none';
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        document.getElementById('dias').innerText = String(dias).padStart(2, '0');
        document.getElementById('horas').innerText = String(horas).padStart(2, '0');
        document.getElementById('minutos').innerText = String(minutos).padStart(2, '0');
        document.getElementById('segundos').innerText = String(segundos).padStart(2, '0');
    }

    const intervaloCuenta = setInterval(actualizarCuentaRegresiva, 1000);
    actualizarCuentaRegresiva();

    function checkScrollParaCountdown() {
        if (!heroSection || !countdownTimer) return;

        const umbral = heroSection.offsetHeight - 50; 

        if (window.scrollY > umbral) {
            countdownTimer.classList.add('visible');
        } else {
            countdownTimer.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', checkScrollParaCountdown);
    checkScrollParaCountdown(); 

    const modalOverlay = document.getElementById('form-modal-overlay');
    const openModalBtn = document.getElementById('open-form-modal');
    const closeModalBtn = document.getElementById('close-form-modal');
    const formIframe = document.getElementById('form-iframe');

    function openModal() {
        if (!modalOverlay || !formIframe) return;
        formIframe.src = formUrl; 
        modalOverlay.classList.add('modal-visible');
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        if (!modalOverlay || !formIframe) return;
        modalOverlay.classList.remove('modal-visible');
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
});

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