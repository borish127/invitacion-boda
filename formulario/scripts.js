(function () {
    'use strict';

    // !!! IMPORTANT: Google Apps Script endpoint !!!
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzvd0MtBxXCThSsgE_Gf-z7QNshy-LoKiav7ptTV93fpllEYXo2eW_gSuqZYLjrAvSBMQ/exec";

    // ==========================================
    // Utility Helpers
    // ==========================================
    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => (ctx || document).querySelectorAll(sel);
    const $id = (id) => document.getElementById(id);

    function isTouchInside(event, element) {
        if (!event.changedTouches || event.changedTouches.length === 0) return false;
        const touch = event.changedTouches[0];
        const rect = element.getBoundingClientRect();
        return (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom
        );
    }

    function blurActiveElement() {
        const focused = document.activeElement;
        if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {
            focused.blur();
        }
    }

    // ==========================================
    // Main Init
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {

        const form = $id('wedding-form');
        const pages = $$('.page');

        const navContainer = $id('navigation-buttons');
        const navButtons = $$('[data-nav]');
        const prevBtn = $id('prev-btn');
        const nextBtn = $id('next-btn');
        const submitBtn = $id('submit-btn');

        const radioMenuSolo = $$('input[name="menu_solo"]');
        const otroSoloContainer = $id('otro-solo-container');
        const otroMenuGrupoInput = $id('menu-otro');
        const otroGrupoContainer = $id('otro-grupo-container');

        const numAdultosInput = $id('num-adultos');
        const numNinosInput = $id('num-ninos');
        const numBebesInput = $id('num-bebes');
        const menuInputs = $$('#page-5 .hidden-number-input');
        const menuIncreaseBtns = $$('#page-5 [data-action="increase"]');

        let currentPage = 'portada';
        let pageHistory = ['portada'];

        // --- Page Navigation ---

        function showPage(pageId) {
            pages.forEach(page => page.classList.remove('active'));

            const activePage = $id(`page-${pageId}`);
            if (activePage) {
                activePage.classList.add('active');
                currentPage = pageId;

                if (pageId === '5') updateMenuLimits();
                updateNavButtons(pageId);
            } else {
                console.error('Página no encontrada:', pageId);
            }
        }

        function updateNavButtons(pageId) {
            if (pageId === 'portada' || pageId === '8') {
                navContainer.classList.add('hidden');
                return;
            }

            navContainer.classList.remove('hidden');
            prevBtn.classList.toggle('hidden', pageHistory.length <= 1);

            const isFinalPage = (pageId === '6' || pageId === '7');
            nextBtn.classList.toggle('hidden', isFinalPage);
            submitBtn.classList.toggle('hidden', !isFinalPage);
        }

        // --- Validation ---

        function clearValidationError(input) {
            input.classList.remove('border-red-500', 'ring-red-500', 'form-invalid-shake');
        }

        function showValidationError(input) {
            input.classList.add('border-red-500', 'ring-red-500');
            void input.offsetWidth; // Force reflow for animation restart
            input.classList.add('form-invalid-shake');

            input.addEventListener('input', () => clearValidationError(input), { once: true });
        }

        function showRadioGroupError(allRadios) {
            allRadios.forEach(radio => {
                const container = radio.nextElementSibling;
                if (container && container.classList.contains('radio-option')) {
                    container.classList.add('border-red-500');
                    void container.offsetWidth;
                    container.classList.add('form-invalid-shake');

                    radio.addEventListener('change', () => {
                        const groupName = radio.name;
                        $$(`input[name="${groupName}"]`, form).forEach(r => {
                            const c = r.nextElementSibling;
                            if (c && c.classList.contains('radio-option')) {
                                c.classList.remove('border-red-500', 'form-invalid-shake');
                            }
                        });
                    }, { once: true });
                }
            });
        }

        function validateCurrentPage() {
            const activePage = $id(`page-${currentPage}`);
            if (!activePage) return false;

            const inputs = activePage.querySelectorAll('[required]');
            let isValid = true;
            const processedRadioGroups = new Set();

            for (const input of inputs) {
                if (input.type !== 'radio') {
                    clearValidationError(input);
                }

                // Skip hidden textarea/text inputs
                const container = input.closest('.hidden');
                if (container && (input.type === 'textarea' || input.type === 'text')) {
                    continue;
                }

                if (input.type === 'radio') {
                    const groupName = input.name;
                    if (processedRadioGroups.has(groupName)) continue;
                    processedRadioGroups.add(groupName);

                    const checked = $(`input[name="${groupName}"]:checked`, form);
                    const allRadios = $$(`input[name="${groupName}"]`, form);

                    allRadios.forEach(radio => {
                        const c = radio.nextElementSibling;
                        if (c && c.classList.contains('radio-option')) {
                            c.classList.remove('border-red-500', 'form-invalid-shake');
                        }
                    });

                    if (!checked) {
                        isValid = false;
                        showRadioGroupError(allRadios);
                    }
                } else if (!input.value.trim()) {
                    isValid = false;
                    showValidationError(input);
                }
            }

            // Group size validation (page 3)
            if (isValid && currentPage === '3') {
                const adultos = parseInt(numAdultosInput.value, 10) || 0;
                const ninos = parseInt(numNinosInput.value, 10) || 0;
                const bebes = parseInt(numBebesInput.value, 10) || 0;

                if (adultos + ninos + bebes < 2) {
                    isValid = false;
                    const wrappers = activePage.querySelectorAll('.quantity-input-wrapper');

                    wrappers.forEach(wrapper => {
                        const visualInput = wrapper.querySelector('.quantity-input');
                        if (visualInput) {
                            visualInput.classList.remove('border-red-500', 'form-invalid-shake');
                        }
                    });

                    wrappers.forEach(wrapper => {
                        const visualInput = wrapper.querySelector('.quantity-input');
                        const hiddenInput = wrapper.querySelector('.hidden-number-input');

                        if (visualInput) {
                            visualInput.classList.add('border-red-500');
                            void visualInput.offsetWidth;
                            visualInput.classList.add('form-invalid-shake');
                        }

                        if (hiddenInput) {
                            hiddenInput.addEventListener('input', () => {
                                wrappers.forEach(w => {
                                    const v = w.querySelector('.quantity-input');
                                    if (v) v.classList.remove('border-red-500', 'form-invalid-shake');
                                });
                            }, { once: true });
                        }
                    });
                }
            }

            return isValid;
        }

        // --- Navigation Logic ---

        function navigateNext() {
            if (!validateCurrentPage()) return;

            let nextPageId = '';

            switch (currentPage) {
                case 'portada': nextPageId = '1'; break;
                case '1':
                    nextPageId = ($('input[name="asistencia"]:checked', form)?.value === 'si') ? '2' : '6';
                    break;
                case '2':
                    nextPageId = ($('input[name="grupo"]:checked', form)?.value === 'solo') ? '4' : '3';
                    break;
                case '3': nextPageId = '5'; break;
                case '4': nextPageId = '7'; break;
                case '5': nextPageId = '7'; break;
                case '6':
                case '7': nextPageId = '8'; break;
            }

            if (nextPageId) {
                pageHistory.push(nextPageId);
                showPage(nextPageId);
            }
        }

        function navigatePrev() {
            if (pageHistory.length > 1) {
                pageHistory.pop();
                showPage(pageHistory[pageHistory.length - 1]);
            }
        }

        // --- Menu Limits ---

        function updateMenuLimits() {
            const maxTotalMenus = (parseInt(numAdultosInput.value, 10) || 0) + (parseInt(numNinosInput.value, 10) || 0);

            let currentTotalMenus = 0;
            menuInputs.forEach(input => {
                currentTotalMenus += (parseInt(input.value, 10) || 0);
            });

            const canIncrease = currentTotalMenus < maxTotalMenus;
            menuIncreaseBtns.forEach(btn => { btn.disabled = !canIncrease; });
        }

        // --- Quantity Inputs ---

        function initializeQuantityInputs() {
            $$('.quantity-input-wrapper').forEach(wrapper => {
                const hiddenInput = wrapper.querySelector('.hidden-number-input');
                const visualInput = wrapper.querySelector('.quantity-value');
                const decreaseBtn = wrapper.querySelector('[data-action="decrease"]');
                const increaseBtn = wrapper.querySelector('[data-action="increase"]');
                const isMenuInput = wrapper.closest('#page-5') !== null;

                function updateState() {
                    const value = parseInt(hiddenInput.value, 10);
                    const min = parseInt(hiddenInput.min, 10);
                    visualInput.value = value;
                    if (!isNaN(min)) decreaseBtn.disabled = (value <= min);
                }

                decreaseBtn.addEventListener('click', () => {
                    let value = parseInt(hiddenInput.value, 10);
                    const min = parseInt(hiddenInput.min, 10);
                    if (value > min) {
                        hiddenInput.value = --value;
                        hiddenInput.dispatchEvent(new Event('input'));
                        updateState();
                        if (isMenuInput) updateMenuLimits();
                    }
                });

                increaseBtn.addEventListener('click', () => {
                    hiddenInput.value = parseInt(hiddenInput.value, 10) + 1;
                    hiddenInput.dispatchEvent(new Event('input'));
                    updateState();
                    if (isMenuInput) updateMenuLimits();
                });

                updateState();
            });
        }

        // --- Touch Feedback ---

        function initializeTouchFeedback() {
            $$('.btn-primary, .btn-secondary, .radio-option, .quantity-btn').forEach(el => {
                let isDragging = false;
                const isRadio = el.classList.contains('radio-option');
                const isQuantityBtn = el.classList.contains('quantity-btn');
                const options = { passive: isRadio || !isQuantityBtn };

                const addActiveClass = (event) => {
                    if (isRadio || isQuantityBtn) blurActiveElement();
                    isDragging = false;
                    if (isQuantityBtn) event.preventDefault();
                    el.classList.add('js-active');
                };

                const removeActiveClass = () => el.classList.remove('js-active');

                el.addEventListener('touchstart', addActiveClass, options);

                if (isRadio) {
                    el.addEventListener('touchmove', () => {
                        isDragging = true;
                        removeActiveClass();
                    }, { passive: true });
                }

                el.addEventListener('touchend', (event) => {
                    if (isDragging) { isDragging = false; return; }

                    const touchWasInside = isTouchInside(event, el);
                    removeActiveClass();

                    if (touchWasInside) {
                        event.preventDefault();
                        if (isRadio) {
                            const input = el.previousElementSibling;
                            if (input && input.type === 'radio') {
                                input.checked = true;
                                input.dispatchEvent(new Event('change'));
                            }
                        } else {
                            el.click();
                        }
                    }
                });

                el.addEventListener('touchcancel', () => {
                    isDragging = false;
                    removeActiveClass();
                });
            });
        }

        // --- Keyboard Close on Enter ---

        function initializeKeyboardClose() {
            $$('input[type="text"]:not([readonly]), textarea').forEach(field => {
                field.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.keyCode === 13) {
                        event.preventDefault();
                        field.blur();
                    }
                });
            });
        }

        // --- Conditional "Otro" Fields ---

        radioMenuSolo.forEach(radio => {
            radio.addEventListener('change', () => {
                const isOtro = $('input[name="menu_solo"]:checked', form)?.value === 'otro';
                otroSoloContainer.classList.toggle('hidden', !isOtro);
                const textarea = otroSoloContainer.querySelector('textarea');
                if (textarea) textarea.required = isOtro;
            });
        });

        if (otroMenuGrupoInput) {
            otroMenuGrupoInput.addEventListener('input', () => {
                const hasOtro = parseInt(otroMenuGrupoInput.value, 10) > 0;
                otroGrupoContainer.classList.toggle('hidden', !hasOtro);
                const textarea = otroGrupoContainer.querySelector('textarea');
                if (textarea) textarea.required = hasOtro;
            });
        }

        // --- Navigation Buttons ---

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                blurActiveElement();
                const action = button.getAttribute('data-nav');
                if (action === 'next') navigateNext();
                else if (action === 'prev') navigatePrev();
            });
        });

        // --- Form Submission ---

        submitBtn.addEventListener('click', () => {
            blurActiveElement();

            if (!validateCurrentPage()) return;

            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

            const formData = new FormData(form);
            const rawData = Object.fromEntries(formData.entries());

            const dataToSend = {
                nombre: rawData['full-name'],
                asistencia: rawData['asistencia'],
                grupo: rawData['grupo'],
                mensaje: (rawData['asistencia'] === 'si') ? rawData['mensaje-si-asiste'] : rawData['mensaje-no-asiste']
            };

            if (rawData['asistencia'] === 'si') {
                if (rawData['grupo'] === 'grupo') {
                    dataToSend.adultos = rawData['num-adultos'];
                    dataToSend.ninos = rawData['num-ninos'];
                    dataToSend.bebes = rawData['num-bebes'];
                    dataToSend.nombresGrupo = rawData['nombres-grupo'];
                    dataToSend.menuCarne = rawData['menu-carne'];
                    dataToSend.menuVeg = rawData['menu-vegetariano'];
                    dataToSend.menuVegan = rawData['menu-vegano'];
                    dataToSend.menuGluten = rawData['menu-sin-gluten'];
                    dataToSend.menuLactosa = rawData['menu-sin-lactosa'];
                    dataToSend.menuOtro = rawData['menu-otro'];
                    dataToSend.menuOtroSpec = rawData['otro-grupo-spec'];
                } else {
                    dataToSend.adultos = "1";
                    dataToSend.menuSolo = rawData['menu_solo'];
                    dataToSend.menuSoloSpec = rawData['otro-solo-spec'];
                }
            }

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(dataToSend)
            })
                .then(() => {
                    pageHistory.push('8');
                    showPage('8');
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Parece que no tienes Internet. Por favor intenta nuevamente mas tarde.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                });
        });

        // --- Close Modal Button ---

        const returnButton = $id('btn-cerrar-modal');
        if (returnButton) {
            returnButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.self !== window.top) {
                    window.parent.postMessage('closeFormModal', '*');
                } else {
                    window.location.reload();
                }
            });
        }

        // --- Initialize ---
        initializeKeyboardClose();
        initializeQuantityInputs();
        initializeTouchFeedback();
        showPage('portada');

    }); // end DOMContentLoaded

})();