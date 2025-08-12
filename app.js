document.addEventListener('DOMContentLoaded', () => {
    const NAVBAR_HEIGHT = 72; // Height of the fixed navigation bar in pixels

    // --- 1. Mobile Menu Functionality ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    const toggleMenu = () => {
        mobileMenu.classList.toggle('translate-x-full');
        mobileMenuOverlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden'); // Prevent scrolling when menu is open
    };

    if (mobileMenuButton && mobileMenu && mobileMenuOverlay) {
        mobileMenuButton.addEventListener('click', toggleMenu);
        mobileMenuOverlay.addEventListener('click', toggleMenu);
        mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', toggleMenu));
    }

    // --- 2. Smooth Scrolling for All Anchor Links ---
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - NAVBAR_HEIGHT,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 3. Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                backToTopButton.classList.add('opacity-0', 'pointer-events-none');
            }
        });
    }

    // --- 4. Animate Sections on Scroll using IntersectionObserver ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: stop observing once it's visible to save resources
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => observer.observe(el));


    // --- 5. Active Navigation Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinksDesktop = document.querySelectorAll('#nav-desktop a');
    const navLinksMobile = document.querySelectorAll('#mobile-menu a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const updateLinks = (links) => {
                    links.forEach(link => {
                        link.classList.toggle('text-blue-500', link.getAttribute('href') === `#${id}`);
                        link.classList.toggle('text-gray-600', link.getAttribute('href') !== `#${id}`);
                    });
                };
                updateLinks(navLinksDesktop);
                updateLinks(navLinksMobile);
            }
        });
    }, {
        rootMargin: `-${NAVBAR_HEIGHT}px 0px 0px 0px`, // Offset for the fixed navbar
        threshold: 0.2 // A smaller threshold to trigger when section starts entering
    });

    sections.forEach(section => sectionObserver.observe(section));


    // --- 6. Dynamic Copyright Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});