let kiwiData = [];
        let websdrData = [];
        let openWebRXData = [];

        async function fetchKiwiSDR() {
            const resultsContainer = document.getElementById('resultsKiwi');
            resultsContainer.innerHTML = 'Loading...';
            const response = await fetch('http://kiwisdr.com/public/');
            const data = await response.text();

            setTimeout(() => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const sdrItems = doc.querySelectorAll('.cl-entry');
                resultsContainer.innerHTML = '';
                kiwiData = [];
                sdrItems.forEach(item => {
                    const name = item.querySelector('.cl-name')?.textContent.trim();
                    const sdrHw = item.querySelector('.cl-sdr_hw')?.textContent.trim();
                    const users = item.querySelector('.cl-users')?.textContent.trim();
                    const link = item.querySelector('a').getAttribute('href');
                    kiwiData.push({ name, sdrHw, users, link });
                    const sdrDiv = createSDRDiv(name, sdrHw, users, link);
                    resultsContainer.appendChild(sdrDiv);
                });
            }, 2000);
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

        function createSDRDiv(name, sdrHw, users, link) {
            const sdrDiv = document.createElement('div');
            sdrDiv.classList.add('sdr-item');
            sdrDiv.innerHTML = `<img src="http://kiwisdr.com/kiwi/kiwi-avatar.png" alt="KiwiSDR Avatar">
                                <button style="background: transparent; border: none; width: 100%; text-align: left;">
                                    ${name} (${sdrHw}) - Users: ${users}
                                </button>`;
            sdrDiv.onclick = () => openIframe(link);
            return sdrDiv;
        }

        function displayWebSDRs() {
            const resultsContainer = document.getElementById('resultsWebSDR');
            websdrData.forEach(sdr => {
                const sdrDiv = createGenericSDRDiv(sdr.name, sdr.url, sdr.img, sdr.count);
                resultsContainer.appendChild(sdrDiv);
            });
        }

        function displayOpenWebRX() {
            const resultsContainer = document.getElementById('resultsOpenWebRX');
            openWebRXData.forEach(sdr => {
                const sdrDiv = createGenericSDRDiv(sdr.name, sdr.url, sdr.img);
                resultsContainer.appendChild(sdrDiv);
            });
        }

        function createGenericSDRDiv(name, url, imgSrc, count) {
            const sdrDiv = document.createElement('div');
            sdrDiv.classList.add('sdr-item');
            const userCount = count ? ` - Count: ${count}` : '';
            sdrDiv.innerHTML = `<img src="${imgSrc}" alt="${name} Avatar">
                                <button style="background: transparent; border: none; width: 100%; text-align: left;">
                                    ${name}${userCount}
                                </button>`;
            sdrDiv.onclick = () => openIframe(url);
            return sdrDiv;
        }

        function openIframe(url) {
            const modal = document.getElementById('modal');
            const iframe = document.getElementById('sdrIframe');
            iframe.src = url;
            modal.style.display = 'flex';
        }

        document.getElementById('closeModal').onclick = () => {
            const modal = document.getElementById('modal');
            const iframe = document.getElementById('sdrIframe');
            iframe.src = ''; // Réinitialiser la source de l'iframe
            modal.style.display = 'none';
        };

        document.getElementById('sdrSelector').addEventListener('change', (e) => {
            const selected = e.target.value;
            document.getElementById('resultsKiwi').style.display = selected === 'kiwi' ? 'block' : 'none';
            document.getElementById('resultsWebSDR').style.display = selected === 'websdr' ? 'block' : 'none';
            document.getElementById('resultsOpenWebRX').style.display = selected === 'openwebrx' ? 'block' : 'none';
            document.getElementById('searchBar').style.display = selected === 'kiwi' ? 'block' : 'none';
            document.getElementById('searchWebSDR').style.display = selected === 'websdr' ? 'block' : 'none';
            document.getElementById('searchOpenWebRX').style.display = selected === 'openwebrx' ? 'block' : 'none';
        });

        fetchKiwiSDR();
        fetchWebSDRData();
        fetchOpenWebRXData();