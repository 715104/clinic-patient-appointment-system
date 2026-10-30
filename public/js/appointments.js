let apptModal = document.getElementById("apptModal")
let apptSuccessModal = document.getElementById("apptSuccessModal")
let addApptBtn = document.getElementById("addApptBtn")
let saveApptBtn = document.getElementById("saveApptBtn")
let clearApptBtn = document.getElementById("clearApptBtn")

let allAppointments = []
let currentSortCol = null
let currentSortDir = "asc"

function formatApptDate(dateStr) {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    let d = new Date(dateStr)
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
}

function formatApptTime(dateStr) {
    let d = new Date(dateStr)
    let hours = d.getHours()
    let minutes = d.getMinutes()
    let ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    if (hours === 0) hours = 12
    let minStr = minutes < 10 ? "0" + minutes : minutes
    return hours + ":" + minStr + " " + ampm
}

function sortAppointments(list) {
    if (!currentSortCol) return list

    return list.slice().sort(function (a, b) {
        if (currentSortCol === "date") {
            let timeA = new Date(a.appointmentDate).getTime() || 0
            let timeB = new Date(b.appointmentDate).getTime() || 0
            return currentSortDir === "asc" ? timeA - timeB : timeB - timeA
        }

        if (currentSortCol === "status") {
            let valA = (a.status || "").toLowerCase()
            let valB = (b.status || "").toLowerCase()
            if (valA < valB) return currentSortDir === "asc" ? -1 : 1
            if (valA > valB) return currentSortDir === "asc" ? 1 : -1
            return 0
        }

        return 0
    })
}

function updateSortIndicators() {
    let cols = ["date", "status"]
    cols.forEach(function (col) {
        let iconEl = document.getElementById("sort-icon-" + col)
        if (iconEl) {
            if (currentSortCol === col) {
                iconEl.textContent = currentSortDir === "asc" ? " ▲" : " ▼"
                iconEl.style.opacity = "1"
            } else {
                iconEl.textContent = " ⇅"
                iconEl.style.opacity = "0.35"
            }
        }
    })
}

function renderAppointmentsTable() {
    let tbody = document.getElementById("apptTableBody")
    if (!tbody) return
    tbody.innerHTML = ""

    let sorted = sortAppointments(allAppointments)

    sorted.forEach(function (appt) {
        let patient = appt.patientId
        let fullName = ""
        let patientId = ""
        if (patient) {
            let mid = patient.middleName ? " " + patient.middleName + " " : " "
            fullName = patient.firstName + mid + patient.lastName
            patientId = patient._id
        }

        let statusLower = (appt.status || "Scheduled").toLowerCase()
        let apptTime = new Date(appt.appointmentDate).getTime()
        let nowTime = new Date().getTime()
        let canComplete = nowTime >= apptTime
        let isCancelled = appt.status === "Cancelled"

        let tr = document.createElement("tr")
        tr.innerHTML =
            '<td>' + fullName + '</td>' +
            '<td><div>' + formatApptDate(appt.appointmentDate) + '</div><div class="appt-time">' + formatApptTime(appt.appointmentDate) + '</div></td>' +
            '<td>' + (appt.reason || "Consultation") + '</td>' +
            '<td>' +
                '<select data-id="' + appt._id + '" data-patient="' + patientId + '" data-date="' + appt.appointmentDate + '" data-reason="' + (appt.reason || "Consultation") + '" data-prev-status="' + (appt.status || "Scheduled") + '" class="status-pill status-' + statusLower + ' status-select"' + (isCancelled ? " disabled" : "") + '>' +
                    '<option value="Completed"' + (appt.status === "Completed" ? " selected" : "") + (canComplete && !isCancelled ? "" : " disabled") + '>Completed</option>' +
                    '<option value="Scheduled"' + (appt.status === "Scheduled" ? " selected" : "") + (isCancelled ? " disabled" : "") + '>Scheduled</option>' +
                    '<option value="Cancelled"' + (appt.status === "Cancelled" ? " selected" : "") + '>Cancelled</option>' +
                '</select>' +
            '</td>'
        tbody.appendChild(tr)
    })

    let emptyRows = 6 - sorted.length
    for (let i = 0; i < emptyRows && i < 6; i++) {
        let tr = document.createElement("tr")
        tr.innerHTML =
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>'
        tbody.appendChild(tr)
    }

    document.querySelectorAll(".status-select").forEach(function (sel) {
        sel.addEventListener("change", function () {
            let id = sel.getAttribute("data-id")
            let patientId = sel.getAttribute("data-patient")
            let apptDate = sel.getAttribute("data-date")
            let reason = sel.getAttribute("data-reason")
            let prevStatus = sel.getAttribute("data-prev-status") || "Scheduled"
            let newStatus = sel.value

            let apptTime = new Date(apptDate).getTime()
            let nowTime = new Date().getTime()

            if (prevStatus === "Cancelled" && newStatus === "Scheduled") {
                sel.value = "Cancelled"
                sel.className = "status-pill status-cancelled status-select"
                if (typeof showAlert === "function") {
                    showAlert("Cancelled appointments cannot be put back to Scheduled. Please create a new appointment.")
                }
                return
            }

            if (newStatus === "Completed" && nowTime < apptTime) {
                sel.value = prevStatus
                sel.className = "status-pill status-" + prevStatus.toLowerCase() + " status-select"
                if (typeof showAlert === "function") {
                    showAlert("Appointments can only be marked as Completed during or after the appointment date.")
                }
                return
            }

            sel.setAttribute("data-prev-status", newStatus)
            sel.className = "status-pill status-" + newStatus.toLowerCase() + " status-select"

            if (newStatus === "Cancelled") {
                sel.disabled = true
            }

            for (let i = 0; i < allAppointments.length; i++) {
                if (allAppointments[i]._id === id) {
                    allAppointments[i].status = newStatus
                    break
                }
            }

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
        })
    })

    updateSortIndicators()
}

