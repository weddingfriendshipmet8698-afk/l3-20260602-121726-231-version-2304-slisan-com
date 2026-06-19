(function () {
    function queryAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupPosterFallbacks() {
        queryAll('.poster-image').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-hidden');
                if (image.parentElement) {
                    image.parentElement.classList.add('is-fallback');
                }
            });
        });
    }

    function setupHeroSlider() {
        var slides = queryAll('[data-hero-slide]');
        var dots = queryAll('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var searchInput = document.getElementById('movie-search');
        var categoryFilter = document.getElementById('category-filter');
        var sortFilter = document.getElementById('sort-filter');
        var grid = document.querySelector('[data-card-grid]');
        var resultCount = document.querySelector('[data-result-count]');
        if (!grid) {
            return;
        }
        var cards = queryAll('.searchable-card', grid);

        function textOf(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function sortCards() {
            if (!sortFilter) {
                return;
            }
            var value = sortFilter.value;
            cards.sort(function (a, b) {
                if (value === 'year-asc') {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                }
                if (value === 'title-asc') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                }
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function apply() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var category = categoryFilter ? categoryFilter.value : 'all';
            var count = 0;
            cards.forEach(function (card) {
                var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchCategory = category === 'all' || card.getAttribute('data-category') === category;
                var visible = matchKeyword && matchCategory;
                card.classList.toggle('is-hidden-card', !visible);
                if (visible) {
                    count += 1;
                }
            });
            if (resultCount) {
                resultCount.textContent = '显示 ' + count + ' 部影片';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', apply);
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', function () {
                sortCards();
                apply();
            });
        }
        sortCards();
        apply();
    }

    function attachHls(video, source) {
        if (!source || video.dataset.playerReady === '1') {
            return;
        }
        video.dataset.playerReady = '1';
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function setupPlayers() {
        queryAll('[data-player-shell]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-player-button]');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-src');
            function playVideo() {
                attachHls(video, source);
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
        });

        queryAll('[data-scroll-player]').forEach(function (button) {
            button.addEventListener('click', function () {
                var shell = document.querySelector('[data-player-shell]');
                if (!shell) {
                    return;
                }
                shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var playButton = shell.querySelector('[data-player-button]');
                if (playButton) {
                    playButton.click();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupPosterFallbacks();
        setupHeroSlider();
        setupFilters();
        setupPlayers();
    });
}());
