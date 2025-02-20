const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');


let classList = ['fa-database', 'fa-user', 'fa-id-badge', 'fa-link', 'fa-wifi', 'fa-clock', 'fa-play', 'fa-sync-alt', 'fa-calendar-alt', 'fa-microchip', 'fa-network-wired', 'fa-sim-card', 'fa-tags', 'fa-barcode', 'fa-memory', 'fa-signal', 'fa-info-circle', 'fa-file-alt', 'fa-calendar-check', 'fa-link', 'fa-fingerprint','fa-battery-full'];
let array = [5, 7, 8, 18, 19];

window.addEventListener('load', function () {
    hideLoader();
    searchData(id);
})

function convertToBritishTime(inputString) {
    const regex = /_time":\s*"(\d{4}-\d{2}-\d{2})\s(\d{2}):(\d{2}):(\d{2})\sUTC"/g;
    const resultString = inputString.replace(regex, (match, date, hours, minutes, seconds) => {
        const utcDate = new Date(`${date}T${hours}:${minutes}:${seconds}Z`);
        const options = {
            timeZone: 'Europe/London',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const britishTime = utcDate.toLocaleString('en-GB', options);
        return `_time": "${britishTime}"`;
    });
    return resultString;
}

function convertToBritishTime2(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert hour 0 to 12 for 12-hour format
    hours = String(hours).padStart(2, '0'); // Ensures two-digit hour format

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

function hideLoader() {
    $("#inner-boxs").css('display', 'none');
}

function showLoader() {
    $("#inner-boxs").css('display', 'block');
}

function clearTable() {
    $("#tb").empty();
    $('#f-deviceData').empty();
}

function searchData(id) {
    clearTable();
    showLoader();


    $.ajax({
        "url": `https://tools.afreespace.com/bless/debug.php?id=${id}`,
        success: function (response) {
            hideLoader();
            $('#f-deviceData').empty();
            $('#deviceData').empty();

            let resEdited = convertToBritishTime(response);

            let formatedResponse = resEdited
                .replace(/<hr\/>/g, '<br/>')
                .replace(/<hr>/g, '<br/>')
                .replace(/"/g, '')
                .replace(/,/g, '')
                .replace(/\n/g, '')
                .replace(/}/g, '')
                .replace(/{/g, '')
                .replace(/_/g, ' ')
                .replace(/\\/g, '');

            let res = formatedResponse.split('<br/>');
            let count=0;
            for (let i = 0; i < res.length; i++) {
                if (i < 21) {
                    let ls = res[i].split(/:(.+)/);

                    if (i === 0) {
                        ls[0] = "Device Type";
                        const match = ls[1].match(/PT: (\w+)/);
                        if (match) {
                            ls[1] =match[1];
                        } else {
                            ls[1] ="...";
                        }
                    }

                    if (i === 3) {
                        ls[1] = `<a target="_blank" href="${ls[1]}">Visit Agent</a>`
                    }

                    if (i === 4) {
                        let a=JSON.parse(ls[1].toLowerCase().trim());
                        if (a){
                            ls[1] = '<span class="badge bg-primary">True</span>'
                        }else{
                            ls[1] =  '<span class="badge bg-danger">False</span>'
                        }
                    }

                    if (i === 6) {
                        let a=JSON.parse(ls[1].toLowerCase().trim());
                        if (a){
                            ls[1] = '<span class="badge bg-primary">True</span>'
                        }else{
                            ls[1] =  '<span class="badge bg-danger">False</span>'
                        }
                    }

                    if (array.includes(i)) {
                        ls[1] = convertToBritishTime2(ls[1]);
                    }

                    let htmlM = `<div class="info-section">
                                        <div class="info-section-header"><i class="fas ${classList[i]}"></i>${ls[0].toUpperCase()}</div>
                                        <div class="info-section-value">${ls[1]}</div>
                                      </div>`;
                    $('#f-deviceData').append(htmlM);

                } else {
                    if (i === 21) {
                        let mRes = resEdited
                            .replace(/<hr\/>/g, '<br/>')
                            .replace(/<hr>/g, '<br/>')
                            .replace(/_/g, ' ');

                        let mmRes = mRes.split('<br/>');
                        const responseString=mmRes[i];
                        const battery = responseString.match(/"battery":\s*([\d.]+)/);

                        let htmlM = `<div class="info-section">
                                            <div class="info-section-header"><i class="fas ${classList[i]}"></i>${'battery'.toUpperCase()}</div>
                                            <div class="info-section-value">${battery[1]}</div>
                                          </div>`;
                        $('#f-deviceData').append(htmlM);


                        // Step 2: Extract the JSON content
                        const jsonString = responseString.match(/{.*}/)[0]; // Extracts the JSON part from the string
                        const jsonData = JSON.parse(jsonString); // Converts JSON string to JavaScript object

                        // Step 3: Render JSON dynamically
                        function renderJson(data, container) {
                            for (const key in data) {
                                const value = data[key];
                                const wrapper = document.createElement("div");
                                wrapper.className = "d_wrapper";

                                if (typeof value === "object" && value !== null) {
                                    const keyElement = document.createElement("span");
                                    keyElement.className = "json-key";
                                    keyElement.textContent = `${key.toUpperCase()}: `;

                                    const nestedContainer = document.createElement("div");
                                    nestedContainer.className = "json-object";
                                    renderJson(value, nestedContainer);

                                    wrapper.appendChild(keyElement);
                                    wrapper.appendChild(nestedContainer);
                                } else {
                                    const keyElement = document.createElement("span");
                                    keyElement.className = "json-key";
                                    keyElement.textContent = `${key.toUpperCase()}: `;

                                    const valueElement = document.createElement("span");
                                    valueElement.className = "json-value";
                                    valueElement.textContent = value;

                                    wrapper.appendChild(keyElement);
                                    wrapper.appendChild(valueElement);
                                }

                                container.appendChild(wrapper);
                            }
                        }

                        const container = document.getElementById("deviceData");
                        renderJson(jsonData, container);

                    } else {
                        if (res[i]!==""){
                            count++;
                            let row = `<tr>
                                <td>${count}</td>
                                <td>${res[i]}</td>
                            </tr>`;
                            $("#tb").prepend(row);
                        }
                    }

                }
            }
        }
        ,
        error: function (res) {
            window.close();
            alert("Something Wrong - Check ID");
            clearAll();

        }
    });
}



