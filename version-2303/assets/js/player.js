(function() {
    window.setupMoviePlayer = function(source) {
        const video = document.getElementById('movie-player');
        const startButton = document.getElementById('player-start');
        let isReady = false;

        if (!video || !source) {
            return;
        }

        function bindSource() {
            if (isReady) {
                return;
            }

            isReady = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function beginPlayback() {
            bindSource();
            if (startButton) {
                startButton.classList.add('hidden');
            }
            const playAction = video.play();
            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function() {});
            }
        }

        if (startButton) {
            startButton.addEventListener('click', beginPlayback);
        }

        video.addEventListener('click', function() {
            if (video.paused) {
                beginPlayback();
            }
        });
    };
})();
