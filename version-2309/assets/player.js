import { H as Hls } from './hls-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');

  function useMp4() {
    var mp4 = video.getAttribute('data-mp4');
    if (mp4) {
      video.src = mp4;
    }
  }

  function startPlayback() {
    if (!video) {
      return;
    }

    var hlsSource = video.getAttribute('data-hls');
    var isReady = video.getAttribute('data-ready') === 'true';

    if (!isReady) {
      video.setAttribute('data-ready', 'true');

      if (hlsSource && Hls && Hls.isSupported()) {
        var hls = new Hls({
          lowLatencyMode: true,
          enableWorker: true
        });

        hls.loadSource(hlsSource);
        hls.attachMedia(video);

        if (Hls.Events && Hls.Events.ERROR) {
          hls.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              hls.destroy();
              useMp4();
            }
          });
        }
      } else if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
      } else {
        useMp4();
      }
    }

    video.controls = true;
    player.classList.add('is-playing');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        useMp4();
        video.play().catch(function () {});
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', startPlayback);
  }
});
