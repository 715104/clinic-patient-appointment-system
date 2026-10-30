var loginView = document.getElementById("loginView")
var appView = document.getElementById("appView")
var loginBtn = document.getElementById("loginBtn")
var loginError = document.getElementById("loginError")
var signOutBtn = document.getElementById("signOutBtn")

function showAlert(message) {
    var modal = document.getElementById("alertModal")
    var msg = document.getElementById("alertMessage")
    if (modal && msg) {
        msg.textContent = message
        modal.classList.remove("hidden")
    }
}

var alertModal = document.getElementById("alertModal")
var closeAlertBtn = document.getElementById("closeAlertBtn")

if (closeAlertBtn && alertModal) {
    closeAlertBtn.addEventListener("click", function () {
        alertModal.classList.add("hidden")
    })
    alertModal.addEventListener("click", function (e) {
        if (e.target === alertModal) {
            alertModal.classList.add("hidden")
        }
    })
}

function checkAuth() {
    if (localStorage.getItem("loggedIn") === "true") {
        loginView.classList.add("hidden")
        appView.classList.remove("hidden")
        appView.classList.add("flex")
        showPage("dashboard")
    } else {
        loginView.classList.remove("hidden")
        appView.classList.add("hidden")
        appView.classList.remove("flex")
    }
}

loginBtn.addEventListener("click", function () {
    var username = document.getElementById("loginUsername").value
    var password = document.getElementById("loginPassword").value

    if (username === "admin" && password === "12345678") {
        localStorage.setItem("loggedIn", "true")
        loginError.classList.add("hidden")
        checkAuth()
    } else {
        loginError.classList.remove("hidden")
    }
})

document.getElementById("loginPassword").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        loginBtn.click()
    }
})

var signOutModal = document.getElementById("signOutModal")
var cancelSignOutBtn = document.getElementById("cancelSignOutBtn")
var confirmSignOutBtn = document.getElementById("confirmSignOutBtn")

signOutBtn.addEventListener("click", function () {
    signOutModal.classList.remove("hidden")
})

cancelSignOutBtn.addEventListener("click", function () {
    signOutModal.classList.add("hidden")
})

signOutModal.addEventListener("click", function (e) {
    if (e.target === signOutModal) {
        signOutModal.classList.add("hidden")
    }
})

confirmSignOutBtn.addEventListener("click", function () {
    signOutModal.classList.add("hidden")
    localStorage.removeItem("loggedIn")
    document.getElementById("loginUsername").value = ""
    document.getElementById("loginPassword").value = ""
    checkAuth()
})

checkAuth()
