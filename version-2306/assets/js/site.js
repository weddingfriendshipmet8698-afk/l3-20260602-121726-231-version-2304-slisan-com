(function() {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function(index) {
      current = index;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        showSlide(dotIndex);
      });
    });
    window.setInterval(function() {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
  panels.forEach(function(panel) {
    var input = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-region-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var scope = document.querySelector(panel.getAttribute('data-search-panel')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var apply = function() {
      var key = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var okKey = !key || text.indexOf(key) !== -1;
        var okRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var okType = !typeValue || card.getAttribute('data-type') === typeValue;
        card.style.display = okKey && okRegion && okType ? '' : 'none';
      });
    };
    [input, region, type].forEach(function(item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.player'));
  players.forEach(function(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var cover = player.querySelector('.player-cover');
    var begin = function() {
      if (!video) {
        return;
      }
      var source = video.querySelector('source');
      var src = source ? source.getAttribute('src') : video.getAttribute('src');
      if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', src);
        }
      } else if (src && window.Hls && window.Hls.isSupported()) {
        if (!video._hlsInstance) {
          var hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        }
      } else if (src && !video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
      player.classList.add('is-playing');
      video.controls = true;
      var playAction = video.play();
      if (playAction && playAction.catch) {
        playAction.catch(function() {});
      }
    };
    if (button) {
      button.addEventListener('click', begin);
    }
    if (cover) {
      cover.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', function() {
        if (video.paused) {
          begin();
        }
      });
    }
  });
})();
