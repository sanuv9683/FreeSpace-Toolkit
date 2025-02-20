document.addEventListener("DOMContentLoaded", () => {
    // Set default values for Start Time and End Time
    const currentTime = new Date();
    const currentHours = String(currentTime.getHours()).padStart(2, '0');
    const currentMinutes = String(currentTime.getMinutes()).padStart(2, '0');
    document.getElementById('startTime').value = `${currentHours}:${currentMinutes}`;
});

document.getElementById('calculateBtn').addEventListener('click', function () {
    const numDevices = parseInt(document.getElementById('numDevices').value);
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const teamMembers = parseInt(document.getElementById('teamMembers').value);
    const intervalTime = parseInt(document.getElementById('intervalTime').value);

    if (!numDevices || !startTime || !endTime || !teamMembers) {
        alert('Please fill out all fields correctly.');
        return;
    }

    // Calculate Total Time Available
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const totalMinutes = (end - start) / (1000 * 60);

    if (totalMinutes <= 0) {
        alert('End time must be later than start time.');
        return;
    }

    // Deduct Interval Time
    const effectiveMinutes = totalMinutes - (intervalTime || 0);
    const effectiveHours = effectiveMinutes / 60;

    if (effectiveMinutes <= 0) {
        alert('Interval time is too high; no effective working time left.');
        return;
    }

    let devicesPerHour = null;
    let devicesPerTeamMemberPerHour = null;
    if (effectiveMinutes >= 60) {
        devicesPerHour = Math.ceil(numDevices / effectiveHours);
        devicesPerTeamMemberPerHour = Math.floor(devicesPerHour / teamMembers);
    }

    let devicesPer30Minutes = null;
    let devicesPerTeamMemberPer30Minutes = null;
    if (effectiveMinutes < 60) {
        devicesPer30Minutes = Math.ceil((numDevices / effectiveMinutes) * 30);
        devicesPerTeamMemberPer30Minutes = Math.ceil(devicesPer30Minutes / teamMembers);
    }

    const averageTimePerDevice = (effectiveMinutes / numDevices).toFixed(2);
    const averageTimePerDevicePerTeamMember = (
        effectiveMinutes /
        (numDevices * teamMembers)
    ).toFixed(2);


    let reportHTML = `
    <h3><i class="fas fa-clock"></i> Time Details</h3>
    <p><i class="fas fa-stopwatch"></i> <strong>Total Time Available:</strong> ${(totalMinutes / 60).toFixed(2)} Hours</p>
    <p><i class="fas fa-cut"></i> <strong>Interval Duration:</strong> ${intervalTime || 0} Minutes</p>
    <p><i class="fas fa-tasks"></i> <strong>Working Hours:</strong> ${effectiveHours.toFixed(2)} Hours</p>
    <hr>
    <h3><i class="fas fa-cogs"></i> Work Details</h3>
`;

    if (devicesPerHour) {
        reportHTML += `
      <p><i class="fas fa-hourglass-half"></i> <strong>DPH for Team:</strong> ${devicesPerHour} Devices</p>
      <p><i class="fas fa-user-cog"></i> <strong>DPH for Member:</strong> ${devicesPerTeamMemberPerHour} Devices</p>
  `;
    }

    if (devicesPer30Minutes) {
        reportHTML += `
      <p><i class="fas fa-hourglass-start"></i> <strong>DP 30 Mins:</strong> ${devicesPer30Minutes}</p>
      <p><i class="fas fa-user"></i> <strong>DP 30 Mins Per Member :</strong> ${devicesPerTeamMemberPer30Minutes}</p>
  `;
    }

    reportHTML += `
    <hr>
    <h3><i class="fas fa-chart-pie"></i> Averages</h3>
    <p><i class="fas fa-calculator"></i> <strong>Average Time PD (Team):</strong> ${averageTimePerDevice} Minutes</p>
    <p><i class="fas fa-user-clock"></i> <strong>Average Time PD (Member):</strong> ${averageTimePerDevicePerTeamMember} Minutes</p>
`;

    document.getElementById('output').innerHTML = reportHTML;
});