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


    // --- 7. Project Modal Functionality ---
    // A. DOM Element Selection
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalButton = document.getElementById('modal-close-button');
    const projectsSection = document.getElementById('projects');

    // Placeholders for dynamic content
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalTechList = document.getElementById('modal-tech-list');
    const modalLinks = document.getElementById('modal-links');
    const modalMediaDisplay = document.getElementById('modal-media-display');
    const modalMediaThumbnails = document.getElementById('modal-media-thumbnails');

    let projectsData = [];

    // B. Fetch Project Data on Load
    async function fetchProjects() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            projectsData = await response.json();
        } catch (error) {
            console.error('Could not fetch projects data:', error);
        }
    }

    // C. Populate Modal with Project Data
    function populateModal(project) {
        modalTitle.textContent = project.title;
        modalDescription.innerHTML = (project.long_description || '').replace(/\n/g, '<br>');

        // Populate technologies
        modalTechList.innerHTML = (project.technologies || []).map((tech) =>
            `<span class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">${tech}</span>`
        ).join('');

        // Populate links
        modalLinks.innerHTML = (project.links || []).map((link) =>
            `<a href="${link.url}" target="_blank" class="inline-flex items-center text-blue-600 hover:underline">
                <i class="${link.icon} mr-2"></i> ${link.type}
            </a>`
        ).join('');

        // Populate media gallery
        modalMediaDisplay.innerHTML = '';
        modalMediaThumbnails.innerHTML = '';

        if (project.media && project.media.length > 0) {
            // Display the first media item by default
            displayMedia(project.media[0]);

            // Create thumbnails
            project.media.forEach((mediaItem) => {
                const thumb = document.createElement('img');
                thumb.src = mediaItem.type === 'video' ? 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Video' : mediaItem.src;
                thumb.alt = mediaItem.caption || '';
                thumb.className = 'w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-blue-500';
                thumb.onclick = () => displayMedia(mediaItem);
                modalMediaThumbnails.appendChild(thumb);
            });
        }
    }

    function displayMedia(mediaItem) {
        if (mediaItem.type === 'video') {
            modalMediaDisplay.innerHTML = `<video controls autoplay muted class="w-full h-full object-contain"><source src="${mediaItem.src}" type="video/mp4">Your browser does not support the video tag.</video>`;
        } else {
            modalMediaDisplay.innerHTML = `<img src="${mediaItem.src}" alt="${mediaItem.caption || ''}" class="w-full h-full object-contain">`;
        }
    }

    // D. Modal Control Functions
    const openModal = () => {
        if (!modal || !modalContent) return;
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
        document.body.classList.add('overflow-hidden');
    };

    const closeModal = () => {
        if (!modal || !modalContent) return;
        modal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('scale-95');
        document.body.classList.remove('overflow-hidden');
    };

    // E. Event Listeners
    // Fetch data when the page loads
    fetchProjects();

    // Open modal on project card click (using event delegation)
    if (projectsSection) {
        projectsSection.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (!card) return;

            // If the click originated on a link inside the card, allow normal navigation
            if (e.target.closest('a')) return;

            // Open modal for card clicks
            if (e.preventDefault) e.preventDefault();
            const projectId = card.dataset.projectId;
            const project = projectsData.find((p) => p.id === projectId);
            if (project) {
                populateModal(project);
                openModal();
            }
        });
    }

    // Close modal listeners
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('pointer-events-none')) {
            closeModal();
        }
    });
});