const Toast = Swal.mixin({
    toast: true,
    position: "bottom-center",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});
let camOnOff = true;
let codeReader;
let classList = ['fa-database', 'fa-user', 'fa-id-badge', 'fa-link', 'fa-wifi', 'fa-clock', 'fa-play', 'fa-sync-alt', 'fa-calendar-alt', 'fa-microchip', 'fa-network-wired', 'fa-sim-card', 'fa-tags', 'fa-barcode', 'fa-memory', 'fa-signal', 'fa-info-circle', 'fa-file-alt', 'fa-calendar-check', 'fa-link', 'fa-fingerprint', 'fa-battery-full'];
let array = [5, 7, 8, 18, 19];


window.addEventListener('load', function () {
    hideLoader();
    codeReader = new ZXing.BrowserQRCodeReader();
    camSetting();
    // codeReader.getVideoInputDevices()
    //     .then((videoInputDevices) => {
    //         const sourceSelect = document.getElementById('sourceSelect')
    //         selectedDeviceId = videoInputDevices[0].deviceId
    //         if (videoInputDevices.length >= 1) {
    //             videoInputDevices.forEach((element) => {
    //                 const sourceOption = document.createElement('option')
    //                 sourceOption.text = element.label
    //                 sourceOption.value = element.deviceId
    //                 sourceSelect.appendChild(sourceOption)
    //             })
    //
    //             sourceSelect.onchange = () => {
    //                 selectedDeviceId = sourceSelect.value;
    //             };
    //
    //             const sourceSelectPanel = document.getElementById('sourceSelectPanel')
    //             sourceSelectPanel.style.display = 'block'
    //         }
    //
    //         //start button
    //         document.getElementById('startButton').addEventListener('click', () => {
    //             decodeOnce(codeReader, selectedDeviceId);
    //         })
    //
    //         //reset button
    //         document.getElementById('resetButton').addEventListener('click', () => {
    //             codeReader.reset()
    //             document.getElementById('result').textContent = '';
    //         })
    //
    //     })
    //     .catch((err) => {
    //         console.error(err)
    //     })
})

document.getElementById('btnPaste').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText(); // Read text from the clipboard
        document.getElementById('inp').value = text; // Set the input field's value to the clipboard text
    } catch (err) {
        console.error('Failed to paste text: ', err);
    }
});


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
    $("#inner-box").css('display', 'none');
}

function showLoader() {
    $("#inner-box").css('display', 'block');
}

function clearTable() {
    $("#tb").empty();
    $('#f-deviceData').empty();
}

function searchData() {
    clearTable();
    showLoader();

    let text = $("#inp").val();

    $.ajax({
        "url": `https://tools.afreespace.com/bless/debug.php?id=${text}`,
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
            let count = 0;
            for (let i = 0; i < res.length; i++) {
                if (i < 21) {
                    let ls = res[i].split(/:(.+)/);

                    if (i === 0) {
                        ls[0] = "Device Type";
                        const match = ls[1].match(/PT:\s*([\w\s]+)/);
                        if (match) {
                            ls[1] = match[1];
                        } else {
                            ls[1] = "...";
                        }
                    }

                    if (i === 3) {
                        ls[1] = `<a class="la" target="_blank" href="${ls[1]}">Visit Agent</a>`
                    }

                    if (i === 4) {
                        let a = JSON.parse(ls[1].toLowerCase().trim());
                        if (a) {
                            ls[1] = '<span class="badge bg-primary">True</span>'
                        } else {
                            ls[1] = '<span class="badge bg-danger">False</span>'
                        }
                    }

                    if (i === 6) {
                        let a = JSON.parse(ls[1].toLowerCase().trim());
                        if (a) {
                            ls[1] = '<span class="badge bg-primary">True</span>'
                        } else {
                            ls[1] = '<span class="badge bg-danger">False</span>'
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
                        const responseString = mmRes[i];
                        const battery = responseString.match(/"battery":\s*([\d.]+)/);
                        try {
                            let htmlM = `<div class="info-section">
                                            <div class="info-section-header"><i class="fas ${classList[i]}"></i>${'battery'.toUpperCase()}</div>
                                            <div class="info-section-value">${battery[1]}</div>
                                          </div>`;
                            $('#f-deviceData').append(htmlM);
                        } catch (ex) {
                            console.log("No Battery Found");
                        }

                        try {
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
                        } catch (e) {
                            let at=$(".la");
                            at.css('color','red');
                            at.text('Link is Not Working');
                        }
                    } else {
                        if (res[i] !== "") {
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
            hideLoader();
            alert("Something Wrong - Check ID");
            clearAll();
        }
    });
}

function fadeOutQr() {
    $("#video").css('display', 'none');
}

function fadeInQr() {
    $("#video").css('display', 'block');
}

function clearAll() {
    clearTable();
    $("#inp").val("");
    $("#inp").focus();
    $('#deviceData').empty();
    $('#f-deviceData').empty();
}

function copyToClipboard() {
    const inputField = document.getElementById("inp");

    // Focus the input field for Safari compatibility
    inputField.focus();
    inputField.select();
    inputField.setSelectionRange(0, 99999);

    // Attempt Clipboard API if supported
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inputField.value)
            .then(() => {
                Toast.fire({
                    icon: "success",
                    title: "Copied : " + inputField.value
                });
            })
            .catch(err => {
                console.log(err);
            });
    }
}

function getDeviceID(decodedText) {
    $.ajax({
        //https://q.afreespace.com/m3sUkpAz
        url: decodedText.replace("http://", "https://"),
        success: function (res) {
            let decodedID = $(res).find('#temp-table').children('tbody').children('tr:nth-child(1)').children('td:nth-child(2)').text();
            $('#inp').val(decodedID);
            copyToClipboard();
            searchData();
            codeReader.reset();
            fadeOutQr();
        }
    });
}

function decodeOnce(codeReader, selectedDeviceId) {
    fadeInQr();

    codeReader.decodeFromInputVideoDevice(selectedDeviceId, 'video').then((result) => {
        //print the result
        getDeviceID(result.text);

    }).catch((err) => {
        console.error(err);
    })
}

function camSetting() {
    let rp = localStorage.getItem('cam4');
    if (rp == null) {
        camOnOff = true;
        localStorage.setItem('cam4', 'true');
        decodeOnce(codeReader, 0);
        updateButton(true);
    } else {
        let rp = localStorage.getItem('cam4');
        if (rp === 'true') {
            decodeOnce(codeReader, 0);
            camOnOff = true;
            updateButton(true);
        } else if (rp === 'false') {
            camOnOff = false;
            updateButton(false);
        }
    }
}

function setCam(rs) {
    localStorage.setItem('cam4', rs);
    if (rs === 'true') updateButton(true);
    if (rs === 'false') updateButton(false);
}

function updateButton(rs) {
    const button = document.getElementById("qrStp");
    if (!rs) {
        button.textContent = "Cam : On";
    } else {

        button.textContent = "Cam : Off";
    }
}

$("#qrStp").click(function () {
    if (camOnOff === true) {
        codeReader.reset();
        fadeOutQr();
        camOnOff = false;
        setCam('false');
    } else {
        fadeInQr();
        decodeOnce(codeReader, 0);
        setCam('true');
        camOnOff = true;
    }

});

$("#clear").click(function () {
    clearAll();
    codeReader.reset();
    camSetting();
});

$("#btnCpy").click(function () {
    copyToClipboard();
});

$('#search').click(function () {
    searchData();
});