document.querySelectorAll(".appt-sort-th").forEach(function (th) {
    th.addEventListener("click", function () {
        let col = th.getAttribute("data-sort")
        if (currentSortCol === col) {
            currentSortDir = currentSortDir === "asc" ? "desc" : "asc"
        } else {
            currentSortCol = col
            currentSortDir = "asc"
        }
        renderAppointmentsTable()
    })
})

function loadAppointments() {
    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            allAppointments = appointments
            renderAppointmentsTable()
        })
}

addApptBtn.addEventListener("click", function () {
    document.getElementById("apptDateTime").value = ""
    document.getElementById("apptReason").value = ""
    saveApptBtn.disabled = false
    saveApptBtn.classList.remove("btn-disabled")

    let hint = document.getElementById("apptTimeHint")
    if (hint) {
        hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
        hint.style.color = "#888888"
    }

    let now = new Date()
    let year = now.getFullYear()
    let month = String(now.getMonth() + 1).padStart(2, "0")
    let day = String(now.getDate()).padStart(2, "0")
    document.getElementById("apptDateTime").min = year + "-" + month + "-" + day + "T08:00"

    let select = document.getElementById("apptPatientSelect")
    select.innerHTML = '<option value="">Select patient</option>'

    fetch("/patients")
        .then(function (response) {
            return response.json()
        })
        .then(function (patients) {
            patients.forEach(function (p) {
                let option = document.createElement("option")
                option.value = p._id
                let mid = p.middleName ? " " + p.middleName + " " : " "
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
    let hint = document.getElementById("apptTimeHint")
    if (hint) {
        hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
        hint.style.color = "#888888"
    }
})

document.getElementById("apptDateTime").addEventListener("input", function () {
    let val = this.value
    let hint = document.getElementById("apptTimeHint")

    if (!val) {
        saveApptBtn.disabled = false
        saveApptBtn.classList.remove("btn-disabled")
        if (hint) {
            hint.textContent = "Mon - Fri, 8:00 AM - 5:00 PM only"
            hint.style.color = "#888888"
        }
        return
    }

    let d = new Date(val)
    let dayOfWeek = d.getDay()
    let hours = d.getHours()
    let minutes = d.getMinutes()

    let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6)
    let isOutsideHours = (hours < 8 || hours > 17 || (hours === 17 && minutes > 0))

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
    let val = this.value
    let hint = document.getElementById("apptTimeHint")

    if (!val) return

    let d = new Date(val)
    let dayOfWeek = d.getDay()
    let hours = d.getHours()
    let minutes = d.getMinutes()

    let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6)
    let isOutsideHours = (hours < 8 || hours > 17 || (hours === 17 && minutes > 0))

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

    let patientId = document.getElementById("apptPatientSelect").value
    let dateTime = document.getElementById("apptDateTime").value
    let reason = document.getElementById("apptReason").value.trim() || "Consultation"

    if (!patientId || !dateTime) {
        showAlert("Please select a patient and appointment date/time.")
        return
    }

    let selectedDate = new Date(dateTime)
    let day = selectedDate.getDay()
    let hours = selectedDate.getHours()
    let minutes = selectedDate.getMinutes()

    if (day === 0 || day === 6 || hours < 8 || hours > 17 || (hours === 17 && minutes > 0)) {
        saveApptBtn.disabled = true
        saveApptBtn.classList.add("btn-disabled")
        let hint = document.getElementById("apptTimeHint")
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
