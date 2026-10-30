function loadDashboard() {
    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            let today = new Date()
            let todayYear = today.getFullYear()
            let todayMonth = String(today.getMonth() + 1).padStart(2, "0")
            let todayDate = String(today.getDate()).padStart(2, "0")
            let todayStr = todayYear + "-" + todayMonth + "-" + todayDate

            let todayCount = 0
            let scheduledCount = 0
            let completedCount = 0
            let cancelledCount = 0

            appointments.forEach(function (appt) {
                let d = new Date(appt.appointmentDate)
                let y = d.getFullYear()
                let m = String(d.getMonth() + 1).padStart(2, "0")
                let day = String(d.getDate()).padStart(2, "0")
                let apptDateStr = y + "-" + m + "-" + day

                if (apptDateStr === todayStr) {
                    todayCount++
                }
                if (appt.status === "Scheduled") {
                    scheduledCount++
                }
                if (appt.status === "Completed") {
                    completedCount++
                }
                if (appt.status === "Cancelled") {
                    cancelledCount++
                }
            })

            let elToday = document.getElementById("statToday")
            let elScheduled = document.getElementById("statScheduled") || document.getElementById("statPending")
            let elCompleted = document.getElementById("statCompleted") || document.getElementById("statAccepted")
            let elCancelled = document.getElementById("statCancelled")

            if (elToday) {
                elToday.textContent = todayCount
            }
            if (elScheduled) {
                elScheduled.textContent = scheduledCount
            }
            if (elCompleted) {
                elCompleted.textContent = completedCount
            }
            if (elCancelled) {
                elCancelled.textContent = cancelledCount
            }
        })
        .catch(function () {
            let elToday = document.getElementById("statToday")
            let elScheduled = document.getElementById("statScheduled") || document.getElementById("statPending")
            let elCompleted = document.getElementById("statCompleted") || document.getElementById("statAccepted")
            let elCancelled = document.getElementById("statCancelled")

            if (elToday) {
                elToday.textContent = "0"
            }
            if (elScheduled) {
                elScheduled.textContent = "0"
            }
            if (elCompleted) {
                elCompleted.textContent = "0"
            }
            if (elCancelled) {
                elCancelled.textContent = "0"
            }
        })
}
