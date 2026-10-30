var apptModal = document.getElementById("apptModal")
var apptSuccessModal = document.getElementById("apptSuccessModal")
var addApptBtn = document.getElementById("addApptBtn")
var saveApptBtn = document.getElementById("saveApptBtn")
var clearApptBtn = document.getElementById("clearApptBtn")
var appointmentDeleteTimers = {}

function formatApptDate(dateStr) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    var d = new Date(dateStr)
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
}

function formatApptTime(dateStr) {
    var d = new Date(dateStr)
    var hours = d.getHours()
    var minutes = d.getMinutes()
    var ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    if (hours === 0) hours = 12
    var minStr = minutes < 10 ? "0" + minutes : minutes
    return hours + ":" + minStr + " " + ampm
}

function loadAppointments() {
    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            var tbody = document.getElementById("apptTableBody")
            tbody.innerHTML = ""

            appointments.forEach(function (appt) {
                var patient = appt.patientId
                var fullName = ""
                var patientId = ""
                if (patient) {
                    var mid = patient.middleName ? " " + patient.middleName + " " : " "
                    fullName = patient.firstName + mid + patient.lastName
                    patientId = patient._id
                }

                var statusLower = (appt.status || "Scheduled").toLowerCase()

                var tr = document.createElement("tr")
                tr.innerHTML =
                    '<td>' + fullName + '</td>' +
                    '<td><div>' + formatApptDate(appt.appointmentDate) + '</div><div class="appt-time">' + formatApptTime(appt.appointmentDate) + '</div></td>' +
                    '<td>' + (appt.reason || "Consultation") + '</td>' +
                    '<td>' +
                        '<select data-id="' + appt._id + '" data-patient="' + patientId + '" data-date="' + appt.appointmentDate + '" data-reason="' + (appt.reason || "Consultation") + '" class="status-pill status-' + statusLower + ' status-select">' +
                            '<option value="Completed"' + (appt.status === "Completed" ? " selected" : "") + '>Completed</option>' +
                            '<option value="Scheduled"' + (appt.status === "Scheduled" ? " selected" : "") + '>Scheduled</option>' +
                            '<option value="Cancelled"' + (appt.status === "Cancelled" ? " selected" : "") + '>Cancelled</option>' +
                        '</select>' +
                    '</td>'
                tbody.appendChild(tr)
            })

            var emptyRows = 6 - appointments.length
            for (var i = 0; i < emptyRows && i < 6; i++) {
                var tr = document.createElement("tr")
                tr.innerHTML =
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>'
                tbody.appendChild(tr)
            }

            document.querySelectorAll(".status-select").forEach(function (sel) {
                sel.addEventListener("change", function () {
                    var id = sel.getAttribute("data-id")
                    var patientId = sel.getAttribute("data-patient")
                    var apptDate = sel.getAttribute("data-date")
                    var reason = sel.getAttribute("data-reason")
                    var newStatus = sel.value

                    sel.className = "status-pill status-" + newStatus.toLowerCase() + " status-select"

                    fetch("/appointments/" + id, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            patientId: patientId,
                            appointmentDate: apptDate,
                            reason: reason,
                            status: newStatus
                        })
                    })
                        .then(function (response) {
                            return response.json()
                        })
                        .then(function (data) {
                            if (typeof loadDashboard === "function") loadDashboard()
                        })

                    if (appointmentDeleteTimers[id]) {
                        clearInterval(appointmentDeleteTimers[id])
                        delete appointmentDeleteTimers[id]
                    }

                    var existingCountdown = sel.parentElement.querySelector(".countdown-text")
                    if (existingCountdown) {
                        existingCountdown.remove()
                    }

                    if (newStatus === "Completed" || newStatus === "Cancelled") {
                        var secondsLeft = 10
                        var countdown = document.createElement("div")
                        countdown.className = "countdown-text"
                        countdown.textContent = "Deleting in " + secondsLeft + "s"
                        sel.parentElement.appendChild(countdown)

                        appointmentDeleteTimers[id] = setInterval(function () {
                            secondsLeft = secondsLeft - 1
                            if (secondsLeft > 0) {
                                countdown.textContent = "Deleting in " + secondsLeft + "s"
                            } else {
                                clearInterval(appointmentDeleteTimers[id])
                                delete appointmentDeleteTimers[id]

                                fetch("/appointments/" + id, {
                                    method: "DELETE"
                                })
                                    .then(function (response) {
                                        return response.json()
                                    })
                                    .then(function (data) {
                                        loadAppointments()
                                        if (typeof loadDashboard === "function") loadDashboard()
                                    })
                            }
                        }, 1000)
                    }
                })
            })
        })
}

