function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function rootPrefix() {
  return window.location.pathname.includes("/movies/") ? "../" : "./";
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setupHeader() {
  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }
}

function setupHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupRails() {
  document.querySelectorAll(".rail-section").forEach(function (section) {
    var rail = section.querySelector("[data-rail]");
    var prev = section.querySelector("[data-rail-prev]");
    var next = section.querySelector("[data-rail-next]");

    if (!rail) {
      return;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        rail.scrollBy({ left: -420, behavior: "smooth" });
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        rail.scrollBy({ left: 420, behavior: "smooth" });
      });
    }
  });
}

function setupGlobalSearch() {
  var data = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
  var prefix = rootPrefix();

  document.querySelectorAll("[data-global-search]").forEach(function (form) {
    var input = form.querySelector("input[type='search']");
    var panel = form.querySelector("[data-search-results]");

    if (!input || !panel) {
      return;
    }

    function closePanel() {
      panel.classList.remove("is-open");
    }

    function render(query) {
      var q = normalizeText(query);
      if (!q) {
        panel.innerHTML = "";
        closePanel();
        return;
      }

      var results = data.filter(function (item) {
        return normalizeText(item.title + " " + item.year + " " + item.region + " " + item.genre + " " + item.tags).includes(q);
      }).slice(0, 12);

      if (!results.length) {
        panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
        panel.classList.add("is-open");
        return;
      }

      panel.innerHTML = results.map(function (item) {
        var title = escapeHtml(item.title);
        var year = escapeHtml(item.year);
        var region = escapeHtml(item.region);
        var url = prefix + encodeURI(item.url);
        var cover = prefix + encodeURI(item.cover);
        return '<a class="search-result" href="' + url + '">' +
          '<img src="' + cover + '" alt="' + title + '">' +
          '<span><strong>' + title + '</strong><span>' + year + ' · ' + region + '</span></span>' +
          '</a>';
      }).join("");
      panel.classList.add("is-open");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render(input.value);
    });

    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        closePanel();
      }
    });
  });
}

function setupFilters() {
  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var grid = panel.parentElement.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }

    var search = panel.querySelector("[data-filter-search]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var genre = panel.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var q = normalizeText(search ? search.value : "");
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var genreValue = genre ? genre.value : "";

      cards.forEach(function (card) {
        var haystack = normalizeText(card.dataset.title + " " + card.dataset.genre + " " + card.dataset.tags + " " + card.dataset.region + " " + card.dataset.year);
        var ok = true;
        if (q && !haystack.includes(q)) {
          ok = false;
        }
        if (yearValue && card.dataset.year.indexOf(yearValue) === -1) {
          ok = false;
        }
        if (regionValue && card.dataset.region !== regionValue) {
          ok = false;
        }
        if (genreValue && card.dataset.genre.indexOf(genreValue) === -1 && card.dataset.tags.indexOf(genreValue) === -1) {
          ok = false;
        }
        card.classList.toggle("is-hidden", !ok);
      });
    }

    [search, year, region, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
}

function setupPlayers() {
  document.querySelectorAll("[data-player]").forEach(function (wrap) {
    var video = wrap.querySelector("video");
    var trigger = wrap.querySelector("[data-player-trigger]");

    if (!video) {
      return;
    }

    var sourceNode = video.querySelector("source[type='application/x-mpegURL']") || video.querySelector("source");
    var source = sourceNode ? sourceNode.getAttribute("src") : video.getAttribute("src");
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !source) {
        return;
      }
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        if (sourceNode && sourceNode.parentNode) {
          sourceNode.parentNode.removeChild(sourceNode);
        }
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      wrap.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      wrap.classList.add("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
}

ready(function () {
  setupHeader();
  setupHero();
  setupRails();
  setupGlobalSearch();
  setupFilters();
  setupPlayers();
});
