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



    let projectsData = [];
    let freelanceData = [];
    let profileData = {};
    let experienceData = [];
    let educationData = {};
    let sectionsData = {};

    // B. Fetch Project Data on Load
    async function fetchProjects() {
        try {
            const response = await fetch('json_data/projects.json');
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
            const response = await fetch('json_data/freelance.json');
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
            const response = await fetch('json_data/profile.json');
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

    async function fetchExperience() {
        try {
            const response = await fetch('json_data/experience.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            experienceData = await response.json();
            renderExperienceTimeline(experienceData);
        } catch (error) {
            console.error('Could not fetch experience data:', error);
        }
    }

    async function fetchEducation() {
        try {
            const response = await fetch('json_data/education.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            educationData = await response.json();
            renderEducation(educationData);
        } catch (error) {
            console.error('Could not fetch education data:', error);
        }
    }

    async function fetchSections() {
        try {
            const response = await fetch('json_data/sections.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            sectionsData = await response.json();
            renderSections(sectionsData);
        } catch (error) {
            console.error('Could not fetch sections data:', error);
        }
    }


    // --- New: Render Projects Grid Dynamically ---
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'group bg-white rounded-xl shadow-md hover-card transition-all p-6 flex flex-col animate-on-scroll project-card cursor-pointer relative';
        card.dataset.projectId = project.id || '';

        // Add an icon in the corner that appears on hover
        card.innerHTML = `
            <div class="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
                <i class="fas fa-expand-alt"></i>
            </div>
            <h3 class="text-xl font-bold mb-2 text-slate-800">${project.title || 'Untitled Project'}</h3>
            <p class="text-slate-600 mb-4 flex-grow">${project.short_description || ''}</p>
            <div class="mt-auto">
                <span class="text-blue-500 font-semibold">View Details <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i></span>
            </div>
        `;
        return card;
    }

    function renderProjectsGrid(projects) {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;
        grid.innerHTML = ''; // This will clear the skeleton loaders
        (projects || []).forEach((p) => {
            const card = createProjectCard(p);
            grid.appendChild(card);
        });

        // Re-observe newly created elements for scroll animations
        const newAnimated = grid.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));

        // Set up modal listener after data is loaded
        setupModalOpenListener(projectsSection, projectsData, 'data-project-id');
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
        grid.innerHTML = ''; // This will clear the skeleton loaders
        (freelanceWork || []).forEach((work) => {
            const card = createFreelanceCard(work);
            grid.appendChild(card);
        });

        // Re-observe newly created elements for scroll animations
        const newAnimated = grid.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));

        // Set up modal listener after data is loaded
        setupModalOpenListener(freelanceSection, freelanceData, 'data-freelance-id');
    }

    // --- New: Render Profile Data ---
    function renderProfileData(data) {
        const personalInfo = data.personal_info;
        
        // Select skeleton and content containers
        const skeleton = document.getElementById('introduction-skeleton');
        const content = document.getElementById('introduction-content');
        const imageSkeleton = document.getElementById('profile-image-skeleton');
        const profileImage = document.getElementById('profile-image');
        
        // Update profile information (select elements within the content container)
        const profileName = content.querySelector('#profile-name');
        const profileTitle = content.querySelector('#profile-title');
        const profileDescription = content.querySelector('#profile-description');
        const resumeDownload = content.querySelector('#resume-download');
        
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
        
        // Update contact information
        if (personalInfo.contact_info) {
            const contactEmail = document.getElementById('contact-email');
            const contactEmailText = document.getElementById('contact-email-text');
            const contactPhone = document.getElementById('contact-phone');
            const contactLocation = document.getElementById('contact-location');
            const contactCtaButton = document.getElementById('contact-cta-button');
            
            if (contactEmail) contactEmail.href = `mailto:${personalInfo.contact_info.email}`;
            if (contactEmailText) contactEmailText.textContent = personalInfo.contact_info.email;
            if (contactPhone) contactPhone.textContent = personalInfo.contact_info.phone;
            if (contactLocation) contactLocation.textContent = personalInfo.contact_info.location;
            if (contactCtaButton) contactCtaButton.href = `mailto:${personalInfo.contact_info.email}`;
        }
        
        // Update footer information
        if (personalInfo.footer) {
            const footerName = document.getElementById('footer-name');
            const footerCopyright = document.getElementById('footer-copyright');
            
            if (footerName) footerName.textContent = personalInfo.name;
            if (footerCopyright) footerCopyright.textContent = personalInfo.footer.copyright_text;
        }
        
        // Add Social Links
        const socialLinksContainer = document.getElementById('social-links-container');
        if (socialLinksContainer && personalInfo.bio_details.professional_links) {
            socialLinksContainer.innerHTML = ''; // Clear previous
            personalInfo.bio_details.professional_links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.title = link.name;
                a.className = 'text-slate-500 hover:text-blue-500 transition-colors duration-300';
                a.innerHTML = `<i class="${link.icon} text-3xl"></i>`; // Assumes an icon class is provided
                socialLinksContainer.appendChild(a);
            });
        }
        
        // Hide skeleton and show content
        if (skeleton) skeleton.classList.add('hidden');
        if (content) content.classList.remove('hidden');
        if (imageSkeleton) imageSkeleton.classList.add('hidden');
        if (profileImage) profileImage.classList.remove('hidden');
    }

    // --- New: Render Skills Grid ---
    function renderSkillsGrid(skillsData) {
        const container = document.getElementById('skills'); // Target the whole section
        const grid = document.getElementById('skills-grid');
        const title = document.getElementById('skills-title');
        const subtitle = document.getElementById('skills-subtitle');
        const skeleton = document.getElementById('skills-skeleton');
        const content = document.getElementById('skills-content');

        if (!grid || !container) return;

        // Update title and subtitle
        if (title) title.textContent = skillsData.title;
        if (subtitle) subtitle.textContent = skillsData.subtitle;

        // Hide skeleton and show content
        if (skeleton) skeleton.classList.add('hidden');
        if (content) content.classList.remove('hidden');

        // Clear the placeholder grid
        grid.innerHTML = '';
        // We will append category sections directly to the main container,
        // so we'll adjust the main grid to be a flex container.
        grid.className = 'flex flex-col gap-12'; // Change grid to a flex column

        // Create a section for each category
        (skillsData.categories || []).forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'animate-on-scroll';

            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'text-xl font-semibold text-center text-slate-700 mb-6';
            categoryTitle.textContent = category.name;

            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'flex flex-wrap justify-center gap-8';

            category.skills.forEach((skill, index) => {
                const skillElement = document.createElement('div');
                skillElement.className = 'flex flex-col items-center skill-icon w-24'; // Give it a fixed width
                skillElement.style.transitionDelay = `${(index + 1) * 50}ms`;
                
                skillElement.innerHTML = `
                    <i class="${skill.icon} text-5xl text-gray-400 mb-2 transition-all"></i>
                    <span class="text-center">${skill.name}</span>
                `;
                skillsContainer.appendChild(skillElement);
            });

            categorySection.appendChild(categoryTitle);
            categorySection.appendChild(skillsContainer);
            grid.appendChild(categorySection);
        });

        // Re-observe newly created elements
        const newAnimated = container.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));
    }

    // --- New: Render Experience Timeline ---
    function renderExperienceTimeline(experience) {
        const timelineContainer = document.getElementById('experience-timeline');
        if (!timelineContainer) return;

        timelineContainer.innerHTML = ''; // Clear any existing content

        (experience || []).forEach(job => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item relative pl-8 pb-8 animate-on-scroll';

            // Create the list of responsibilities
            const responsibilitiesHTML = (job.responsibilities || []).map(item => `<li>${item}</li>`).join('');

            timelineItem.innerHTML = `
                <div class="timeline-dot w-4 h-4 border-2 border-blue-500">
                    <div class="timeline-dot-inner w-2 h-2 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div class="bg-slate-100/70 p-6 rounded-lg shadow-sm">
                    <p class="text-sm font-semibold text-blue-600">${job.date_range}</p>
                    <h3 class="text-lg font-bold text-slate-800 mt-1">${job.title}, ${job.company}</h3>
                    <ul class="list-disc list-inside text-slate-600 space-y-1 mt-3">
                        ${responsibilitiesHTML}
                    </ul>
                </div>
            `;
            timelineContainer.appendChild(timelineItem);
        });
        
        // Re-observe newly created elements for scroll animations
        const newAnimated = timelineContainer.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));
    }

    // --- New: Render Education ---
    function renderEducation(data) {
        const titleEl = document.getElementById('education-title');
        const subtitleEl = document.getElementById('education-subtitle');
        const listEl = document.getElementById('education-list');
        const skeleton = document.getElementById('education-skeleton');
        const content = document.getElementById('education-content');

        if (!titleEl || !subtitleEl || !listEl) return;

        // Populate title and subtitle
        titleEl.textContent = data.title || 'Educational Background';
        subtitleEl.textContent = data.subtitle || '';

        // Hide skeleton and show content
        if (skeleton) skeleton.classList.add('hidden');
        if (content) content.classList.remove('hidden');

        // Clear and populate the list of degrees
        listEl.innerHTML = '';
        (data.items || []).forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white p-8 rounded-xl shadow-md text-center animate-on-scroll';
            card.innerHTML = `
                <h3 class="text-2xl font-semibold text-blue-900">${item.degree}</h3>
                <p class="text-lg text-gray-600 mt-2">${item.institution}</p>
                <p class="text-md text-gray-500 mt-1">${item.date_range}</p>
            `;
            listEl.appendChild(card);
        });

        // Re-observe newly created elements for scroll animations
        const newAnimated = listEl.querySelectorAll('.animate-on-scroll');
        newAnimated.forEach(el => observer.observe(el));
    }

    // --- New: Render Sections Data ---
    function renderSections(data) {
        // Update projects section
        if (data.projects) {
            const projectsTitle = document.getElementById('projects-title');
            const projectsSubtitle = document.getElementById('projects-subtitle');
            
            if (projectsTitle) projectsTitle.textContent = data.projects.title;
            if (projectsSubtitle) projectsSubtitle.textContent = data.projects.subtitle;
        }
        
        // Update experience section
        if (data.experience) {
            const experienceTitle = document.getElementById('experience-title');
            
            if (experienceTitle) experienceTitle.textContent = data.experience.title;
        }
        
        // Update freelance section
        if (data.freelance) {
            const freelanceTitle = document.getElementById('freelance-title');
            const freelanceSubtitle = document.getElementById('freelance-subtitle');
            
            if (freelanceTitle) freelanceTitle.textContent = data.freelance.title;
            if (freelanceSubtitle) freelanceSubtitle.textContent = data.freelance.subtitle;
        }
        
        // Update contact section
        if (data.contact) {
            const contactTitle = document.getElementById('contact-title');
            const contactSubtitle = document.getElementById('contact-subtitle');
            
            if (contactTitle) contactTitle.textContent = data.contact.title;
            if (contactSubtitle) contactSubtitle.textContent = data.contact.subtitle;
        }
    }


    // Fetch data when the page loads
    fetchProjects();
    fetchFreelanceWork();
    fetchProfileData();
    fetchExperience();
    fetchEducation();
    fetchSections();

    // --- 8. UNIFIED PROJECT MODAL LOGIC ---

    // A. DOM Element Selection
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalButton = document.getElementById('modal-close-button');
    const projectsSection = document.getElementById('projects');
    const freelanceSection = document.getElementById('freelance');

    // Modal Content Placeholders
    const modalTitle = document.getElementById('modal-title');
    const modalMetaTags = document.getElementById('modal-meta-tags');
    const modalMediaDisplay = document.getElementById('modal-media-display');
    const modalMediaThumbnails = document.getElementById('modal-media-thumbnails');
    const modalMainDescription = document.getElementById('modal-main-description');
    const modalFeaturesBlock = document.getElementById('modal-features-block');
    const modalFeaturesTitle = document.getElementById('modal-features-title');
    const modalFeaturesList = document.getElementById('modal-features-list');
    const modalFeedbackBlock = document.getElementById('modal-feedback-block');
    const modalFeedbackQuote = document.getElementById('modal-feedback-quote');
    const modalFeedbackClient = document.getElementById('modal-feedback-client');
    const modalChallengesBlock = document.getElementById('modal-challenges-block');
    const modalChallengesList = document.getElementById('modal-challenges-list');
    const modalTechBlock = document.getElementById('modal-tech-block');
    const modalTechList = document.getElementById('modal-tech-list');
    const modalLinksBlock = document.getElementById('modal-links-block');
    const modalLinksList = document.getElementById('modal-links-list');

    // B. Helper function to display media
    function displayMedia(mediaItem) {
        if (!modalMediaDisplay) return;
        if (mediaItem.type === 'video') {
            modalMediaDisplay.innerHTML = `<video controls autoplay muted loop class="w-full h-full object-contain"><source src="${mediaItem.src}" type="video/mp4">Your browser does not support the video tag.</video>`;
        } else {
            modalMediaDisplay.innerHTML = `<img src="${mediaItem.src}" alt="${mediaItem.caption || ''}" class="w-full h-full object-contain">`;
        }
    }

    // C. The New Unified Populate Modal Function
    function populateModal(item) {
        if (!modal) return;

        // --- 1. Reset Modal State ---
        // Hide all optional blocks to ensure a clean slate for every open
        [modalFeaturesBlock, modalFeedbackBlock, modalChallengesBlock, modalTechBlock, modalLinksBlock].forEach(block => {
            if (block) block.classList.add('hidden');
        });
        // Clear dynamic content
        [modalMetaTags, modalMediaThumbnails, modalMainDescription, modalFeaturesList, modalChallengesList, modalTechList, modalLinksList].forEach(el => {
            if (el) el.innerHTML = '';
        });
        modalTitle.textContent = item.title || 'Details';


        // --- 2. Populate Header & Meta Tags ---
        const metaItems = [];
        if (item.role) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${item.role}</span>`);
        if (item.project_type) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">${item.project_type}</span>`);
        if (item.status) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">${item.status}</span>`);
        if (item.date_range) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">${item.date_range}</span>`);
        modalMetaTags.innerHTML = metaItems.join('');


        // --- 3. Populate Media Gallery ---
        modalMediaDisplay.innerHTML = '<div class="p-4 h-full flex items-center justify-center bg-slate-100 rounded-lg"><i class="fas fa-image text-4xl text-slate-400"></i></div>'; // Default
        if (item.media && item.media.length > 0) {
            displayMedia(item.media[0]); // Display first item
            item.media.forEach((mediaItem, index) => {
                const thumbSrc = mediaItem.type === 'video' ? 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Video' : mediaItem.src;
                const thumb = document.createElement('img');
                thumb.src = thumbSrc;
                thumb.alt = mediaItem.caption || '';
                thumb.className = `w-16 h-16 object-cover rounded-md cursor-pointer border-2 hover:border-blue-500 ${index === 0 ? 'border-blue-500' : 'border-transparent'}`;
                thumb.onclick = (e) => {
                    displayMedia(mediaItem);
                    // Update active thumbnail border
                    modalMediaThumbnails.querySelectorAll('img').forEach(img => img.classList.remove('border-blue-500'));
                    e.target.classList.add('border-blue-500');
                };
                modalMediaThumbnails.appendChild(thumb);
            });
        }

        // --- 4. Populate Main Description ---
        let descriptionHTML = '';
        if (item.long_description) {
            descriptionHTML = `<p>${item.long_description.replace(/\n/g, '</p><p>')}</p>`;
        } else if (item.problem_statement) {
            descriptionHTML = `
                <h4 class="font-semibold text-slate-800">The Challenge</h4>
                <p class="mb-4">${item.problem_statement}</p>
                <h4 class="font-semibold text-slate-800">My Solution</h4>
                <p>${item.solution_delivered}</p>
            `;
        }
        modalMainDescription.innerHTML = descriptionHTML;


        // --- 5. Populate Key Features / Achievements ---
        const features = item.key_features || item.key_achievements;
        if (features && features.length > 0) {
            modalFeaturesBlock.classList.remove('hidden');
            const isAchievement = !!item.key_achievements;
            modalFeaturesTitle.innerHTML = `<i class="fas ${isAchievement ? 'fa-trophy text-yellow-500' : 'fa-star text-blue-500'} mr-2"></i>Key ${isAchievement ? 'Achievements' : 'Features'}`;
            modalFeaturesList.innerHTML = features.map(feat => `
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>${feat}</span>
                </li>
            `).join('');
        }

        // --- 6. Populate Client Feedback (Freelance Only) ---
        if (item.client_feedback) {
            modalFeedbackBlock.classList.remove('hidden');
            modalFeedbackQuote.textContent = `"${item.client_feedback.quote}"`;
            modalFeedbackClient.textContent = `- ${item.client_feedback.client_name}`;
        }

        // --- 7. Populate Key Challenges (Projects Only) ---
        if (item.key_challenges && item.key_challenges.length > 0) {
            modalChallengesBlock.classList.remove('hidden');
            modalChallengesList.innerHTML = item.key_challenges.map(c => `
                <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div class="font-semibold text-slate-700 mb-1">${c.challenge}</div>
                    <div class="text-slate-600">${c.solution}</div>
                </div>
            `).join('');
        }

        // --- 8. Populate Technologies ---
        if (item.technologies && item.technologies.length > 0) {
            modalTechBlock.classList.remove('hidden');
            const techColor = item.problem_statement ? 'green' : 'blue'; // Green for freelance, blue for personal
            modalTechList.innerHTML = item.technologies.map(tech =>
                `<span class="bg-${techColor}-100 text-${techColor}-800 text-sm font-medium px-2.5 py-1 rounded-full">${tech}</span>`
            ).join('');
        }

        // --- 9. Populate Links ---
        if (item.links && item.links.length > 0) {
            modalLinksBlock.classList.remove('hidden');
            modalLinksList.innerHTML = item.links.map(link =>
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 font-medium hover:underline hover:text-blue-800 transition-colors">
                    <i class="${link.icon || 'fas fa-external-link-alt'} mr-2"></i>
                    <span>${link.type}</span>
                </a>`
            ).join('');
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
        // Stop any video that might be playing
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
            video.src = '';
        }
    };

    // E. NEW Event Listeners
    function setupModalOpenListener(section, data, idAttribute) {
        if (section) {
            section.addEventListener('click', (e) => {
                const card = e.target.closest(`[${idAttribute}]`);
                if (!card) return;

                // Allow normal navigation if a link inside the card was clicked
                if (e.target.closest('a') && e.target.closest('a').getAttribute('target') === '_blank') return;

                e.preventDefault();
                const itemId = card.getAttribute(idAttribute);
                const item = data.find((p) => p.id === itemId);
                if (item) {
                    populateModal(item);
                    openModal();
                }
            });
        }
    }

    // Set up listeners for both sections (will be called after data loads)
    // setupModalOpenListener(projectsSection, projectsData, 'data-project-id');
    // setupModalOpenListener(freelanceSection, freelanceData, 'data-freelance-id');

    // Close modal listeners (should already be in your code, but here for completeness)
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
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('pointer-events-none')) {
            closeModal();
        }
    });

    // --- 9. AI CHATBOT IMPLEMENTATION V3 (Final) ---
    // A. DOM Element Selection
    const chatTrigger = document.getElementById('ai-chat-trigger');
    const chatOverlay = document.getElementById('chat-overlay');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseButton = document.getElementById('chat-close-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send');
    const typingIndicator = document.getElementById('typing-indicator');

    const API_URL = 'https://your-deployed-backend-url.com/api/chat';
    let conversationHistory = [];

    // B. Core Functions
    const openChat = () => {
        chatOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scroll

        // Trick to trigger CSS transition
        setTimeout(() => {
            chatOverlay.classList.remove('opacity-0');
            chatWindow.classList.remove('scale-95');
        }, 10);

        if (chatMessages.children.length === 0) {
            addMessageToUI('assistant', "Hello! I'm Qamar's AI assistant, trained on his portfolio data. Ask me anything about his projects, skills, or professional experience.");
        }
        chatInput.focus();
    };

    const closeChat = () => {
        chatOverlay.classList.add('opacity-0');
        chatWindow.classList.add('scale-95');
        document.body.style.overflow = ''; // Restore background scroll

        setTimeout(() => {
            chatOverlay.classList.add('hidden');
        }, 300); // Match transition duration
    };

    const addMessageToUI = (sender, message) => {
        const messageElement = document.createElement('div');
        messageElement.className = `flex mb-4 ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'animate-on-scroll is-visible'; 
        
        const messageContent = document.createElement('div');

        if (sender === 'user') {
            // User messages are plain text
            messageContent.textContent = message;
        } else {
            // AI messages are parsed as Markdown
            // The 'prose' class from Tailwind helps style the HTML nicely
            messageContent.className += ' prose prose-sm max-w-none'; 
            messageContent.innerHTML = marked.parse(message);
        }
        
        // Add base classes
        messageContent.classList.add('max-w-md', 'p-3', 'rounded-2xl', 'text-sm');
        
        // Add sender-specific classes
        if (sender === 'user') {
            messageContent.classList.add('bg-blue-600', 'text-white', 'rounded-br-none');
        } else {
            messageContent.classList.add('bg-slate-100', 'text-slate-800', 'rounded-bl-none', 'assistant-bubble');
        }
        
        messageWrapper.appendChild(messageContent);
        messageElement.appendChild(messageWrapper);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        addMessageToUI('user', userText);
        conversationHistory.push({ role: 'user', content: userText });
        
        chatInput.value = '';
        chatSendButton.disabled = true;
        typingIndicator.classList.remove('hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userText,
                    history: conversationHistory.slice(-5)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }
            const data = await response.json();
            
            // --- NEW: Pre-process the response to clean up links ---
            let formattedAnswer = data.answer.replace(/\[(https?:\/\/[^\s\]]+)\]/g, (match, url) => {
                let linkText = "Link";
                if (url.includes('youtu.be') || url.includes('cloudinary.com/dmiqkr7ja/video')) linkText = "Video Demo";
                else if (url.includes('github.com')) linkText = "GitHub Repo";
                else if (url.includes('asksunnah.online')) linkText = "Live Site";
                return `[${linkText}](${url})`;
            });

            addMessageToUI('assistant', formattedAnswer);
            conversationHistory.push({ role: 'assistant', content: data.answer }); // Still save original answer
        } catch (error) {
            console.error('Chatbot Error:', error);
            addMessageToUI('assistant', "I apologize, but I'm unable to connect to my knowledge base at the moment. Please try again soon.");
        } finally {
            typingIndicator.classList.add('hidden');
            chatSendButton.disabled = false;
            chatInput.focus();
        }
    };

    // C. Event Listeners
    if (chatTrigger) {
        chatTrigger.addEventListener('click', openChat);
        chatCloseButton.addEventListener('click', closeChat);
        chatForm.addEventListener('submit', handleSendMessage);
        
        chatOverlay.addEventListener('click', (event) => {
            if (event.target === chatOverlay) {
                closeChat();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !chatOverlay.classList.contains('hidden')) {
                closeChat();
            }
        });
    }
});