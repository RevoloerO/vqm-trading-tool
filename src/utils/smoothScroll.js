/**
 * Smooth Scroll Utilities
 * Provides enhanced smooth scrolling with easing functions
 */

/**
 * Easing functions for smooth animations
 */
const easings = {
    // Ease in-out quad
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

    // Ease in-out cubic (smoother)
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // Ease out expo (fast then slow)
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

    // Ease in-out quart (very smooth)
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
};

/**
 * Smooth scroll to element with custom easing
 *
 * @param {string|HTMLElement} target - Element or selector to scroll to
 * @param {Object} options - Scroll options
 * @param {number} options.duration - Animation duration in ms (default 800)
 * @param {number} options.offset - Offset from top in pixels (default 100)
 * @param {string} options.easing - Easing function name (default 'easeInOutCubic')
 * @param {Function} options.onComplete - Callback when scroll completes
 * @returns {Promise} Resolves when scroll completes
 */
export function smoothScrollTo(target, options = {}) {
    const {
        duration = 800,
        offset = 100,
        easing = 'easeInOutCubic',
        onComplete = null
    } = options;

    return new Promise((resolve) => {
        // Get target element
        const element = typeof target === 'string'
            ? document.querySelector(target)
            : target;

        if (!element) {
            console.warn(`Smooth scroll target not found: ${target}`);
            resolve();
            return;
        }

        // Get positions
        const startPosition = window.pageYOffset;
        const targetPosition = element.offsetTop - offset;
        const distance = targetPosition - startPosition;

        // Get easing function
        const easingFunction = easings[easing] || easings.easeInOutCubic;

        let startTime = null;

        // Animation loop
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Apply easing
            const easedProgress = easingFunction(progress);

            // Calculate position
            const position = startPosition + (distance * easedProgress);

            // Scroll to position
            window.scrollTo(0, position);

            // Continue animation or complete
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                if (onComplete) onComplete();
                resolve();
            }
        }

        // Start animation
        requestAnimationFrame(animation);
    });
}

/**
 * Scroll to element with visual feedback
 * Adds a temporary highlight effect to the target
 *
 * @param {string|HTMLElement} target - Element to scroll to
 * @param {Object} options - Scroll options (same as smoothScrollTo)
 */
export function smoothScrollToWithHighlight(target, options = {}) {
    const element = typeof target === 'string'
        ? document.querySelector(target)
        : target;

    if (!element) return Promise.resolve();

    // Add highlight class
    element.classList.add('scroll-highlight');

    return smoothScrollTo(target, {
        ...options,
        onComplete: () => {
            // Remove highlight after a delay
            setTimeout(() => {
                element.classList.remove('scroll-highlight');
            }, 1000);

            if (options.onComplete) options.onComplete();
        }
    });
}

/**
 * Check if element is in viewport
 *
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Percentage of element that must be visible (0-1)
 * @returns {boolean} True if element is in viewport
 */
export function isInViewport(element, threshold = 0.3) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const elementHeight = rect.height;

    // Calculate how much of the element is visible
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(windowHeight, rect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visiblePercentage = visibleHeight / elementHeight;

    return visiblePercentage >= threshold;
}

/**
 * Get the currently visible section
 * Useful for updating navigation active state
 *
 * @param {Array<string>} sectionIds - Array of section IDs to check
 * @param {number} threshold - Visibility threshold (0-1)
 * @returns {string|null} ID of the most visible section
 */
export function getVisibleSection(sectionIds, threshold = 0.3) {
    let maxVisibility = 0;
    let visibleSection = null;

    sectionIds.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate visibility score (0-1)
        const visibleTop = Math.max(0, -rect.top);
        const visibleBottom = Math.max(0, rect.bottom - windowHeight);
        const elementHeight = rect.height;
        const visibleHeight = elementHeight - visibleTop - visibleBottom;
        const visibility = Math.max(0, Math.min(1, visibleHeight / elementHeight));

        if (visibility > maxVisibility && visibility >= threshold) {
            maxVisibility = visibility;
            visibleSection = id;
        }
    });

    return visibleSection;
}

/**
 * Scroll to top with smooth animation
 *
 * @param {Object} options - Scroll options
 * @returns {Promise} Resolves when scroll completes
 */
export function scrollToTop(options = {}) {
    const {
        duration = 600,
        easing = 'easeOutExpo',
        onComplete = null
    } = options;

    return new Promise((resolve) => {
        const startPosition = window.pageYOffset;
        const easingFunction = easings[easing] || easings.easeOutExpo;

        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const easedProgress = easingFunction(progress);
            const position = startPosition * (1 - easedProgress);

            window.scrollTo(0, position);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                if (onComplete) onComplete();
                resolve();
            }
        }

        requestAnimationFrame(animation);
    });
}

/**
 * Add scroll listener with throttling
 * Prevents excessive function calls during scroll
 *
 * @param {Function} callback - Function to call on scroll
 * @param {number} delay - Throttle delay in ms
 * @returns {Function} Cleanup function to remove listener
 */
export function onScroll(callback, delay = 100) {
    let ticking = false;
    let lastCall = 0;

    const throttledCallback = () => {
        const now = Date.now();

        if (!ticking && (now - lastCall >= delay)) {
            window.requestAnimationFrame(() => {
                callback();
                lastCall = now;
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', throttledCallback, { passive: true });

    // Return cleanup function
    return () => {
        window.removeEventListener('scroll', throttledCallback);
    };
}
