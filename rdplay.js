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
                fetchIcecastMetadata(src);  // Appel pour récupérer les métadonnées Icecast
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
        const statusUrls = [
            streamUrl.replace(/\/stream.*$/, "/status-json.xsl"),
            streamUrl.replace(/\/stream.*$/, "/status.xsl"),
            streamUrl.replace(/\/stream.*$/, "/status2.xsl")
        ];

        // Fonction pour essayer les différentes URL de statut
        function tryFetch(urls, index = 0) {
            if (index >= urls.length) {
                // Afficher le nom du fichier audio ou un message générique si aucune info n'est disponible
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
                    // Chercher les informations sur la piste en cours (adapté selon le format Icecast)
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
                    tryFetch(urls, index + 1);  // Essayer l'URL suivante en cas d'erreur
                });
        }

        tryFetch(statusUrls);  // Démarrer avec la première URL de statut
    }