(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupMovieFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-movie-search]");
      var yearFilter = panel.querySelector("[data-year-filter]");
      var container = panel.parentElement;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
      var empty = panel.querySelector("[data-filter-empty]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function filter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          var yearMatch = !year || cardYear.indexOf(year) !== -1 || (year === "2026" && parseInt(cardYear, 10) >= 2026);
          var matched = queryMatch && yearMatch;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", filter);
      }

      if (yearFilter) {
        yearFilter.addEventListener("change", filter);
      }

      filter();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var source = player.getAttribute("data-source");
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (hlsInstance) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          attachSource();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });

      attachSource();
    });
  }

  ready(function () {
    setupNavigation();
    setupHeroCarousel();
    setupMovieFilters();
    setupPlayers();
  });
})();
