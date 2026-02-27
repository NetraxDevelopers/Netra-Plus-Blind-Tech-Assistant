document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const voiceBtn = document.getElementById('voice-intro-btn');
    const themeBtn = document.getElementById('theme-toggle');
    const contrastBtn = document.getElementById('high-contrast-toggle');
    const textBtn = document.getElementById('large-text-toggle');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const contactForm = document.getElementById('contact-form');
    const yearSpan = document.getElementById('year');

    // Set Copyright Year
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- ACCESSIBILITY FEATURES ---

    // 1. Voice Intro (Text-to-Speech)
    if (voiceBtn && 'speechSynthesis' in window) {
        voiceBtn.addEventListener('click', () => {
            if (window.speechSynthesis.speaking) {
                // Cancel ongoing speech if already speaking
                window.speechSynthesis.cancel();
                voiceBtn.innerHTML = '<i class="fas fa-volume-up" aria-hidden="true"></i>';
                return; // Stop here
            }

            const introText = "Welcome to Netra Plus, the Smart Blind Tech Assistant. We empower blind and visually impaired users with smart AI tools for an independent digital life. Use the tab key to navigate our website.";
            const utterance = new SpeechSynthesisUtterance(introText);

            utterance.onend = () => {
                // Reset button icon when speech ends naturally
                voiceBtn.innerHTML = '<i class="fas fa-volume-up" aria-hidden="true"></i>';
            };

            // Try to find an English voice, ideally female for assistant-like feel
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Female'));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            window.speechSynthesis.speak(utterance);
            // Change icon to indicate playing/stop
            voiceBtn.innerHTML = '<i class="fas fa-volume-mute" aria-hidden="true"></i>';
        });
    }

    // 2. Theme Toggle (Dark/Light)
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const body = document.body;
            if (body.getAttribute('data-theme') === 'dark') {
                body.setAttribute('data-theme', 'light');
                themeBtn.setAttribute('aria-pressed', 'false');
                themeBtn.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
                announceToScreenReader('Light mode enabled');
            } else {
                body.setAttribute('data-theme', 'dark');
                // Ensure High Contrast is off when switching themes
                body.removeAttribute('data-contrast');
                contrastBtn.setAttribute('aria-pressed', 'false');

                themeBtn.setAttribute('aria-pressed', 'true');
                themeBtn.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
                announceToScreenReader('Dark mode enabled');
            }
        });
    }

    // 3. High Contrast Toggle
    if (contrastBtn) {
        contrastBtn.addEventListener('click', () => {
            const body = document.body;
            if (body.getAttribute('data-contrast') === 'high') {
                body.removeAttribute('data-contrast');
                contrastBtn.setAttribute('aria-pressed', 'false');
                announceToScreenReader('High contrast mode disabled');
            } else {
                body.setAttribute('data-contrast', 'high');
                // Override standard theme
                body.removeAttribute('data-theme');
                themeBtn.setAttribute('aria-pressed', 'false');
                themeBtn.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';

                contrastBtn.setAttribute('aria-pressed', 'true');
                announceToScreenReader('High contrast mode enabled');
            }
        });
    }

    // 4. Large Text Toggle
    if (textBtn) {
        textBtn.addEventListener('click', () => {
            const root = document.documentElement;
            if (root.getAttribute('data-text') === 'large') {
                root.removeAttribute('data-text');
                textBtn.setAttribute('aria-pressed', 'false');
                announceToScreenReader('Standard text size enabled');
            } else {
                root.setAttribute('data-text', 'large');
                textBtn.setAttribute('aria-pressed', 'true');
                announceToScreenReader('Large text size enabled');
            }
        });
    }

    // Helper to announce changes to screen readers natively via aria-live
    function announceToScreenReader(message) {
        let announcer = document.getElementById('a11y-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'a11y-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.style.position = 'absolute';
            announcer.style.left = '-9999px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.style.overflow = 'hidden';
            document.body.appendChild(announcer);
        }
        announcer.textContent = message;
    }

    // --- MOBILE MENU ---
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));

            if (isExpanded) {
                menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
            } else {
                menuToggle.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
            }
        });

        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
            });
        });
    }

    // --- FORM SUBMISSION ---
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        // NOTE: The exact PUBLIC_KEY is required here.
        emailjs.init("SIqICA0HpiyvSPhs2");
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent standard submission

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerHTML;
            const formStatus = document.getElementById('form-status');

            // Indicate loading visually and disable button
            submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
            submitBtn.disabled = true;

            if (formStatus) {
                formStatus.textContent = "Sending your message...";
                formStatus.style.color = "var(--text-main)";
            }

            if (typeof emailjs === 'undefined') {
                if (formStatus) {
                    formStatus.textContent = "Email service script not loaded. Please try again.";
                    formStatus.style.color = "#ef4444";
                }
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            // Send form using EmailJS
            emailjs.sendForm('service_6rsq898', 'template_ii2wbgk', contactForm)
                .then(() => {
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const speech = new SpeechSynthesisUtterance("Your message has been sent successfully. Netra X Developers will get back to you soon.");
                        window.speechSynthesis.speak(speech);
                    }
                    if (formStatus) {
                        formStatus.textContent = "Message sent successfully!";
                        formStatus.style.color = "#22c55e"; // Success green
                    }
                    contactForm.reset();
                }, (error) => {
                    console.error("Error sending form", error);
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const speech = new SpeechSynthesisUtterance("There was an error sending the message. Please try again.");
                        window.speechSynthesis.speak(speech);
                    }
                    if (formStatus) {
                        formStatus.textContent = "Failed to send message. Please check the EmailJS configuration and try again.";
                        formStatus.style.color = "#ef4444"; // Error red
                    }
                })
                .finally(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;

                    // Clear live message quietly after 7 seconds
                    setTimeout(() => {
                        if (formStatus) formStatus.textContent = "";
                    }, 7000);
                });
        });
    }

    // --- FEATURES SHOW MORE LOGIC ---
    const featuresGrid = document.getElementById('features-grid');
    const toggleFeaturesBtn = document.getElementById('toggle-features-btn');

    if (featuresGrid && toggleFeaturesBtn) {
        toggleFeaturesBtn.addEventListener('click', () => {
            const isCollapsed = featuresGrid.classList.contains('is-collapsed');

            if (isCollapsed) {
                // Expand to show all
                featuresGrid.classList.remove('is-collapsed');
                toggleFeaturesBtn.setAttribute('aria-expanded', 'true');
                toggleFeaturesBtn.innerHTML = 'Show Less Features <i class="fas fa-chevron-up" aria-hidden="true"></i>';

                // Add staggered animation to newly revealed items
                const newlyVisible = featuresGrid.querySelectorAll('.small-feature-card:nth-child(n+9)');
                newlyVisible.forEach((el, index) => {
                    el.classList.remove('visible');
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, 50 * index); // 50ms stagger per item
                });

                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Expanded list to show all 28 features."));
                }
            } else {
                // Collapse to show only 8
                featuresGrid.classList.add('is-collapsed');
                toggleFeaturesBtn.setAttribute('aria-expanded', 'false');
                toggleFeaturesBtn.innerHTML = 'Show More Features <i class="fas fa-chevron-down" aria-hidden="true"></i>';

                // Scroll back to the top of the features section
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });

                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Collapsed list. Showing 8 features."));
                }
            }
        });
    }

    // --- SCROLL ANIMATIONS ---
    // Respect prefers-reduced-motion for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!prefersReducedMotion.matches) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once animated in
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));
    } else {
        // If reduced motion is requested, show elements immediately
        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => el.classList.add('visible'));
    }
});