addApptBtn.addEventListener("click", function () {
    document.getElementById("apptDateTime").value = ""
    document.getElementById("apptReason").value = ""
    saveApptBtn.disabled = false
    saveApptBtn.classList.remove("btn-disabled")

    var hint = document.getElementById("apptTimeHint")
    if (hint) {
        hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
        hint.style.color = "#888888"
    }

    var now = new Date()
    var year = now.getFullYear()
    var month = String(now.getMonth() + 1).padStart(2, "0")
    var day = String(now.getDate()).padStart(2, "0")
    document.getElementById("apptDateTime").min = year + "-" + month + "-" + day + "T08:00"

    var select = document.getElementById("apptPatientSelect")
    select.innerHTML = '<option value="">Select patient</option>'

    fetch("/patients")
        .then(function (response) {
            return response.json()
        })
        .then(function (patients) {
            patients.forEach(function (p) {
                var option = document.createElement("option")
                option.value = p._id
                var mid = p.middleName ? " " + p.middleName + " " : " "
                option.textContent = p.firstName + mid + p.lastName
                select.appendChild(option)
            })
        })

    apptModal.classList.remove("hidden")
})

apptModal.addEventListener("click", function (e) {
    if (e.target === apptModal) {
        apptModal.classList.add("hidden")
    }
})

clearApptBtn.addEventListener("click", function () {
    document.getElementById("apptPatientSelect").value = ""
    document.getElementById("apptDateTime").value = ""
    document.getElementById("apptReason").value = ""
    saveApptBtn.disabled = false
    saveApptBtn.classList.remove("btn-disabled")
    var hint = document.getElementById("apptTimeHint")
    if (hint) {
        hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
        hint.style.color = "#888888"
    }
})

document.getElementById("apptDateTime").addEventListener("input", function () {
    var val = this.value
    var hint = document.getElementById("apptTimeHint")

    if (!val) {
        saveApptBtn.disabled = false
        saveApptBtn.classList.remove("btn-disabled")
        if (hint) {
            hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
            hint.style.color = "#888888"
        }
        return
    }

    var d = new Date(val)
    var dayOfWeek = d.getDay()
    var hours = d.getHours()
    var minutes = d.getMinutes()

    var isWeekend = (dayOfWeek === 0 || dayOfWeek === 6)
    var isOutsideHours = (hours < 8 || hours > 17 || (hours === 17 && minutes > 0))

    if (isWeekend || isOutsideHours) {
        saveApptBtn.disabled = true
        saveApptBtn.classList.add("btn-disabled")
        if (hint) {
            hint.textContent = "Appointments are only available between 8:00 AM and 5:00 PM (Mon - Fri)"
            hint.style.color = "#DC2626"
        }
    } else {
        saveApptBtn.disabled = false
        saveApptBtn.classList.remove("btn-disabled")
        if (hint) {
            hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
            hint.style.color = "#888888"
        }
    }
})

document.getElementById("apptDateTime").addEventListener("change", function () {
    var val = this.value
    var hint = document.getElementById("apptTimeHint")

    if (!val) return

    var d = new Date(val)
    var dayOfWeek = d.getDay()
    var hours = d.getHours()
    var minutes = d.getMinutes()

    var isWeekend = (dayOfWeek === 0 || dayOfWeek === 6)
    var isOutsideHours = (hours < 8 || hours > 17 || (hours === 17 && minutes > 0))

    if (isWeekend || isOutsideHours) {
        saveApptBtn.disabled = true
        saveApptBtn.classList.add("btn-disabled")
        if (hint) {
            hint.textContent = "Appointments are only available between 8:00 AM and 5:00 PM (Mon - Fri)"
            hint.style.color = "#DC2626"
        }
    } else {
        saveApptBtn.disabled = false
        saveApptBtn.classList.remove("btn-disabled")
        if (hint) {
            hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
            hint.style.color = "#888888"
        }
    }
})

saveApptBtn.addEventListener("click", function () {
    if (saveApptBtn.disabled) return

    var patientId = document.getElementById("apptPatientSelect").value
    var dateTime = document.getElementById("apptDateTime").value
    var reason = document.getElementById("apptReason").value.trim() || "Consultation"

    if (!patientId || !dateTime) {
        showAlert("Please select a patient and appointment date/time.")
        return
    }

    var selectedDate = new Date(dateTime)
    var day = selectedDate.getDay()
    var hours = selectedDate.getHours()
    var minutes = selectedDate.getMinutes()

    if (day === 0 || day === 6 || hours < 8 || hours > 17 || (hours === 17 && minutes > 0)) {
        saveApptBtn.disabled = true
        saveApptBtn.classList.add("btn-disabled")
        var hint = document.getElementById("apptTimeHint")
        if (hint) {
            hint.textContent = "Appointments are only available between 8:00 AM and 5:00 PM (Mon - Fri)"
            hint.style.color = "#DC2626"
        }
        return
    }

    fetch("/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            patientId: patientId,
            appointmentDate: new Date(dateTime).toISOString(),
            reason: reason
        })
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            apptModal.classList.add("hidden")
            apptSuccessModal.classList.remove("hidden")
            loadAppointments()
            if (typeof loadDashboard === "function") loadDashboard()
            setTimeout(function () {
                apptSuccessModal.classList.add("hidden")
            }, 2000)
        })
})

apptSuccessModal.addEventListener("click", function () {
    apptSuccessModal.classList.add("hidden")
})
