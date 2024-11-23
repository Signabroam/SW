let kiwiData = [];
        let websdrData = [];
        let openWebRXData = [];

        async function fetchKiwiSDR() {
            const response = await fetch('http://kiwisdr.com/public/');
            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            doc.querySelectorAll('.cl-entry').forEach(item => {
                const name = item.querySelector('.cl-name')?.textContent.trim();
                const sdrHw = item.querySelector('.cl-sdr_hw')?.textContent.trim();
                const users = item.querySelector('.cl-users')?.textContent.trim();
                const link = item.querySelector('a').getAttribute('href');
                kiwiData.push({ name, sdrHw, users, link });
            });
            displayKiwiSDRs();
        }

        async function fetchWebSDRData() {
            const response = await fetch('websdr.json');
            websdrData = await response.json();
            displayWebSDRs();
        }

        async function fetchOpenWebRXData() {
            const response = await fetch('openwebrx.json');
            openWebRXData = await response.json();
            displayOpenWebRX();
        }

        function displayKiwiSDRs() {
            const resultsContainer = document.getElementById('resultsKiwi');
            resultsContainer.innerHTML = '';
            kiwiData.forEach(({ name, sdrHw, users, link }) => {
                const sdrDiv = createSDRDiv(name, sdrHw, users, link);
                resultsContainer.appendChild(sdrDiv);
            });
        }

        function displayWebSDRs() {
            const resultsContainer = document.getElementById('resultsWebSDR');
            resultsContainer.innerHTML = '';
            websdrData.forEach(({ name, url, img, count }) => {
                const sdrDiv = createGenericSDRDiv(name, url, img, count);
                resultsContainer.appendChild(sdrDiv);
            });
        }

        function displayOpenWebRX() {
            const resultsContainer = document.getElementById('resultsOpenWebRX');
            resultsContainer.innerHTML = '';
            openWebRXData.forEach(({ name, url, img }) => {
                const sdrDiv = createGenericSDRDiv(name, url, img);
                resultsContainer.appendChild(sdrDiv);
            });
        }

        function createSDRDiv(name, sdrHw, users, link) {
            const sdrDiv = document.createElement('div');
            sdrDiv.classList.add('sdr-item');
            sdrDiv.innerHTML = `<img src="http://kiwisdr.com/kiwi/kiwi-avatar.png" alt="KiwiSDR Avatar">
                                <button onclick="openModal('${link}')">${name} (${sdrHw}) - Users: ${users}</button>`;
            return sdrDiv;
        }

        function createGenericSDRDiv(name, url, imgSrc, count) {
            const sdrDiv = document.createElement('div');
            sdrDiv.classList.add('sdr-item');
            sdrDiv.innerHTML = `<img src="${imgSrc}" alt="${name} Avatar">
                                <button onclick="openModal('${url}')">${name}${count ? " - Count: " + count : ''}</button>`;
            return sdrDiv;
        }

        function openModal(link) {
            const modal = document.getElementById('modal');
            document.getElementById('sdrIframe').src = link;
            modal.style.display = 'flex';
        }

        document.getElementById('closeModal').onclick = () => {
            const modal = document.getElementById('modal');
            modal.style.display = 'none';
            document.getElementById('sdrIframe').src = '';
        };

        document.getElementById('sdrSelector').addEventListener('change', (e) => {
            const value = e.target.value;
            document.getElementById('resultsKiwi').style.display = value === 'kiwi' ? 'block' : 'none';
            document.getElementById('searchBar').style.display = value === 'kiwi' ? 'block' : 'none';
            document.getElementById('resultsWebSDR').style.display = value === 'websdr' ? 'block' : 'none';
            document.getElementById('searchWebSDR').style.display = value === 'websdr' ? 'block' : 'none';
            document.getElementById('resultsOpenWebRX').style.display = value === 'openwebrx' ? 'block' : 'none';
            document.getElementById('searchOpenWebRX').style.display = value === 'openwebrx' ? 'block' : 'none';
        });

        // Filtrage dynamique pour chaque champ de recherche
        document.getElementById('searchBar').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const resultsContainer = document.getElementById('resultsKiwi');
            resultsContainer.innerHTML = '';
            kiwiData.filter(item => item.name.toLowerCase().includes(query)).forEach(({ name, sdrHw, users, link }) => {
                const sdrDiv = createSDRDiv(name, sdrHw, users, link);
                resultsContainer.appendChild(sdrDiv);
            });
        });

        document.getElementById('searchWebSDR').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const resultsContainer = document.getElementById('resultsWebSDR');
            resultsContainer.innerHTML = '';
            websdrData.filter(sdr => sdr.name.toLowerCase().includes(query)).forEach(({ name, url, img, count }) => {
                const sdrDiv = createGenericSDRDiv(name, url, img, count);
                resultsContainer.appendChild(sdrDiv);
            });
        });

        document.getElementById('searchOpenWebRX').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const resultsContainer = document.getElementById('resultsOpenWebRX');
            resultsContainer.innerHTML = '';
            openWebRXData.filter(sdr => sdr.name.toLowerCase().includes(query)).forEach(({ name, url, img }) => {
                const sdrDiv = createGenericSDRDiv(name, url, img);
                resultsContainer.appendChild(sdrDiv);
            });
        });

        // Charger les données
        fetchKiwiSDR();
        fetchWebSDRData();
        fetchOpenWebRXData();