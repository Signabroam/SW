// --- Variables globales ---
let audio = document.getElementById('audio');
if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'audio';
    audio.autoplay = true;
    document.body.appendChild(audio);
}
const currentTrack = document.getElementById("currentTrack");
const stationNameDiv = document.getElementById("stationName");
const stationThumb = document.getElementById('stationThumb');
let currentStreamUrl = null;
let statusCheckInterval = null;

// --- Stations spéciales ---
const specialStations = [
    "buzzer",
    "pip-day.ogg",
    "pip-night.ogg",
    "wheel-day.ogg",
    "wheel-night.ogg"
];

// --- Lecture d'une station ---
function playAudio(url) {
    if (!url) return;
    audio.src = url;
    audio.play();

    // Récupère l'option sélectionnée
    const select = document.getElementById('audioSelect');
    const selectedOption = select.options[select.selectedIndex];
    const stationLabel = selectedOption ? selectedOption.text : url;
    const thumb = selectedOption?.getAttribute('tmb') || 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

    // Affiche le thumbnail et le nom
    stationThumb.src = thumb;
    stationThumb.style.display = 'inline-block';
    stationNameDiv.textContent = 'Station: ' + stationLabel;

    document.getElementById('bg-blur').style.backgroundImage = `url('${thumb}')`;

    // Gère les métadonnées
    if (specialStations.some(station => url.includes(station))) {
        currentTrack.innerText = "Currently: This is a military station extracted from SDR";
        stopStatusCheck();
    } else {
        currentStreamUrl = url;
        fetchIcecastMetadata(url);
        startStatusCheck();
    }
}

// --- Volume & Mute ---
function setVolume(volume) {
    audio.volume = volume;
}
function toggleMute(isMuted) {
    audio.muted = isMuted;
}

// --- Métadonnées Icecast ---
function fetchIcecastMetadata(streamUrl) {
    // Cas particulier KeamsOS Icecast
    if (streamUrl.includes("sapircast.caster.fm:16275/BQmgD")) {
        fetch("https://sapircast.caster.fm:16275/status.xsl")
            .then(r => r.ok ? r.text() : Promise.reject("Custom status URL not available"))
            .then(data => {
                let match = data.match(/<tr>\s*<td>Currently playing:<\/td>\s*<td class="streamstats">([^<]+)<\/td>\s*<\/tr>/i);
                currentTrack.innerText = match && match[1]
                    ? `Currently: ${match[1].trim()}`
                    : "Currently: No track information";
                stationNameDiv.innerText = "Station: KeamsOS Icecast";
            })
            .catch(() => {
                currentTrack.innerText = "Currently: No metadata available";
                stationNameDiv.innerText = "Station: KeamsOS Icecast";
            });
        return;
    }

    // URLs de status classiques
    const statusUrls = [
        streamUrl.replace(/\/stream.*$/, "/status-json.xsl"),
        streamUrl.replace(/\/stream.*$/, "/status.xsl"),
        streamUrl.replace(/\/stream.*$/, "/status2.xsl")
    ];

    function tryFetch(urls, idx = 0) {
        if (idx >= urls.length) {
            let filename = streamUrl.split('/').pop();
            currentTrack.innerText = `Currently: No information available about the current track (File: ${filename})`;
            return;
        }
        fetch(urls[idx])
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                if (data && data.icestats && data.icestats.source) {
                    let source = Array.isArray(data.icestats.source) ? data.icestats.source[0] : data.icestats.source;
                    currentTrack.innerText = source.title
                        ? `Currently: ${source.title}`
                        : "Currently: No track information";
                } else {
                    currentTrack.innerText = "Currently: No metadata available";
                }
            })
            .catch(() => tryFetch(urls, idx + 1));
    }
    tryFetch(statusUrls);
}

// --- Vérification périodique des métadonnées ---
function startStatusCheck() {
    stopStatusCheck();
    statusCheckInterval = setInterval(() => {
        if (currentStreamUrl) fetchIcecastMetadata(currentStreamUrl);
    }, 30000);
}
function stopStatusCheck() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
}

// --- Arrêt de la vérification quand l'audio s'arrête ---
audio.addEventListener("ended", stopStatusCheck);
audio.addEventListener("pause", stopStatusCheck);

// --- Expose les fonctions globalement si besoin ---
window.playAudio = playAudio;
window.setVolume = setVolume;
window.toggleMute = toggleMute;
