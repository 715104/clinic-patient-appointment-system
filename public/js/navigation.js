var navButtons = document.querySelectorAll(".nav-btn")
var pages = document.querySelectorAll(".page")
var searchBarWrapper = document.getElementById("searchBarWrapper")
var searchInput = document.getElementById("searchInput")
var sidebar = document.getElementById("sidebar")
var mainContent = document.getElementById("mainContent")
var sidebarBrand = document.getElementById("sidebarBrand")

if (sidebarBrand) {
    sidebarBrand.addEventListener("click", function () {
        sidebar.classList.toggle("collapsed")
        mainContent.classList.toggle("expanded")
    })
}

function getFormattedDate() {
    var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"]
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    var now = new Date()
    return days[now.getDay()] + ", " + months[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear()
}

function showPage(pageName) {
    pages.forEach(function (p) {
        p.classList.add("hidden")
    })

    navButtons.forEach(function (btn) {
        btn.classList.remove("active")
    })

    var activePage = document.getElementById(pageName + "Page")
    if (activePage) {
        activePage.classList.remove("hidden")
    }

    navButtons.forEach(function (btn) {
        if (btn.getAttribute("data-page") === pageName) {
            btn.classList.add("active")
        }
    })

    if (pageName === "dashboard") {
        loadDashboard()
    }

    if (pageName === "patients") {
        searchInput.placeholder = "Search patients"
        loadPatients()
    }

    if (pageName === "appointments") {
        searchInput.placeholder = "Search patients"
        loadAppointments()
    }

    var dateStr = getFormattedDate()
    var dashDate = document.getElementById("dashDate")
    var patientDate = document.getElementById("patientDate")
    var apptDate = document.getElementById("apptDate")
    if (dashDate) dashDate.textContent = dateStr
    if (patientDate) patientDate.textContent = dateStr
    if (apptDate) apptDate.textContent = dateStr
}

navButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        showPage(btn.getAttribute("data-page"))
    })
})

searchInput.addEventListener("input", function () {
    var query = searchInput.value.toLowerCase()
    var dashboardPage = document.getElementById("dashboardPage")
    var patientsPage = document.getElementById("patientsPage")
    var appointmentsPage = document.getElementById("appointmentsPage")

    if (dashboardPage && !dashboardPage.classList.contains("hidden")) {
        if (query.trim().length > 0) {
            showPage("patients")
        }
    }

    if (!patientsPage.classList.contains("hidden")) {
        var rows = document.querySelectorAll("#patientTableBody tr")
        rows.forEach(function (row) {
            var text = row.textContent.toLowerCase()
            row.style.display = text.includes(query) ? "" : "none"
        })
    }

    if (!appointmentsPage.classList.contains("hidden")) {
        var rows = document.querySelectorAll("#apptTableBody tr")
        rows.forEach(function (row) {
            var text = row.textContent.toLowerCase()
            row.style.display = text.includes(query) ? "" : "none"
        })
    }
})
