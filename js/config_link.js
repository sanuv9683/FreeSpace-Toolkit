document.getElementById('fetch-data').addEventListener('click', async () => {
    const urlInput = document.getElementById('url-input').value.trim();

    if (!urlInput) {
        alert('Please enter a valid URL.');
        return;
    }

    const loader = document.getElementById('loader');
    loader.style.display = 'block'; // Show the loader

    try {
        // Fetch the response from the entered URL
        const response = await fetch(urlInput);
        const htmlText = await response.text();

        // Extract the embedded data from the HTML response
        const dataMatch = htmlText.match(/data\s*:\s*(\[.*?\]),/s); // Regex to locate `data: [...]`
        if (!dataMatch) {
            throw new Error('Data array not found in the response.');
        }

        const rawData = JSON.parse(dataMatch[1]); // Parse the extracted JSON data
        console.log("Extracted Data:", rawData); // Debugging: Verify extracted data

        // Transform the data into a usable format
        const data = rawData.map(item => {
            const lastConnectedUTC = item.accessedAt || "N/A";
            const lastPresenceUTC = item.LastPresence || "N/A";

            // Convert times to Europe/London timezone and format them
            const lastConnected = lastConnectedUTC !== "N/A"
                ? moment.tz(lastConnectedUTC, "Europe/London").format("YYYY-MM-DD, hh:mm A")
                : "N/A";

            const lastPresence = lastPresenceUTC !== "N/A"
                ? moment.tz(lastPresenceUTC, "Europe/London").format("YYYY-MM-DD, hh:mm A")
                : "N/A";

            return {
                MarkerId: item.serial || "N/A",
                DeviceId: item.blessId || "N/A",
                DeviceType: item.DEVICE_TYPE || "Unknown",
                Name: item.displayName || "Unknown",
                Battery: item.BatteryVoltage ? item.BatteryVoltage.toFixed(2) + "V" : "N/A",
                LastConnected: lastConnected,
                LastPresence: lastPresence,
            };
        });

        console.log("Transformed Data:", data); // Debugging: Verify transformed data

        // Validate the data
        const today = moment().tz("Europe/London").format('YYYY-MM-DD');
        const validatedData = data.map(row => {
            const lastPresenceDate = row.LastPresence !== "N/A"
                ? moment(row.LastPresence, "YYYY-MM-DD, hh:mm A").format('YYYY-MM-DD')
                : null;

            const isValid = lastPresenceDate === today;

            return {
                ...row,
                Status: isValid ? '<span class="status-icon text-success">✅ Valid</span>' : '<span class="status-icon text-danger">❌ Invalid</span>',
                isValid,
            };
        });

        console.log("Validated Data:", validatedData); // Debugging: Check validated data

        // Sort by validity (invalid rows first)
        validatedData.sort((a, b) => (a.isValid === b.isValid ? 0 : a.isValid ? 1 : -1));

        // Initialize or Update DataTable
        const table = $('#example').DataTable();
        table.clear();

        validatedData.forEach(row => {
            const rowClass = row.isValid ? 'valid-row' : 'invalid-row';
            table.row.add([
                row.MarkerId,
                row.DeviceId,
                row.DeviceType,
                row.Name,
                row.Battery,
                row.LastConnected,
                row.LastPresence,
                row.Status,
            ]).node().className = rowClass;
        });

        table.draw();

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        alert(`Failed to fetch or process data: ${error.message}`);
    } finally {
        loader.style.display = 'none'; // Hide the loader
    }
});

// Clear button logic
document.getElementById('clear-data').addEventListener('click', () => {
    const urlInput = document.getElementById('url-input');
    const table = $('#example').DataTable();

    // Clear input field and table
    urlInput.value = '';
    table.clear().draw();
});