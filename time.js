function formatDateTime() {
            const now = new Date();
            
            // Format for the date: weekday, day month year
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            const dayOfWeek = daysOfWeek[now.getDay()];
            const day = now.getDate();
            const month = months[now.getMonth()];
            const year = now.getFullYear();
            
            // Format for the date in text
            const dateText = `${dayOfWeek}, ${day} ${month} ${year}`;
            
            // UTC Time
            const utcHour = now.getUTCHours().toString().padStart(2, '0');
            const utcMinute = now.getUTCMinutes().toString().padStart(2, '0');
            const utcSecond = now.getUTCSeconds().toString().padStart(2, '0');
            
            // Local Time (Moscow is UTC+3)
            const moscowOffset = 3 * 60; // Moscow is UTC+3
            const localMinutes = now.getUTCMinutes() + now.getUTCHours() * 60 + moscowOffset;
            const localHour = Math.floor(localMinutes / 60).toString().padStart(2, '0');
            const localMinute = (localMinutes % 60).toString().padStart(2, '0');
            const localSecond = now.getSeconds().toString().padStart(2, '0');
            
            document.getElementById('datetime').innerHTML = `
                ${dateText}<br>
               UTC ${utcHour}:${utcMinute}:${utcSecond} UTC-0 <br>
                MSK ${localHour}:${localMinute}:${localSecond} Local
            `;
        }

        // Update the time every second
        setInterval(formatDateTime, 1000);
        
        // Initial call to display the time immediately
        formatDateTime();