(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame;

    function stopAnimation() {
        cancelAnimationFrame(animationFrame);
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
                event.ctrlKey || event.shiftKey || event.altKey) return;

            const hash = link.getAttribute('href');
            const target = document.getElementById(hash.slice(1));
            if (!target) return;

            event.preventDefault();
            stopAnimation();

            const startY = window.scrollY;
            const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
            const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const endY = Math.min(maxY, Math.max(0,
                startY + target.getBoundingClientRect().top - margin));

            if (window.location.hash !== hash) history.pushState(null, '', hash);

            function finish() {
                // Move keyboard navigation to the destination without another scroll.
                if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }

            if (reducedMotion.matches) {
                window.scrollTo({ top: endY, behavior: 'instant' });
                finish();
                return;
            }

            const startedAt = performance.now();
            function animate(now) {
                const progress = Math.min(1, (now - startedAt) / 320);
                const eased = 1 - Math.pow(1 - progress, 3);
                window.scrollTo({ top: startY + (endY - startY) * eased, behavior: 'instant' });
                if (progress < 1) animationFrame = requestAnimationFrame(animate);
                else finish();
            }
            animationFrame = requestAnimationFrame(animate);
        });
    });

    window.addEventListener('wheel', stopAnimation, { passive: true });
    window.addEventListener('touchstart', stopAnimation, { passive: true });
    window.addEventListener('pointerdown', stopAnimation, { passive: true });
    window.addEventListener('popstate', stopAnimation);
    window.addEventListener('resize', stopAnimation);
    reducedMotion.addEventListener('change', stopAnimation);
    window.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) {
            stopAnimation();
        }
    });
})();
