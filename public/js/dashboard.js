function loadDashboard() {
    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            fetch("/patients")
                .then(function (response) {
                    return response.json()
                })
                .then(function (patients) {
                    var today = new Date()
                    var todayStr = today.toISOString().split("T")[0]

                    var todayCount = 0
                    var scheduledCount = 0
                    var cancelledCount = 0

                    appointments.forEach(function (appt) {
                        var apptDate = new Date(appt.appointmentDate).toISOString().split("T")[0]
                        if (apptDate === todayStr) {
                            todayCount++
                        }
                        if (appt.status === "Scheduled") {
                            scheduledCount++
                        }
                        if (appt.status === "Cancelled") {
                            cancelledCount++
                        }
                    })

                    document.getElementById("statToday").textContent = todayCount
                    document.getElementById("statPending").textContent = patients.length
                    document.getElementById("statAccepted").textContent = scheduledCount
                    document.getElementById("statCancelled").textContent = cancelledCount
                })
        })
        .catch(function () {
            document.getElementById("statToday").textContent = "0"
            document.getElementById("statPending").textContent = "0"
            document.getElementById("statAccepted").textContent = "0"
            document.getElementById("statCancelled").textContent = "0"
        })
}
