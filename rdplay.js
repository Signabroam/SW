let audio = new Audio();
let currentTrack = document.getElementById("currentTrack");
let stationName = document.getElementById("stationName");

// Liste des stations spéciales pour le message personnalisé
const specialStations = [
    "buzzer",
    "pip-day.ogg",
    "pip-night.ogg",
    "wheel-day.ogg",
    "wheel-night.ogg"
];

let currentStreamUrl = null; // Variable pour stocker l'URL du flux actuel
let statusCheckInterval = null; // Intervalle pour vérifier les métadonnées

// Fonction pour jouer l'audio sélectionné
function playAudio(src) {
    if (src) {
        audio.src = src;
        audio.play();

        let stationLabel = src.split('://').pop('/').split('/').pop();
        stationName.innerText = "Station: " + stationLabel;

        // Vérifier si la station fait partie des stations spéciales
        if (specialStations.some(station => src.includes(station))) {
            currentTrack.innerText = "Currently: This is a military station extracted from SDR";
        } else {
            currentStreamUrl = src; // Mettre à jour l'URL du flux actuel
            fetchIcecastMetadata(src); // Appel pour récupérer les métadonnées Icecast
            startStatusCheck(); // Démarrer la vérification périodique des métadonnées
        }
    }
}

// Fonction pour régler le volume
function setVolume(volume) {
    audio.volume = volume;
}

// Fonction pour activer/désactiver le mute
function toggleMute(isMuted) {
    audio.muted = isMuted;
}

// Fonction pour interroger Icecast et récupérer les métadonnées
function fetchIcecastMetadata(streamUrl) {
    // Vérifier si l'URL correspond à l'exception
    if (streamUrl.includes("sapircast.caster.fm:16275/BQmgD")) {
        fetch("https://sapircast.caster.fm:16275/status.xsl")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Custom status URL not available");
                }
                return response.text(); // Utiliser .text() car le fichier peut ne pas être JSON
            })
            .then(data => {
                // Extraire les métadonnées du fichier texte (si applicable)
                let currentlyPlayingMatch = data.match(/<tr>\s*<td>Currently playing:<\/td>\s*<td class="streamstats">([^<]+)<\/td>\s*<\/tr>/i); // Correspondance pour "Currently playing"
                if (currentlyPlayingMatch && currentlyPlayingMatch[1]) {
                    currentTrack.innerText = `Currently: ${currentlyPlayingMatch[1].trim()}`;
                } else {
                    currentTrack.innerText = "Currently: No track information";
                }
                stationName.innerText = "Station: KeamsOS Icecast"; // Nom personnalisé pour cette station
            })
            .catch(error => {
                console.log(`Error fetching custom status: ${error.message}`);
                currentTrack.innerText = "Currently: No metadata available";
                stationName.innerText = "Station: KeamsOS Icecast"; // Toujours afficher le nom personnalisé
            });
        return; // Sortir de la fonction pour éviter le traitement standard
    }

    const statusUrls = [
        streamUrl.replace(/\/stream.*$/, "/status-json.xsl"),
        streamUrl.replace(/\/stream.*$/, "/status.xsl"),
        streamUrl.replace(/\/stream.*$/, "/status2.xsl")
    ];

    // Fonction pour essayer les différentes URL de statut
    function tryFetch(urls, index = 0) {
        if (index >= urls.length) {
            let filename = streamUrl.split('/').pop();
            currentTrack.innerText = `Currently: No information available about the current track (File: ${filename})`;
            return;
        }

        fetch(urls[index])
            .then(response => {
                if (!response.ok) {
                    throw new Error(`URL not available: ${urls[index]}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.icestats && data.icestats.source) {
                    let source = Array.isArray(data.icestats.source) ? data.icestats.source[0] : data.icestats.source;
                    if (source.title) {
                        currentTrack.innerText = `Currently: ${source.title}`;
                    } else {
                        currentTrack.innerText = "Currently: No track information";
                    }
                } else {
                    currentTrack.innerText = "Currently: No metadata available";
                }
            })
            .catch(error => {
                console.log(`Trying next URL due to error: ${error.message}`);
                tryFetch(urls, index + 1); // Essayer l'URL suivante en cas d'erreur
            });
    }

    tryFetch(statusUrls); // Démarrer avec la première URL de statut
}

// Fonction pour démarrer la vérification périodique des métadonnées
function startStatusCheck() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval); // Arrêter tout intervalle précédent
    }

    statusCheckInterval = setInterval(() => {
        if (currentStreamUrl) {
            fetchIcecastMetadata(currentStreamUrl); // Vérifier les métadonnées toutes les 30 secondes
        }
    }, 30000); // 30 secondes
}

// Fonction pour arrêter la vérification périodique des métadonnées
function stopStatusCheck() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
}

// Arrêter la vérification des métadonnées lorsque l'audio est arrêté
audio.addEventListener("ended", stopStatusCheck);
audio.addEventListener("pause", stopStatusCheck);

