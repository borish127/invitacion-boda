/**
 * Ajusta los atributos de animación de ciertos elementos para una mejor
 * experiencia en dispositivos móviles (ancho <= 768px).
 */
function ajustarAnimacionesMovil() {
    const anchoMovil = 768;

    if (window.innerWidth <= anchoMovil) {
        // En móvil, todos los items del cronograma animan desde la derecha.
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.setAttribute('data-aos', 'fade-right');
        });

        // En móvil, se ajusta la animación de ciertas imágenes de la galería.
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

// 1. Ajustar animaciones antes de inicializar la librería.
ajustarAnimacionesMovil();

// 2. Inicializar la librería de animaciones AOS.
AOS.init({
    duration: 800,
    once: false
});

// 3. Lógica principal que se ejecuta una vez que el DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', () => {

    // --- BLOQUE 1: FUNCIONALIDAD DE BOTONES PARA COPIAR ---
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

    // --- BLOQUE 2: FORMATEO DE FECHAS ---
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

    // --- BLOQUE 3: LÓGICA DE VISIBILIDAD DE SECCIONES POR URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const grupo = urlParams.get('grupo');

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
    AOS.refresh(); // Refrescar AOS después de cambiar la visibilidad

    // --- BLOQUE 4: FUNCIONALIDAD DE LISTAS DESPLEGABLES ---
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

            boton.textContent = estaActivo ? textoActivo : textoOriginal;
            setTimeout(() => {
                AOS.refresh();
            }, 700);
        });
    }

    toggleLista(btnVerDamas, listaDamas, 'Ver todas las damas de honor', 'Ocultar damas de honor');
    toggleLista(btnVerCaballeros, listaCaballeros, 'Ver todos los caballeros de honor', 'Ocultar caballeros de honor');

    // --- BLOQUE 5: CUENTA REGRESIVA ---
    const countdownTimer = document.getElementById('countdown-timer');
    const heroSection = document.querySelector('.hero-section');
    
    // La fecha y hora de la boda (basado en la recepción a las 17:00hs)
    const fechaBoda = new Date('2027-04-04T17:00:00').getTime();

    function actualizarCuentaRegresiva() {
        const ahora = new Date().getTime();
        const distancia = fechaBoda - ahora;

        // Si la fecha ya pasó, ocultamos el timer y detenemos todo
        if (distancia < 0) {
            clearInterval(intervaloCuenta);
            if(countdownTimer) countdownTimer.style.display = 'none';
            return;
        }

        // Cálculos de tiempo
        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        // Mostrar en el HTML con dos dígitos
        document.getElementById('dias').innerText = String(dias).padStart(2, '0');
        document.getElementById('horas').innerText = String(horas).padStart(2, '0');
        document.getElementById('minutos').innerText = String(minutos).padStart(2, '0');
        document.getElementById('segundos').innerText = String(segundos).padStart(2, '0');
    }

    // Iniciar el intervalo para actualizar cada segundo
    const intervaloCuenta = setInterval(actualizarCuentaRegresiva, 1000);
    actualizarCuentaRegresiva(); // Llamada inicial para que no haya delay

    // --- BLOQUE 6: VISIBILIDAD DE CUENTA REGRESIVA AL HACER SCROLL ---
    function checkScrollParaCountdown() {
        if (!heroSection || !countdownTimer) return;

        const umbral = heroSection.offsetHeight - 50; 

        if (window.scrollY > umbral) {
            countdownTimer.classList.add('visible');
        } else {
            countdownTimer.classList.remove('visible');
        }
    }

    // Escuchar el evento de scroll
    window.addEventListener('scroll', checkScrollParaCountdown);
    // Comprobar al cargar, por si el usuario recarga la página más abajo
    checkScrollParaCountdown();
});
