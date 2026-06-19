(function() {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let currentSlide = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startSlider() {
        if (slides.length <= 1) {
            return;
        }
        slideTimer = window.setInterval(function() {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            const index = Number(dot.getAttribute('data-slide') || 0);
            showSlide(index);
            if (slideTimer) {
                window.clearInterval(slideTimer);
                startSlider();
            }
        });
    });

    showSlide(0);
    startSlider();

    const searchInput = document.querySelector('.movie-search');
    const yearFilter = document.querySelector('.year-filter');
    const filterItems = Array.from(document.querySelectorAll('.filter-grid .movie-card, .filter-grid .ranking-row'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!filterItems.length) {
            return;
        }

        const query = normalize(searchInput ? searchInput.value : '');
        const yearValue = yearFilter ? yearFilter.value : '';

        filterItems.forEach(function(item) {
            const keywords = normalize([
                item.getAttribute('data-title'),
                item.getAttribute('data-region'),
                item.getAttribute('data-type'),
                item.getAttribute('data-keywords')
            ].join(' '));
            const year = Number(item.getAttribute('data-year') || 0);
            const matchesQuery = !query || keywords.includes(query);
            let matchesYear = true;

            if (yearValue === 'older') {
                matchesYear = year < 2020;
            } else if (yearValue) {
                matchesYear = String(year) === yearValue;
            }

            item.classList.toggle('is-hidden', !(matchesQuery && matchesYear));
        });
    }

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');
        if (initialQuery) {
            searchInput.value = initialQuery;
        }
        searchInput.addEventListener('input', applyFilters);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }

    applyFilters();
})();
