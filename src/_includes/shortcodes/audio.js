module.exports = function(url) {
  // Generate a static ID for this build
  const id = "audio-" + Math.random().toString(36).substring(7);
  const filename = url.split('/').pop();
  
  // We add 'data-url' so our JS can find the file later
  return `
<div id="${id}" class="audio-player" data-url="${url}">
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
</div>`;
};