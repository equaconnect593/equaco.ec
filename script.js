document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations with Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Uncomment the line below if you want the animation to happen only once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add reveal classes to specific elements dynamically
    document.querySelectorAll('h1, h2, .about-text').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    document.querySelectorAll('.about-image, .contact-info-card').forEach(el => {
        el.classList.add('reveal-left');
        observer.observe(el);
    });

    document.querySelectorAll('.contact-form-card').forEach(el => {
        el.classList.add('reveal-right');
        observer.observe(el);
    });

    document.querySelectorAll('.service-card, .partner-item').forEach((el, index) => {
        el.classList.add('reveal-scale');
        el.style.transitionDelay = `${(index % 3) * 0.1}s`; // slight stagger effect
        observer.observe(el);
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (navLinks.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '&times;';
            } else {
                mobileMenuBtn.innerHTML = '&#9776;';
            }
        });
    }

    // Service details toggle
    const serviceButtons = document.querySelectorAll('.service-toggle');
    serviceButtons.forEach(button => {
        button.addEventListener('click', function () {
            const details = this.nextElementSibling;
            if (!details) return;

            details.classList.toggle('active');

            if (details.classList.contains('active')) {
                this.textContent = 'Ver menos';
            } else {
                this.textContent = 'Ver más';
            }
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navLinks) navLinks.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.innerHTML = '&#9776;';
            }
        });
    });

    // Form submission native with hidden iframe to prevent redirect
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Crear iframe invisible
        const iframeName = 'hidden_iframe';
        let iframe = document.getElementById(iframeName);
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = iframeName;
            iframe.id = iframeName;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        contactForm.target = iframeName;
        // Restaurar endpoint normal (No ajax) para que los navegadores no bloqueen por CORS
        contactForm.action = "https://formsubmit.co/equaconnect593@outlook.com";
        contactForm.method = "POST";

        let isSubmitting = false;
        let originalBtnText = '';

        contactForm.addEventListener('submit', function (e) {
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            isSubmitting = true;

            iframe.onload = function () {
                if (isSubmitting) {
                    alert('¡Gracias! Hemos recibido tu mensaje correctamente.');
                    contactForm.reset();
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    isSubmitting = false;
                }
            };

            // Fallback de seguridad por si el iframe onload no se dispara en ciertos navegadores
            setTimeout(() => {
                if (isSubmitting) {
                    alert('¡Gracias! Hemos recibido tu mensaje correctamente.');
                    contactForm.reset();
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    isSubmitting = false;
                }
            }, 4000);
        });
    }

    // Header background on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', function () {
        if (!header) return;
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = 'var(--shadow-md)';
            header.style.padding = '5px 0';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            header.style.boxShadow = 'var(--shadow-sm)';
            header.style.padding = '0';
        }
    });

    // Partners Carousel functionality
    const track = document.getElementById('partnersTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselContainer = document.querySelector('.partners-carousel');

    if (track && prevBtn && nextBtn && carouselContainer) {
        const partnerItems = document.querySelectorAll('.partner-item');
        if (partnerItems.length === 0) return;

        function calculateDimensions() {
            const containerWidth = carouselContainer.offsetWidth;
            const itemStyle = window.getComputedStyle(partnerItems[0]);
            const itemMargin = parseFloat(itemStyle.marginLeft) + parseFloat(itemStyle.marginRight);
            const itemWidth = partnerItems[0].offsetWidth + itemMargin;
            const itemsPerView = Math.floor(containerWidth / itemWidth) || 1;

            let totalItemsWidth = 0;
            partnerItems.forEach(item => {
                totalItemsWidth += item.offsetWidth + itemMargin;
            });

            return { containerWidth, itemWidth, itemsPerView, totalItemsWidth };
        }

        let position = 0;
        let dimensions = calculateDimensions();
        let maxPosition = -(dimensions.totalItemsWidth - dimensions.containerWidth);

        function updateButtons() {
            if (dimensions.totalItemsWidth <= dimensions.containerWidth) {
                prevBtn.disabled = true;
                nextBtn.disabled = true;
            } else {
                prevBtn.disabled = position >= 0;
                nextBtn.disabled = position <= maxPosition;
            }
        }

        prevBtn.addEventListener('click', function () {
            if (position < 0) {
                dimensions = calculateDimensions();
                const moveAmount = dimensions.itemWidth * dimensions.itemsPerView;
                position += moveAmount;
                if (position > 0) position = 0;
                track.style.transform = `translateX(${position}px)`;
                updateButtons();
            }
        });

        nextBtn.addEventListener('click', function () {
            dimensions = calculateDimensions();
            maxPosition = -(dimensions.totalItemsWidth - dimensions.containerWidth);
            if (position > maxPosition) {
                const moveAmount = dimensions.itemWidth * dimensions.itemsPerView;
                position -= moveAmount;
                if (position < maxPosition) position = maxPosition;
                track.style.transform = `translateX(${position}px)`;
                updateButtons();
            }
        });

        updateButtons();

        let resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                dimensions = calculateDimensions();
                maxPosition = -(dimensions.totalItemsWidth - dimensions.containerWidth);
                if (position < maxPosition) {
                    position = maxPosition;
                    track.style.transform = `translateX(${position}px)`;
                }
                if (dimensions.totalItemsWidth <= dimensions.containerWidth) {
                    position = 0;
                    track.style.transform = `translateX(${position}px)`;
                }
                updateButtons();
            }, 250);
        });

        let autoScroll = setInterval(() => {
            dimensions = calculateDimensions();
            maxPosition = -(dimensions.totalItemsWidth - dimensions.containerWidth);
            if (dimensions.totalItemsWidth > dimensions.containerWidth) {
                if (position > maxPosition) {
                    const moveAmount = dimensions.itemWidth * dimensions.itemsPerView;
                    position -= moveAmount;
                    if (position < maxPosition) position = 0;
                    track.style.transform = `translateX(${position}px)`;
                    updateButtons();
                } else {
                    position = 0;
                    track.style.transform = `translateX(${position}px)`;
                    updateButtons();
                }
            }
        }, 4000);

        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoScroll));

        carouselContainer.addEventListener('mouseleave', () => {
            dimensions = calculateDimensions();
            if (dimensions.totalItemsWidth > dimensions.containerWidth) {
                autoScroll = setInterval(() => {
                    dimensions = calculateDimensions();
                    maxPosition = -(dimensions.totalItemsWidth - dimensions.containerWidth);
                    if (dimensions.totalItemsWidth > dimensions.containerWidth) {
                        if (position > maxPosition) {
                            const moveAmount = dimensions.itemWidth * dimensions.itemsPerView;
                            position -= moveAmount;
                            if (position < maxPosition) position = 0;
                            track.style.transform = `translateX(${position}px)`;
                            updateButtons();
                        } else {
                            position = 0;
                            track.style.transform = `translateX(${position}px)`;
                            updateButtons();
                        }
                    }
                }, 4000);
            }
        });
    }
});
