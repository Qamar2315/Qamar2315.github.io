document.addEventListener('DOMContentLoaded', () => {
    const NAVBAR_HEIGHT = 64; // Height of the fixed navigation bar in pixels (matches nav h-16)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Escape data before it is interpolated into innerHTML template strings, so any
    // stray HTML in the JSON content cannot break layout or inject markup.
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

    // Parse markdown safely: returns sanitized HTML, or the escaped raw text if the
    // marked/DOMPurify CDN scripts failed to load (so a modal never throws).
    const renderMarkdown = (text) => {
        const raw = String(text ?? '');
        if (typeof marked === 'undefined') return escapeHtml(raw);
        const html = marked.parse(raw);
        return (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(html) : escapeHtml(raw);
    };

    // --- 1. Mobile Menu Functionality ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    const toggleMenu = () => {
        const isOpening = mobileMenu.classList.contains('translate-x-full');
        mobileMenu.classList.toggle('translate-x-full');
        mobileMenuOverlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden'); // Prevent scrolling when menu is open
        if (mobileMenuButton) {
            mobileMenuButton.setAttribute('aria-expanded', String(isOpening));
        }
        if (mobileMenu) {
            mobileMenu.setAttribute('aria-hidden', String(!isOpening));
            // Keep the drawer's links out of the tab order / a11y tree while it is closed.
            mobileMenu.inert = !isOpening;
        }
        // Move focus into the drawer on open, and back to the trigger on close.
        if (isOpening) {
            const firstLink = mobileMenu.querySelector('a');
            if (firstLink) firstLink.focus();
        } else if (mobileMenuButton) {
            mobileMenuButton.focus();
        }
    };

    if (mobileMenuButton && mobileMenu && mobileMenuOverlay) {
        mobileMenuButton.addEventListener('click', toggleMenu);
        mobileMenuOverlay.addEventListener('click', toggleMenu);
        mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', toggleMenu));
        // Close the drawer with the Escape key.
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
                toggleMenu();
            }
        });
    }

    // --- 2. Smooth Scrolling for All Anchor Links ---
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            // A bare "#" (e.g. the brand logo) is not a valid selector and would throw
            // in querySelector — treat it as "scroll to top" instead.
            if (!targetId || targetId === '#') {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                return;
            }
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - NAVBAR_HEIGHT,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
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
    let observer = null;
    if (!prefersReducedMotion) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

    // Observe dynamically-rendered elements for scroll-in animation,
    // or reveal them immediately when the visitor prefers reduced motion
    // (in which case `observer` is null and .observe() would throw).
    function activateAnimated(elements) {
        elements.forEach(el => {
            if (observer) {
                observer.observe(el);
            } else {
                el.classList.add('is-visible');
            }
        });
    }


    // --- 5. Active Navigation Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinksDesktop = document.querySelectorAll('#nav-desktop a');
    const navLinksMobile = document.querySelectorAll('#mobile-menu a');

    const setActiveNav = (id) => {
        const updateLinks = (links) => {
            links.forEach(link => {
                const isActive = link.getAttribute('href') === `#${id}`;
                // Colour + gradient-underline signal the active section; no weight change,
                // which previously reflowed the nav on every scroll.
                link.classList.toggle('text-blue-500', isActive);
                link.classList.toggle('text-gray-600', !isActive);
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'location');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };
        updateLinks(navLinksDesktop);
        updateLinks(navLinksMobile);
    };

    // Highlight the section crossing a thin activation band just below the navbar.
    // A ratio-based approach is unreliable for sections taller than the viewport
    // (their intersectionRatio may never reach a threshold), so use a fixed band.
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveNav(entry.target.id);
            }
        });
    }, {
        rootMargin: `-${NAVBAR_HEIGHT}px 0px -80% 0px`,
        threshold: 0
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

    // On a fetch failure, replace a section's skeleton loaders with a small inline
    // notice so the visitor never stares at placeholders that never resolve.
    function showLoadError(container, message) {
        if (!container) return;
        container.innerHTML = `<p class="col-span-full text-center text-slate-500 py-8">${message}</p>`;
    }

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
            showLoadError(document.getElementById('projects-grid'), 'Projects could not be loaded. Please refresh the page.');
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
            showLoadError(document.querySelector('#freelance .grid'), 'Freelance work could not be loaded. Please refresh the page.');
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
            // Reveal the static fallback hero text rather than leaving the skeleton pulsing.
            const skeleton = document.getElementById('introduction-skeleton');
            const content = document.getElementById('introduction-content');
            const imageSkeleton = document.getElementById('profile-image-skeleton');
            if (skeleton) skeleton.classList.add('hidden');
            if (content) content.classList.remove('hidden');
            if (imageSkeleton) imageSkeleton.classList.add('hidden');
            showLoadError(document.getElementById('skills-grid'), 'Skills could not be loaded. Please refresh the page.');
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
            showLoadError(document.getElementById('experience-timeline'), 'Experience details could not be loaded. Please refresh the page.');
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
            const skeleton = document.getElementById('education-skeleton');
            if (skeleton) skeleton.classList.add('hidden');
            showLoadError(document.getElementById('education-list'), 'Education details could not be loaded. Please refresh the page.');
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
        // Make the card operable by keyboard (activation handled in setupModalOpenListener).
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${project.title || 'project'}`);

        let techPills = '';
        if (project.technologies && project.technologies.length > 0) {
            const topTech = project.technologies.slice(0, 3);
            techPills = '<div class="flex flex-wrap gap-2 mb-4">' +
                topTech.map(tech => `<span class="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">${escapeHtml(tech)}</span>`).join('') +
                (project.technologies.length > 3 ? `<span class="bg-slate-50 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">+${project.technologies.length - 3}</span>` : '') +
            '</div>';
        }

        // Add an icon in the corner that appears on hover
        card.innerHTML = `
            <div class="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
                <i class="fas fa-expand-alt" aria-hidden="true"></i>
            </div>
            <h3 class="text-xl font-bold mb-2 text-slate-800">${escapeHtml(project.title || 'Untitled Project')}</h3>
            ${techPills}
            <p class="text-slate-600 mb-4 flex-grow">${escapeHtml(project.short_description || '')}</p>
            <div class="mt-auto pt-4 border-t border-slate-100">
                <span class="text-blue-500 font-semibold group-hover:text-blue-600 transition-colors">View Details <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform" aria-hidden="true"></i></span>
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
        activateAnimated(newAnimated);

        // Set up modal listener after data is loaded
        setupModalOpenListener(projectsSection, projectsData, 'data-project-id');
    }

    // --- New: Render Freelance Grid Dynamically ---
    function createFreelanceCard(work) {
        const card = document.createElement('div');
        card.className = 'bg-slate-50 rounded-xl shadow-md hover-card transition-all p-6 animate-on-scroll freelance-card cursor-pointer';
        card.dataset.freelanceId = work.id || '';
        // Make the card operable by keyboard (activation handled in setupModalOpenListener).
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${work.title || 'project'}`);

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
        activateAnimated(newAnimated);

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
        
        // Update profile information (select by id so a missing wrapper can't throw)
        const profileName = document.getElementById('profile-name');
        const profileTitle = document.getElementById('profile-title');
        const profileDescription = document.getElementById('profile-description');
        const resumeDownload = document.getElementById('resume-download');
        
        if (profileName) profileName.textContent = personalInfo.name;
        if (profileTitle) profileTitle.textContent = personalInfo.title;
        if (profileDescription) profileDescription.innerHTML = personalInfo.description;
        if (profileImage) {
            profileImage.src = personalInfo.profile_image;
            profileImage.alt = personalInfo.name;
        }
        if (resumeDownload) {
            // We handle the download in JS, so drop the default href/download; keep the
            // element keyboard-operable now that it is no longer a plain link.
            resumeDownload.removeAttribute('href');
            resumeDownload.removeAttribute('download');
            resumeDownload.setAttribute('role', 'button');
            resumeDownload.setAttribute('tabindex', '0');

            let isDownloading = false;
            const originalLabel = resumeDownload.innerHTML;

            const triggerDownload = async () => {
                if (isDownloading) return; // guard concurrent clicks (an <a> can't be truly disabled)
                isDownloading = true;
                resumeDownload.classList.add('pointer-events-none', 'opacity-70');
                resumeDownload.setAttribute('aria-busy', 'true');
                resumeDownload.innerHTML = '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>Preparing…';
                try {
                    const response = await fetch(personalInfo.resume_file);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${personalInfo.name.replace(/\s+/g, '-')}-Resume.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Download failed:', error);
                    // Fallback: open in a new tab (noopener avoids reverse tabnabbing)
                    window.open(personalInfo.resume_file, '_blank', 'noopener,noreferrer');
                } finally {
                    isDownloading = false;
                    resumeDownload.classList.remove('pointer-events-none', 'opacity-70');
                    resumeDownload.removeAttribute('aria-busy');
                    resumeDownload.innerHTML = originalLabel;
                }
            };

            resumeDownload.addEventListener('click', (e) => { e.preventDefault(); triggerDownload(); });
            resumeDownload.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerDownload(); }
            });
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
                a.setAttribute('aria-label', link.name);
                a.className = 'text-slate-500 hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1';
                a.innerHTML = `<i class="${escapeHtml(link.icon)} text-4xl" aria-hidden="true"></i>`; // Updated size
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
                    <i class="${escapeHtml(skill.icon)} text-5xl text-gray-400 mb-2 transition-all" aria-hidden="true"></i>
                    <span class="text-center">${escapeHtml(skill.name)}</span>
                `;
                skillsContainer.appendChild(skillElement);
            });

            categorySection.appendChild(categoryTitle);
            categorySection.appendChild(skillsContainer);
            grid.appendChild(categorySection);
        });

        // Re-observe newly created elements
        const newAnimated = container.querySelectorAll('.animate-on-scroll');
        activateAnimated(newAnimated);
    }

    // --- New: Render Experience Timeline ---
    function renderExperienceTimeline(experience) {
        const timelineContainer = document.getElementById('experience-timeline');
        if (!timelineContainer) return;

        timelineContainer.innerHTML = ''; // Clear any existing content

        (experience || []).forEach(job => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item relative pl-8 pb-8 animate-on-scroll';

            timelineItem.innerHTML = `
                <div class="timeline-dot w-4 h-4 border-2 border-blue-500">
                    <div class="timeline-dot-inner w-2 h-2 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div class="bg-slate-100/70 p-6 rounded-lg shadow-sm">
                    <p class="text-sm font-semibold text-blue-600">${escapeHtml(job.date_range)}</p>
                    <h3 class="text-lg font-bold text-slate-800 mt-1">${escapeHtml(job.title)}, ${escapeHtml(job.company)}</h3>
                    <ul class="list-disc list-inside text-slate-600 space-y-1 mt-3">
                        <!-- Responsibility items are appended below as DOM nodes -->
                    </ul>
                </div>
            `;

            timelineContainer.appendChild(timelineItem);

            // Populate the list as DOM nodes (handles plain strings and interactive detail items).
            const listContainer = timelineItem.querySelector('ul');
            if (listContainer) {
                (job.responsibilities || []).forEach(item => {
                    const li = document.createElement('li');
                    li.className = "mb-3 leading-relaxed"; // Added spacing and line-height

                    if (typeof item === 'string') {
                        li.textContent = item;
                    } else if (typeof item === 'object' && item.summary) {
                        // Detailed Item Container
                        const container = document.createElement('div');
                        container.className = "inline"; 

                        const summaryText = document.createElement('span');
                        summaryText.textContent = item.summary + " ";
                        container.appendChild(summaryText);

                        const viewDetailsBtn = document.createElement('button');
                        viewDetailsBtn.className = "inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors cursor-pointer focus:outline-none ml-1";
                        viewDetailsBtn.innerHTML = `<i class="fas fa-external-link-alt text-xs mr-1" aria-hidden="true"></i>View Details`;
                        
                        viewDetailsBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            populateModal(item.details);
                            openModal();
                        });

                        container.appendChild(viewDetailsBtn);
                        li.appendChild(container);
                    }
                    listContainer.appendChild(li);
                });
            }
        });
        
        // Re-observe newly created elements for scroll animations
        const newAnimated = timelineContainer.querySelectorAll('.animate-on-scroll');
        activateAnimated(newAnimated);
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
                <h3 class="text-2xl font-semibold text-blue-900">${escapeHtml(item.degree)}</h3>
                <p class="text-lg text-gray-600 mt-2">${escapeHtml(item.institution)}</p>
                <p class="text-sm text-gray-500 mt-1">${escapeHtml(item.date_range)}</p>
            `;
            listEl.appendChild(card);
        });

        // Re-observe newly created elements for scroll animations
        const newAnimated = listEl.querySelectorAll('.animate-on-scroll');
        activateAnimated(newAnimated);
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
    Promise.allSettled([
        fetchProjects(),
        fetchFreelanceWork(),
        fetchProfileData(),
        fetchExperience(),
        fetchEducation(),
        fetchSections()
    ]);

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

    // Turn a Loom/YouTube share URL into its embeddable form, or return null for a direct file.
    function getVideoEmbedUrl(src) {
        const loom = /loom\.com\/share\/([\w-]+)/.exec(src);
        if (loom) return `https://www.loom.com/embed/${loom[1]}`;
        const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/.exec(src);
        if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
        return null;
    }

    // B. Helper function to display media
    function displayMedia(mediaItem) {
        if (!modalMediaDisplay) return;
        const src = mediaItem.src || '';
        if (mediaItem.type === 'video') {
            const embedUrl = getVideoEmbedUrl(src);
            if (embedUrl) {
                // Hosted video (Loom/YouTube): a <video> tag can't decode a share page, so embed it.
                modalMediaDisplay.innerHTML = `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(mediaItem.caption || 'Project demo video')}" frameborder="0" allow="fullscreen; picture-in-picture" allowfullscreen class="w-full h-full"></iframe>`;
            } else {
                // Direct video file (e.g. Cloudinary .mp4/.webm): infer MIME type from the extension.
                const type = /\.webm(\?|$)/i.test(src) ? 'video/webm' : 'video/mp4';
                modalMediaDisplay.innerHTML = `<video controls autoplay muted loop class="w-full h-full object-contain"><source src="${escapeHtml(src)}" type="${type}">Your browser does not support the video tag.</video>`;
            }
        } else {
            modalMediaDisplay.innerHTML = `<img src="${escapeHtml(src)}" alt="${escapeHtml(mediaItem.caption || '')}" class="w-full h-full object-contain">`;
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
        if (item.role) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${escapeHtml(item.role)}</span>`);
        if (item.project_type) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">${escapeHtml(item.project_type)}</span>`);
        if (item.status) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">${escapeHtml(item.status)}</span>`);
        if (item.date_range) metaItems.push(`<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">${escapeHtml(item.date_range)}</span>`);
        modalMetaTags.innerHTML = metaItems.join('');


        // --- 3. Populate Media Gallery ---
        modalMediaDisplay.innerHTML = '<div class="p-4 h-full flex items-center justify-center bg-slate-100 rounded-lg"><i class="fas fa-image text-4xl text-slate-400" aria-hidden="true"></i></div>'; // Default
        if (item.media && item.media.length > 0) {
            displayMedia(item.media[0]); // Display first item
            // Only render a thumbnail strip when there is more than one media item.
            if (item.media.length > 1) {
                item.media.forEach((mediaItem, index) => {
                    let thumb;
                    if (mediaItem.type === 'video') {
                        // Videos have no reliable poster image, so use a self-contained play tile
                        // (no external placeholder service, which no longer exists).
                        thumb = document.createElement('div');
                        thumb.className = `thumb w-16 h-16 flex items-center justify-center bg-slate-800 text-white rounded-md cursor-pointer border-2 hover:border-blue-500 ${index === 0 ? 'border-blue-500' : 'border-transparent'}`;
                        thumb.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';
                    } else {
                        thumb = document.createElement('img');
                        thumb.src = mediaItem.src;
                        thumb.alt = mediaItem.caption || '';
                        thumb.loading = 'lazy';
                        thumb.decoding = 'async';
                        thumb.className = `thumb w-16 h-16 object-cover rounded-md cursor-pointer border-2 hover:border-blue-500 ${index === 0 ? 'border-blue-500' : 'border-transparent'}`;
                    }
                    thumb.setAttribute('role', 'button');
                    thumb.setAttribute('tabindex', '0');
                    thumb.setAttribute('aria-label', mediaItem.caption || `View media ${index + 1}`);
                    const activate = () => {
                        displayMedia(mediaItem);
                        // Reset the active border across ALL thumbnails (img and div tiles).
                        modalMediaThumbnails.querySelectorAll('.thumb').forEach(t => t.classList.remove('border-blue-500'));
                        thumb.classList.add('border-blue-500');
                    };
                    thumb.addEventListener('click', activate);
                    thumb.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
                    });
                    modalMediaThumbnails.appendChild(thumb);
                });
            }
        }

        // --- 4. Populate Main Description ---
        let descriptionHTML = '';
        if (item.long_description) {
            descriptionHTML = renderMarkdown(item.long_description);
        } else if (item.problem_statement) {
            descriptionHTML = `
                <h4 class="font-semibold text-slate-800">The Challenge</h4>
                <p class="mb-4">${escapeHtml(item.problem_statement)}</p>
                <h4 class="font-semibold text-slate-800">My Solution</h4>
                <p>${escapeHtml(item.solution_delivered)}</p>
            `;
        }
        modalMainDescription.innerHTML = descriptionHTML;


        // --- 5. Populate Key Features / Achievements ---
        const features = item.key_features || item.key_achievements;
        if (features && features.length > 0) {
            modalFeaturesBlock.classList.remove('hidden');
            const isAchievement = !!item.key_achievements;
            modalFeaturesTitle.innerHTML = `<i class="fas ${isAchievement ? 'fa-trophy text-yellow-500' : 'fa-star text-blue-500'} mr-2" aria-hidden="true"></i>Key ${isAchievement ? 'Achievements' : 'Features'}`;
            modalFeaturesList.innerHTML = features.map(feat => `
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mt-1 mr-3" aria-hidden="true"></i>
                    <span>${escapeHtml(feat)}</span>
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
                    <div class="font-semibold text-slate-700 mb-1">${escapeHtml(c.challenge)}</div>
                    <div class="text-slate-600">${escapeHtml(c.solution)}</div>
                </div>
            `).join('');
        }

        // --- 8. Populate Technologies ---
        if (item.technologies && item.technologies.length > 0) {
            modalTechBlock.classList.remove('hidden');
            const isFreelance = item.problem_statement ? true : false;
            const bgClass = isFreelance ? 'bg-green-100' : 'bg-blue-100';
            const textClass = isFreelance ? 'text-green-800' : 'text-blue-800';
            modalTechList.innerHTML = item.technologies.map(tech =>
                `<span class="${bgClass} ${textClass} text-sm font-medium px-2.5 py-1 rounded-full">${escapeHtml(tech)}</span>`
            ).join('');
        }

        // --- 9. Populate Links ---
        if (item.links && item.links.length > 0) {
            modalLinksBlock.classList.remove('hidden');
            modalLinksList.innerHTML = item.links.map(link =>
                `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 font-medium hover:underline hover:text-blue-800 transition-colors">
                    <i class="${escapeHtml(link.icon || 'fas fa-external-link-alt')} mr-2" aria-hidden="true"></i>
                    <span>${escapeHtml(link.type)}</span>
                </a>`
            ).join('');
        }
    }

    // D. Modal Control Functions
    let lastFocusedBeforeModal = null;

    // Collect the currently-focusable elements inside a container (for the focus trap).
    const getFocusable = (container) => Array.from(
        container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select, iframe, video[controls], [tabindex]:not([tabindex="-1"])')
    ).filter(el => el.offsetParent !== null);

    const openModal = () => {
        if (!modal || !modalContent) return;
        lastFocusedBeforeModal = document.activeElement;
        modal.removeAttribute('aria-hidden');
        modal.removeAttribute('inert');
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
        document.body.classList.add('overflow-hidden');
        if (closeModalButton) closeModalButton.focus();
    };

    const closeModal = () => {
        if (!modal || !modalContent) return;
        modal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('scale-95');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('inert', '');
        document.body.classList.remove('overflow-hidden');
        // Stop any playing video and fully unload it (removing the <source> avoids a
        // spurious request for the page URL that `video.src = ''` would trigger).
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
            video.querySelectorAll('source').forEach(s => s.remove());
            video.removeAttribute('src');
            video.load();
        }
        // Return focus to whatever opened the modal.
        if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
            lastFocusedBeforeModal.focus();
        }
    };

    // E. NEW Event Listeners
    function setupModalOpenListener(section, data, idAttribute) {
        if (!section) return;
        const openFromCard = (card) => {
            const itemId = card.getAttribute(idAttribute);
            const item = data.find((p) => p.id === itemId);
            if (item) {
                populateModal(item);
                openModal();
            }
        };
        section.addEventListener('click', (e) => {
            const card = e.target.closest(`[${idAttribute}]`);
            if (!card) return;
            // Allow normal navigation if a link inside the card was clicked
            if (e.target.closest('a') && e.target.closest('a').getAttribute('target') === '_blank') return;
            e.preventDefault();
            openFromCard(card);
        });
        // Keyboard activation: Enter/Space on a focused card opens its modal.
        section.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
            const card = e.target.closest(`[${idAttribute}]`);
            if (!card || e.target !== card) return;
            e.preventDefault(); // stop Space from scrolling the page
            openFromCard(card);
        });
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

    // Trap Tab focus inside the modal while it is open.
    if (modal && modalContent) {
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || modal.classList.contains('pointer-events-none')) return;
            const focusables = getFocusable(modalContent);
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

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
    const suggestedPromptsContainer = document.getElementById('suggested-prompts');
    const API_URL = 'https://qamarcodes.online/api/v1/chat';
    let conversationHistory = [];
    let lastFocusedBeforeChat = null;

    // B. Core Functions
    const openChat = () => {
        lastFocusedBeforeChat = document.activeElement;
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

        // Return focus to the trigger that opened the chat.
        if (lastFocusedBeforeChat && typeof lastFocusedBeforeChat.focus === 'function') {
            lastFocusedBeforeChat.focus();
        } else if (chatTrigger) {
            chatTrigger.focus();
        }
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
            // AI messages are parsed as Markdown and sanitized (the reply comes from an
            // external API, so it is treated as untrusted before hitting innerHTML).
            // The 'prose' class from Tailwind helps style the HTML nicely
            messageContent.className += ' prose prose-sm max-w-none';
            messageContent.innerHTML = renderMarkdown(message);
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

    // NEW FUNCTION: To render the prompt bubbles
    const renderSuggestedPrompts = (prompts) => {
        suggestedPromptsContainer.innerHTML = ''; // Clear old prompts
        if (!prompts || prompts.length === 0) return;

        prompts.forEach(promptText => {
            const button = document.createElement('button');
            button.textContent = promptText;
            button.className = 'bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full transition-colors';
            suggestedPromptsContainer.appendChild(button);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to show them
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        addMessageToUI('user', userText);
        conversationHistory.push({ role: 'user', content: userText });
        
        chatInput.value = '';
        chatSendButton.disabled = true;
        suggestedPromptsContainer.innerHTML = ''; // Clear prompts when user sends a message
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

            // Guard against a 200 response that lacks the expected answer field.
            const answer = (data && typeof data.answer === 'string') ? data.answer : '';
            if (!answer) {
                throw new Error('Malformed response: missing answer');
            }

            // --- Pre-process the response to clean up links ---
            let formattedAnswer = answer.replace(/\[(https?:\/\/[^\s\]]+)\]/g, (match, url) => {
                let linkText = "Link";
                if (url.includes('youtu.be') || url.includes('cloudinary.com/dmiqkr7ja/video')) linkText = "Video Demo";
                else if (url.includes('github.com')) linkText = "GitHub Repo";
                else if (url.includes('asksunnah.online')) linkText = "Live Site";
                return `[${linkText}](${url})`;
            });

            addMessageToUI('assistant', formattedAnswer);
            conversationHistory.push({ role: 'assistant', content: answer }); // Still save original answer
            
            // RENDER NEW PROMPTS (this assumes your API can return them)
            const prompts = data.suggested_prompts || ["Tell me more about Ask Sunnah", "What are your top skills?", "Show me your AI projects", "Tell me about your backend experience"];
            renderSuggestedPrompts(prompts);
        } catch (error) {
            console.error('Chatbot Error:', error);
            addMessageToUI('assistant', "I apologize, but I'm unable to connect to my knowledge base at the moment. Please try again soon.");
        } finally {
            typingIndicator.classList.add('hidden');
            chatSendButton.disabled = false;
            chatInput.focus();
        }
    };

    // NEW EVENT LISTENER: To handle clicks on the bubbles
    if (suggestedPromptsContainer) {
        suggestedPromptsContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const promptText = e.target.textContent;
                chatInput.value = promptText;
                chatForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                suggestedPromptsContainer.innerHTML = ''; // Clear prompts after click
            }
        });
    }

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

        // Trap Tab focus within the chat window while it is open.
        chatWindow.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || chatOverlay.classList.contains('hidden')) return;
            const focusables = getFocusable(chatWindow);
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }
});
