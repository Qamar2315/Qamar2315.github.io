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
    const freelanceSection = document.getElementById('freelance');

    // Placeholders for dynamic content
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalTechList = document.getElementById('modal-tech-list');
    const modalLinks = document.getElementById('modal-links');
    const modalMeta = document.getElementById('modal-meta');
    const modalFeatures = document.getElementById('modal-features');
    const modalChallenges = document.getElementById('modal-challenges');
    const modalMediaDisplay = document.getElementById('modal-media-display');
    const modalMediaThumbnails = document.getElementById('modal-media-thumbnails');

    let projectsData = [];
    let freelanceData = [];
    let profileData = {};

    // B. Fetch Project Data on Load
    async function fetchProjects() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            projectsData = await response.json();
            renderProjectsGrid(projectsData);
        } catch (error) {
            console.error('Could not fetch projects data:', error);
        }
    }

    async function fetchFreelanceWork() {
        try {
            const response = await fetch('freelance.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            freelanceData = await response.json();
            renderFreelanceGrid(freelanceData);
        } catch (error) {
            console.error('Could not fetch freelance data:', error);
        }
    }

    async function fetchProfileData() {
        try {
            const response = await fetch('profile.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            profileData = await response.json();
            renderProfileData(profileData);
            renderSkillsGrid(profileData.skills);
        } catch (error) {
            console.error('Could not fetch profile data:', error);
        }
    }

    // C. Populate Modal with Project Data
    function formatRichText(text) {
        if (!text) return '';
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1<\/strong>')
            .replace(/\n\n+/g, '<\/p><p>')
            .replace(/\n/g, '<br>');
        return `<p>${html}<\/p>`;
    }

    function populateModal(project) {
        modalTitle.textContent = project.title;
        modalDescription.innerHTML = formatRichText(project.long_description || '');

        // Populate meta badges
        if (modalMeta) {
            const metaItems = [];
            if (project.project_type) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-sm bg-slate-100 text-slate-700">${project.project_type}<\/span>`);
            if (project.status) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-sm bg-green-100 text-green-800">${project.status}<\/span>`);
            if (project.role) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-800">${project.role}<\/span>`);
            if (project.date_range) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-sm bg-purple-100 text-purple-800">${project.date_range}<\/span>`);
            modalMeta.innerHTML = metaItems.join('');
        }

        // Populate technologies
        modalTechList.innerHTML = (project.technologies || []).map((tech) =>
            `<span class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">${tech}</span>`
        ).join('');

        // Populate key features
        if (modalFeatures) {
            modalFeatures.innerHTML = (project.key_features || []).map((feat) =>
                `<li class="flex items-start"><i class="fas fa-check-circle text-blue-500 mt-1 mr-2"><\/i><span>${feat}<\/span><\/li>`
            ).join('');
        }

        // Populate links
        modalLinks.innerHTML = (project.links || []).map((link) =>
            `<a href="${link.url}" target="_blank" class="inline-flex items-center text-blue-600 hover:underline">
                <i class="${link.icon} mr-2"></i> ${link.type}
            </a>`
        ).join('');

        // Populate key challenges
        if (modalChallenges) {
            modalChallenges.innerHTML = (project.key_challenges || []).map((item) => `
                <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div class="font-semibold text-slate-700 mb-1">${item.challenge || ''}<\/div>
                    <div class="text-slate-600">${item.solution || ''}<\/div>
                <\/div>
            `).join('');
        }

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

    // --- New: Render Projects Grid Dynamically ---
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-md hover-card transition-all p-6 flex flex-col animate-on-scroll project-card cursor-pointer';
        card.dataset.projectId = project.id || '';

        const title = document.createElement('h3');
        title.className = 'text-xl font-bold mb-2 text-slate-800';
        title.textContent = project.title || 'Untitled Project';

        const desc = document.createElement('p');
        desc.className = 'text-slate-600 mb-4 flex-grow';
        desc.textContent = project.short_description || '';

        const primaryLink = (project.links || [])[0];
        const link = document.createElement('a');
        if (primaryLink && primaryLink.url) {
            link.href = primaryLink.url;
            link.target = '_blank';
            link.className = 'text-blue-500 hover:underline font-semibold';
            link.innerHTML = `${primaryLink.type || 'Link'} <i class="fas fa-arrow-right ml-1"></i>`;
        } else {
            link.href = '#';
            link.className = 'text-slate-400 cursor-default';
            link.textContent = 'Details';
        }

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(link);
        return card;
    }

    function renderProjectsGrid(projects) {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;
        grid.innerHTML = '';
        (projects || []).forEach((p) => {
            const card = createProjectCard(p);
            grid.appendChild(card);
        });

        // Re-observe newly created elements for scroll animations
        const newAnimated = grid.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));
    }

    // --- New: Render Freelance Grid Dynamically ---
    function createFreelanceCard(work) {
        const card = document.createElement('div');
        card.className = 'bg-slate-50 rounded-xl shadow-md hover-card transition-all p-6 animate-on-scroll freelance-card cursor-pointer';
        card.dataset.freelanceId = work.id || '';

        const title = document.createElement('h3');
        title.className = 'text-xl font-bold mb-2 text-slate-800';
        title.textContent = work.title || 'Untitled Project';

        const desc = document.createElement('p');
        desc.className = 'text-slate-600';
        desc.textContent = work.short_description || '';

        card.appendChild(title);
        card.appendChild(desc);
        return card;
    }

    function renderFreelanceGrid(freelanceWork) {
        const grid = document.querySelector('#freelance .grid');
        if (!grid) return;
        grid.innerHTML = '';
        (freelanceWork || []).forEach((work) => {
            const card = createFreelanceCard(work);
            grid.appendChild(card);
        });

        // Re-observe newly created elements for scroll animations
        const newAnimated = grid.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));
    }

    // --- New: Render Profile Data ---
    function renderProfileData(data) {
        const personalInfo = data.personal_info;
        
        // Update profile information
        const profileName = document.getElementById('profile-name');
        const profileTitle = document.getElementById('profile-title');
        const profileDescription = document.getElementById('profile-description');
        const profileImage = document.getElementById('profile-image');
        const resumeDownload = document.getElementById('resume-download');
        
        if (profileName) profileName.textContent = personalInfo.name;
        if (profileTitle) profileTitle.textContent = personalInfo.title;
        if (profileDescription) profileDescription.textContent = personalInfo.description;
        if (profileImage) {
            profileImage.src = personalInfo.profile_image;
            profileImage.alt = personalInfo.name;
        }
        if (resumeDownload) {
            resumeDownload.href = personalInfo.resume_file;
            resumeDownload.download = `${personalInfo.name.replace(/\s+/g, '-')}-Resume.pdf`;
        }
    }

    // --- New: Render Skills Grid ---
    function renderSkillsGrid(skillsData) {
        const grid = document.getElementById('skills-grid');
        const title = document.getElementById('skills-title');
        const subtitle = document.getElementById('skills-subtitle');
        
        if (!grid) return;
        
        // Update title and subtitle
        if (title) title.textContent = skillsData.title;
        if (subtitle) subtitle.textContent = skillsData.subtitle;
        
        // Clear existing content
        grid.innerHTML = '';
        
        // Flatten all skills from all categories
        const allSkills = [];
        skillsData.categories.forEach(category => {
            category.skills.forEach(skill => {
                allSkills.push(skill);
            });
        });
        
        // Create skill elements with staggered animation delays
        allSkills.forEach((skill, index) => {
            const skillElement = document.createElement('div');
            skillElement.className = 'flex flex-col items-center animate-on-scroll skill-icon';
            skillElement.style.transitionDelay = `${(index + 1) * 50}ms`;
            
            skillElement.innerHTML = `
                <i class="${skill.icon} text-5xl text-gray-400 mb-2 transition-all"></i>
                <span>${skill.name}</span>
            `;
            
            grid.appendChild(skillElement);
        });
        
        // Re-observe newly created elements for scroll animations
        const newAnimated = grid.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));
    }

    function populateFreelanceModal(work) {
        modalTitle.textContent = work.title;

        // --- NEW: Media Gallery Logic ---
        modalMediaDisplay.innerHTML = '';
        modalMediaThumbnails.innerHTML = '';

        if (work.media && work.media.length > 0) {
            // Display the first media item by default
            displayMedia(work.media[0]);

            // Create thumbnails
            work.media.forEach((mediaItem) => {
                const thumbSrc = mediaItem.type === 'video'
                    ? 'https://via.placeholder.com/150/22c55e/FFFFFF?text=Demo'
                    : mediaItem.src;
                const thumb = document.createElement('img');
                thumb.src = thumbSrc;
                thumb.alt = mediaItem.caption || '';
                thumb.className = 'w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-green-500';
                thumb.onclick = () => displayMedia(mediaItem);
                modalMediaThumbnails.appendChild(thumb);
            });
        } else {
            // Provide a default placeholder if no media is available
            modalMediaDisplay.innerHTML = `<div class="p-4 h-full flex items-center justify-center bg-slate-100 rounded-lg">
                                           <i class="fas fa-briefcase text-4xl text-slate-400"></i>
                                       </div>`;
        }

        // --- EXISTING: Details Logic (with slight adjustments) ---
        const descriptionHTML = `
            <h3 class="text-xl font-semibold text-slate-700 mb-2">The Challenge</h3>
            <p class="text-slate-600 mb-4">${work.problem_statement || ''}</p>
            <h3 class="text-xl font-semibold text-slate-700 mb-2">My Solution</h3>
            <p class="text-slate-600">${work.solution_delivered || ''}</p>
        `;
        modalDescription.innerHTML = descriptionHTML;

        modalTechList.innerHTML = (work.technologies || []).map((tech) =>
            `<span class="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-1 rounded-full">${tech}</span>`
        ).join('');

        const achievementsHTML = (work.key_achievements || []).map((ach) =>
            `<li class="flex items-start">
            <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
            <span>${ach}</span>
        </li>`
        ).join('');

        const feedbackHTML = work.client_feedback ? `
            <div class="mt-6 p-4 bg-slate-100 border-l-4 border-blue-500 rounded-r-lg">
                <p class="italic text-slate-600">"${work.client_feedback.quote}"</p>
                <p class="text-right font-semibold text-slate-700 mt-2">- ${work.client_feedback.client_name}</p>
            </div>
        ` : '';

        modalLinks.innerHTML = `
            <h3 class="text-xl font-semibold text-slate-700 mt-6 mb-3">Key Achievements</h3>
            <ul class="space-y-2 list-none text-slate-600">
            ${achievementsHTML}
            </ul>
            ${feedbackHTML}
        `;
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
    fetchFreelanceWork();
    fetchProfileData();

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

    if (freelanceSection) {
        freelanceSection.addEventListener('click', (e) => {
            const card = e.target.closest('.freelance-card');
            if (!card) return;

            if (e.target.closest('a')) return;

            if (e.preventDefault) e.preventDefault();
            const freelanceId = card.dataset.freelanceId;
            const work = freelanceData.find((w) => w.id === freelanceId);
            if (work) {
                populateFreelanceModal(work);
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