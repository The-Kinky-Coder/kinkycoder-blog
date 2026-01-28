module.exports = function(url) {
  const id = "audio-" + Math.random().toString(36).substring(7);
  const filename = url.split('/').pop();
  return `
<div id="${id}" class="audio-player">
  <button id="${id}-btn" class="play-btn" aria-label="Play/Pause">
      <svg id="${id}-play" viewBox="0 0 24 24" fill="currentColor" width="56" height="56"><path d="M8 5v14l11-7z"/></svg>
      <svg id="${id}-pause" viewBox="0 0 24 24" fill="currentColor" width="56" height="56" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
  </button>
  
  <div class="waveform-container">
      <div id="${id}-waveform"></div>
      <div class="track-info">
          <span class="filename" title="${filename}">${filename}</span>
          <a href="${url}" download class="download-link">
              <svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
          </a>
          <span class="time"><span id="${id}-current">0:00</span> / <span id="${id}-total">0:00</span></span>
          <div class="volume-control">
              <button id="${id}-mute" class="volume-btn" aria-label="Mute/Unmute" title="Mute/Unmute">
                <svg id="${id}-vol-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <svg id="${id}-mute-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display: none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
              </button>
              <input type="range" id="${id}-volume" class="volume-slider" min="0" max="1" step="0.05" value="1" aria-label="Volume">
          </div>
      </div>
  </div>
</div>

<script type="module">
  import WaveSurfer from '/js/wavesurfer.esm.js'

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const waveColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';

  const commonOptions = {
      container: '#${id}-waveform',
      waveColor: waveColor,
      progressColor: '#f50',
      url: '${url}',
      height: 60,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      cursorColor: '#f50',
      cursorWidth: 1,
      normalize: true,
  };

  function initPlayer(extraOptions = {}) {
      const options = { ...commonOptions, ...extraOptions };
      const wavesurfer = WaveSurfer.create(options);

      // Controls
      const playPauseBtn = document.getElementById('${id}-btn')
      const playIcon = document.getElementById('${id}-play')
      const pauseIcon = document.getElementById('${id}-pause')
      const currentTime = document.getElementById('${id}-current')
      const totalDuration = document.getElementById('${id}-total')
      
      // Volume controls
      const volumeSlider = document.getElementById('${id}-volume')
      const muteBtn = document.getElementById('${id}-mute')
      const volIcon = document.getElementById('${id}-vol-icon')
      const muteIcon = document.getElementById('${id}-mute-icon')
      let lastVolume = 1

      playPauseBtn.addEventListener('click', () => {
          wavesurfer.playPause()
      })

      wavesurfer.on('play', () => {
          playIcon.style.display = 'none'
          pauseIcon.style.display = 'block'
      })

      wavesurfer.on('pause', () => {
          playIcon.style.display = 'block'
          pauseIcon.style.display = 'none'
      })
      
      // Volume interactions
      const updateSlider = (value) => {
          const percentage = value * 100
          volumeSlider.style.background = \`linear-gradient(to right, #f50 \${percentage}%, var(--border, #dee2e6) \${percentage}%)\`
      }

      // Initialize slider background
      updateSlider(volumeSlider.value)

      volumeSlider.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value)
          wavesurfer.setVolume(value)
          lastVolume = value
          updateMuteIcon(value === 0)
          updateSlider(value)
      })
      
      muteBtn.addEventListener('click', () => {
          const currentVolume = wavesurfer.getVolume()
          
          if (currentVolume > 0) {
              lastVolume = currentVolume
              wavesurfer.setVolume(0)
              volumeSlider.value = 0
              updateMuteIcon(true)
              updateSlider(0)
          } else {
              const newVolume = lastVolume || 1 
              wavesurfer.setVolume(newVolume)
              volumeSlider.value = newVolume
              updateMuteIcon(false)
              updateSlider(newVolume)
          }
      })
      
      function updateMuteIcon(isMuted) {
          if (isMuted) {
              volIcon.style.display = 'none'
              muteIcon.style.display = 'block'
          } else {
              volIcon.style.display = 'block'
              muteIcon.style.display = 'none'
          }
      }

      const formatTime = (seconds) => {
          const minutes = Math.floor(seconds / 60)
          const secondsRemainder = Math.floor(seconds % 60)
          const paddedSeconds = secondsRemainder < 10 ? \`0\${secondsRemainder}\` : secondsRemainder
          return \`\${minutes}:\${paddedSeconds}\`
      }

      // Depending on whether we have peaks or not, decode event might behave differently
      // But 'ready' usually fires. 'decode' fires when audio is decoded.
      // If peaks are provided, 'decode' might NOT fire immediately if we don't load audio?
      // WaveSurfer v7: If peaks, it simulates a decode? 
      // Actually, let's listen to 'ready' (waveform drawn) and 'decode' (audio ready)
      
      wavesurfer.on('decode', (duration) => {
          totalDuration.textContent = formatTime(duration)
      })

      wavesurfer.on('ready', (duration) => {
          totalDuration.textContent = formatTime(duration)
      })

      wavesurfer.on('timeupdate', (currentTimeSeconds) => {
          currentTime.textContent = formatTime(currentTimeSeconds)
      })
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
          wavesurfer.setOptions({
              waveColor: event.matches ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'
          });
      });
  }

  // Try to load peaks
  const jsonUrl = '${url}'.replace(/\.[^/.]+$/, ".json");

  fetch(jsonUrl)
    .then(response => {
        if (!response.ok) throw new Error('No peaks');
        return response.json();
    })
    .then(data => {
        if (data && data.data) {
            initPlayer({ peaks: [data.data] });
        } else {
            initPlayer();
        }
    })
    .catch((e) => {
        initPlayer();
    });
</script>
  `;
};
