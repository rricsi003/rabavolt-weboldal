(() => {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.defaultPrevented || event.button > 0 || event.metaKey ||
            event.ctrlKey || event.shiftKey || event.altKey) return;

        const hash = link.getAttribute('href');
        const target = document.getElementById(hash.slice(1));
        if (!target) return;

        // Prevent the anchor's immediate jump; let the browser animate the scroll.
        event.preventDefault();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Update the shareable URL without triggering another anchor jump.
        if (window.location.hash !== hash) history.pushState(null, '', hash);
    });
})();

(() => {
    const form = document.getElementById('quote-form');
    const status = document.getElementById('quote-status');
    if (!form || !status) return;
    const submitButton = form.querySelector('button[type="submit"]');
    let sending = false;

    function showStatus(message, state) {
        status.textContent = message;
        status.dataset.state = state;
        status.hidden = false;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (sending) return;
        for (const field of form.querySelectorAll('input, textarea')) {
            field.setCustomValidity(field.value.trim() ? '' : 'Kérjük, töltse ki ezt a mezőt.');
        }
        if (!form.reportValidity()) return;

        // Capture the values before disabling the fields during submission.
        const data = new FormData(form);
        const fields = [...form.querySelectorAll('input, select, textarea')];
        sending = true;
        submitButton.disabled = true;
        submitButton.textContent = 'Küldés folyamatban…';
        fields.forEach((field) => { field.disabled = true; });
        form.setAttribute('aria-busy', 'true');
        showStatus('Ajánlatkérés küldése folyamatban…', 'pending');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(form.action, {
                method: form.method.toUpperCase(),
                body: data,
                headers: { Accept: 'application/json' },
                signal: controller.signal
            });
            if (response.ok) {
                form.reset();
                showStatus('Köszönjük! Ajánlatkérését sikeresen elküldtük. Hamarosan felvesszük Önnel a kapcsolatot.', 'success');
            } else {
                showStatus('Az ajánlatkérést nem sikerült elküldeni. A megadott adatok megmaradtak. Kérjük, próbálja újra később, vagy hívjon minket a +36 30 123 4567 számon.', 'error');
            }
        } catch {
            showStatus('A küldést nem sikerült visszaigazolni. Ellenőrizze az internetkapcsolatát. Az adatok megmaradtak; kérjük, próbálja újra később, vagy egyeztessen telefonon: +36 30 123 4567.', 'error');
        } finally {
            clearTimeout(timeout);
            sending = false;
            fields.forEach((field) => { field.disabled = false; });
            submitButton.disabled = false;
            submitButton.textContent = 'Ajánlatot kérek';
            form.removeAttribute('aria-busy');
        }
    });
    form.addEventListener('input', (event) => {
        if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
        if (!sending) status.hidden = true;
    });
    form.addEventListener('change', () => { if (!sending) status.hidden = true; });
})();