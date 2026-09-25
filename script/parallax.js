// Parallax scroll effect for the hero background layers on the home page.

(function () {
    const container = document.getElementById('bgLayers');

    if (!container) {
        return;
    }

    const layers = Array.from(container.querySelectorAll('.bgLayer')).map(function (layer) {
        return { element: layer, speed: parseFloat(layer.dataset.speed) || 0 };
    });

    // Respects users who have asked their system to reduce motion
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let ticking = false;

    function updateLayers() {
        // Stops once the hero has scrolled fully out of view
        const scrolled = reduceMotion.matches ? 0 : Math.min(Math.max(window.scrollY, 0), container.offsetHeight);

        layers.forEach(function (layer) {
            layer.element.style.transform = 'translate3d(0, ' + (scrolled * layer.speed) + 'px, 0)';
        });

        ticking = false;
    }

    // Updates at most once per frame, however often scroll events fire
    function requestUpdate() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(updateLayers);
        }
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    reduceMotion.addEventListener('change', requestUpdate);

    updateLayers();
})();
