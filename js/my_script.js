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

function hideLoader() {
    $("#inner-box").css('display', 'none');
}

function showLoader() {
    $("#inner-box").css('display', 'block');
}

function clearTable() {
    $("#tb").empty();
}

function searchData() {
    clearTable();
    showLoader();

    let text = $("#inp").val();

    $.ajax({
        "url": `https://tools.afreespace.com/bless/debug.php?id=${text}`,
        success: function (response) {
            hideLoader();
            $('#deviceData').empty();

            let resEdited = convertToBritishTime(response);

            let formatedResponse = resEdited
                .replace(/<hr\/>/g, '')
                .replace(/<hr>/g, '')
                .replace(/"/g, '')
                .replace(/,/g, '')
                .replace(/\\/g, '');

            let fr = formatedResponse.split('<br/>');

            for (let i = 0; i < fr.length; i++) {
                if (i > 18) {
                    if (i === 19) {
                        // Function to extract all key-value pairs using regex
                        let m = extractAllData();

                        function extractAllData() {
                            const regex = /([a-zA-Z0-9_]+):\s*([^{}\s]+)/g;
                            let match;
                            let data = {};

                            while ((match = regex.exec(fr[i])) !== null) {
                                data[match[1]] = match[2];
                            }
                            return data;
                        }

                        let html = '';

                        for (let key in m) {
                            html += `<li class="list-group-item"><strong>${key}:</strong> ${m[key]}</li>`;
                        }

                        $('#deviceData').html(html);

                    } else {
                        let row = `<tr>
                                <td>${i}</td>
                                <td>${fr[i]}</td>
                            </tr>`;
                        $("#tb").append(row);
                    }
                } else {
                    printResponse(fr[i], i);
                }
            }
        },
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

function printResponse(param, i) {
    let a = param.split(':');
    let c = a[0].toUpperCase();
    let d = a[1];
    if (i === 2) d = `<a target="_blank" href="${a[1] + ":" + a[2]}">${a[1] + ":" + a[2]}</a>`;

    let row = `<tr>
                   <td>${i}</td>
                   <td><strong id="str">${c}</strong> : ${d}</td>
                   </tr>`;
    $("#tb").append(row);
}

function clearAll() {
    clearTable();
    $("#inp").val("");
    $("#inp").focus();
    $('#deviceData').empty();

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
    } else {
        let rp = localStorage.getItem('cam4');
        if (rp === 'true') {
            decodeOnce(codeReader, 0);
            camOnOff = true;
        } else if (rp === 'false') {
            camOnOff = false;
        }
    }
}

function setCam(rs) {
    localStorage.setItem('cam4', rs)
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
    onOff = 1;
    camSetting();
});

$("#btnCpy").click(function () {
    copyToClipboard();
});

$('#search').click(function () {
    searchData();
});