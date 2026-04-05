(function() {
    // 1. Configuración: Obtener el ID del subdominio del script
    const scriptTag = document.currentScript;
    const subdomainId = scriptTag.getAttribute('data-subdomain');
    const backendUrl = 'http://localhost:5000/api/track'; // Cambiar a HTTPS en producción

    if (!subdomainId) {
        console.error('[DomainStats] Falta el data-subdomain en el script de rastreo.');
        return;
    }

    // 2. Función para enviar eventos al backend
    const sendEvent = (type) => {
        const payload = {
            subdomainId: subdomainId,
            type: type, // 'impression' o 'click'
            ua: navigator.userAgent,
            path: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        // Usar fetch con keepalive para asegurar que el evento se envíe al salir de la página (clics)
        fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true 
        }).catch(err => console.debug('[DomainStats] Error enviando track:', err));
    };

    // 3. Capturar Impresión (Carga de página)
    if (document.readyState === 'complete') {
        sendEvent('impression');
    } else {
        window.addEventListener('load', () => sendEvent('impression'));
    }

    // 4. Capturar Clics (Global)
    document.addEventListener('click', (e) => {
        // Opcional: Solo rastrear clics en enlaces o botones
        if (e.target.closest('a') || e.target.closest('button')) {
            sendEvent('click');
        }
    }, true);

})();
