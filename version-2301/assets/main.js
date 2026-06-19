(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function getItems() {
    return Array.prototype.slice.call(document.querySelectorAll(".js-filter-item"));
  }

  function applySearch(query) {
    var value = (query || "").trim().toLowerCase();
    var items = getItems();
    var visible = 0;
    items.forEach(function (item) {
      var keywords = (item.getAttribute("data-keywords") || item.textContent || "").toLowerCase();
      var match = !value || keywords.indexOf(value) !== -1;
      item.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    document.querySelectorAll("[data-empty-state]").forEach(function (empty) {
      empty.hidden = visible !== 0;
    });
  }

  function setupLocalSearch() {
    var input = document.querySelector("[data-local-search]");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }
    input.addEventListener("input", function () {
      applySearch(input.value);
    });
    applySearch(input.value);
  }

  function setupFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var value = button.getAttribute("data-filter");
        if (value === "all") {
          getItems().forEach(function (item) {
            item.hidden = false;
          });
          document.querySelectorAll("[data-empty-state]").forEach(function (empty) {
            empty.hidden = true;
          });
          return;
        }
        applySearch(value);
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
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
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function prepareVideo(player) {
    var video = player.querySelector("video");
    var source = player.getAttribute("data-video");
    if (!video || !source) {
      return null;
    }
    if (player.dataset.ready === "1") {
      return video;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      player._hls = hls;
    } else {
      video.src = source;
    }
    player.dataset.ready = "1";
    player.classList.add("is-ready");
    return video;
  }

  function playVideo(player) {
    var video = prepareVideo(player);
    if (!video) {
      return;
    }
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {});
    }
  }

  function setupPlayers() {
    document.querySelectorAll(".js-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo(player);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (player.dataset.ready !== "1") {
            playVideo(player);
          }
        });
      }
      player.addEventListener("click", function (event) {
        if (event.target === player) {
          playVideo(player);
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupLocalSearch();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
