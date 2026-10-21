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
