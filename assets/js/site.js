(function () {
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (heroTimer) {
                window.clearInterval(heroTimer);
            }
            showHero(index);
            startHero();
        });
    });

    showHero(0);
    startHero();

    const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-button]'));

    function applyListingFilter(scope) {
        const root = scope || document;
        const cards = Array.from(root.querySelectorAll('[data-card]'));
        if (!cards.length) {
            return;
        }
        const input = root.querySelector('[data-search-input]') || document.querySelector('[data-search-input]');
        const activeButton = root.querySelector('[data-filter-button].active') || document.querySelector('[data-filter-button].active');
        const query = input ? input.value.trim().toLowerCase() : '';
        const category = activeButton ? activeButton.getAttribute('data-filter-button') : 'all';
        let visible = 0;

        cards.forEach(function (card) {
            const text = (card.getAttribute('data-search') || '').toLowerCase();
            const cardCategory = card.getAttribute('data-category') || '';
            const matchText = !query || text.indexOf(query) !== -1;
            const matchCategory = category === 'all' || cardCategory === category;
            const shouldShow = matchText && matchCategory;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        const empty = root.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            const root = input.closest('.container') || document;
            applyListingFilter(root);
        });
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const root = button.closest('.container') || document;
            root.querySelectorAll('[data-filter-button]').forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyListingFilter(root);
        });
    });
})();

function initMoviePlayer(movieSource) {
    const video = document.querySelector('.js-video');
    const cover = document.querySelector('.js-player-cover');
    const triggers = Array.from(document.querySelectorAll('.js-play-trigger'));
    let hlsInstance = null;
    let prepared = false;

    if (!video || !movieSource) {
        return;
    }

    function prepareVideo() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = movieSource;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(movieSource);
            hlsInstance.attachMedia(video);
        } else {
            video.src = movieSource;
        }
    }

    function startPlayback() {
        prepareVideo();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        const playRequest = video.play();
        if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {});
        }
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            const player = document.getElementById('player');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            startPlayback();
        });
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
