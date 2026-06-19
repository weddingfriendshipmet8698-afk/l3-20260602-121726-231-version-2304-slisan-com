(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  document.querySelectorAll('.movie-search-scope').forEach(function (scope) {
    var input = scope.querySelector('[data-card-filter]') || document.querySelector('[data-card-filter]');
    var select = scope.querySelector('[data-type-filter]') || document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var type = normalize(select ? select.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = (!keyword || search.indexOf(keyword) !== -1) && (!type || cardType.indexOf(type) !== -1);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
      applyFilter();
    }
  });
})();
