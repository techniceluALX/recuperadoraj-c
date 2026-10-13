(function () {
    'use strict';

    /* ---------- MENÚ MÓVIL ---------- */
    var navLinks = document.getElementById('navLinks');
    var menuToggle = document.getElementById('menuToggle');

    function closeMenu() {
        if (!navLinks) return;
        navLinks.classList.remove('open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
        if (!navLinks) return;
        var isOpen = navLinks.classList.toggle('open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', String(isOpen));
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    if (navLinks) {
        navLinks.addEventListener('click', function (e) {
            if (e.target.closest('a')) closeMenu();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 968) closeMenu();
    });

    /* ---------- AÑO DINÁMICO ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* ---------- SCROLL REVEAL ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('active'); });
    }

    /* ---------- FORMULARIO DE RECOGIDA ---------- */
    var form = document.getElementById('pickupForm');
    var status = document.getElementById('formStatus');
    var whatsappNumber = '573008152411';

    if (form && status) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var nombre = (data.get('nombre') || '').trim();
            var direccion = (data.get('direccion') || '').trim();
            var celular = (data.get('celular') || '').trim();
            var material = (data.get('material') || '').trim();

            if (!nombre || !direccion || !celular || !material) {
                status.className = 'form-status error';
                status.textContent = 'Por favor completa todos los campos.';
                return;
            }

            var message = [
                'Hola, quiero solicitar una recogida.',
                'Nombre: ' + nombre,
                'Dirección: ' + direccion,
                'Celular: ' + celular,
                'Material: ' + material
            ].join('\n');
            var whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);

            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            status.className = 'form-status ok';
            status.textContent = 'Continúa en WhatsApp para enviar tu solicitud. Si no se abrió, ';
            var whatsappLink = document.createElement('a');
            whatsappLink.href = whatsappUrl;
            whatsappLink.target = '_blank';
            whatsappLink.rel = 'noopener noreferrer';
            whatsappLink.textContent = 'ábrelo aquí';
            status.appendChild(whatsappLink);
        });
    }

    /* ---------- ESTADO DE CONEXIÓN ---------- */
    var offlineBar = document.getElementById('offlineBar');
    function updateOnlineStatus() {
        if (!offlineBar) return;
        offlineBar.hidden = navigator.onLine;
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    /* ---------- PWA: SERVICE WORKER ---------- */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function (err) {
                console.warn('No se pudo registrar el Service Worker:', err);
            });
        });
    }

    /* ---------- PWA: PROMPT DE INSTALACIÓN ---------- */
    var installBtn = document.getElementById('installBtn');
    var deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.hidden = false;
    });

    if (installBtn) {
        installBtn.addEventListener('click', function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.finally(function () {
                deferredPrompt = null;
                installBtn.hidden = true;
            });
        });
    }

    window.addEventListener('appinstalled', function () {
        if (installBtn) installBtn.hidden = true;
        deferredPrompt = null;
    });
})();
