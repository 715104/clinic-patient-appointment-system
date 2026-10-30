var patientModal = document.getElementById("patientModal")
var editPatientModal = document.getElementById("editPatientModal")
var patientSuccessModal = document.getElementById("patientSuccessModal")
var patientSuccessText = document.getElementById("patientSuccessText")
var addPatientBtn = document.getElementById("addPatientBtn")
var submitPatientBtn = document.getElementById("submitPatientBtn")
var cancelEditPatientBtn = document.getElementById("cancelEditPatientBtn")
var submitEditPatientBtn = document.getElementById("submitEditPatientBtn")

var confirmDeleteModal = document.getElementById("confirmDeleteModal")
var cancelDeletePatientBtn = document.getElementById("cancelDeletePatientBtn")
var confirmDeletePatientBtn = document.getElementById("confirmDeletePatientBtn")
var selectedPatientIdToDelete = null

var allPatientsData = []

function loadPatients() {
    fetch("/patients")
        .then(function (response) {
            return response.json()
        })
        .then(function (patients) {
            allPatientsData = patients
            var tbody = document.getElementById("patientTableBody")
            tbody.innerHTML = ""

            patients.forEach(function (p) {
                var tr = document.createElement("tr")
                tr.innerHTML =
                    '<td>' + (p.firstName || "") + '</td>' +
                    '<td>' + (p.middleName || "") + '</td>' +
                    '<td>' + (p.lastName || "") + '</td>' +
                    '<td>' + (p.phone || "") + '</td>' +
                    '<td>' + (p.age || "") + '</td>' +
                    '<td>' + (p.sex || "") + '</td>' +
                    '<td>' +
                        '<div class="action-cell">' +
                            '<button class="btn-action-edit" data-id="' + p._id + '" title="Edit">' +
                                '<img src="assets/icons/edit.svg" alt="Edit" class="action-svg">' +
                            '</button>' +
                            '<button class="btn-action-delete" data-id="' + p._id + '" title="Delete">' +
                                '<img src="assets/icons/trash.svg" alt="Delete" class="action-svg">' +
                            '</button>' +
                        '</div>' +
                    '</td>'
                tbody.appendChild(tr)
            })

            var emptyRows = 6 - patients.length
            for (var i = 0; i < emptyRows && i < 6; i++) {
                var tr = document.createElement("tr")
                tr.innerHTML =
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>'
                tbody.appendChild(tr)
            }

            document.querySelectorAll(".btn-action-edit").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    var id = btn.getAttribute("data-id")
                    var patient = allPatientsData.find(function (item) {
                        return item._id === id
                    })
                    if (patient) {
                        document.getElementById("editPatientId").value = patient._id
                        document.getElementById("editFirstName").value = patient.firstName || ""
                        document.getElementById("editMiddleName").value = patient.middleName || ""
                        document.getElementById("editLastName").value = patient.lastName || ""
                        document.getElementById("editPhone").value = patient.phone || ""
                        document.getElementById("editAge").value = patient.age || ""
                        document.getElementById("editGender").value = patient.sex || ""
                        editPatientModal.classList.remove("hidden")
                    }
                })
            })

            document.querySelectorAll(".btn-action-delete").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    selectedPatientIdToDelete = btn.getAttribute("data-id")
                    confirmDeleteModal.classList.remove("hidden")
                })
            })
        })
}

cancelDeletePatientBtn.addEventListener("click", function () {
    selectedPatientIdToDelete = null
    confirmDeleteModal.classList.add("hidden")
})

confirmDeleteModal.addEventListener("click", function (e) {
    if (e.target === confirmDeleteModal) {
        selectedPatientIdToDelete = null
        confirmDeleteModal.classList.add("hidden")
    }
})

confirmDeletePatientBtn.addEventListener("click", function () {
    if (!selectedPatientIdToDelete) return
    var id = selectedPatientIdToDelete
    confirmDeleteModal.classList.add("hidden")
    selectedPatientIdToDelete = null

    fetch("/patients/" + id, {
        method: "DELETE"
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            if (patientSuccessText) patientSuccessText.textContent = "Deleted Successfully!"
            patientSuccessModal.classList.remove("hidden")
            loadPatients()
            if (typeof loadAppointments === "function") loadAppointments()
            if (typeof loadDashboard === "function") loadDashboard()
            setTimeout(function () {
                patientSuccessModal.classList.add("hidden")
            }, 2000)
        })
        .catch(function () {
            showAlert("Failed to delete patient.")
        })
})

addPatientBtn.addEventListener("click", function () {
    document.getElementById("pFirstName").value = ""
    document.getElementById("pMiddleName").value = ""
    document.getElementById("pLastName").value = ""
    document.getElementById("pPhone").value = ""
    document.getElementById("pAge").value = ""
    document.getElementById("pGender").value = ""
    patientModal.classList.remove("hidden")
})

patientModal.addEventListener("click", function (e) {
    if (e.target === patientModal) {
        patientModal.classList.add("hidden")
    }
})

cancelEditPatientBtn.addEventListener("click", function () {
    editPatientModal.classList.add("hidden")
})

editPatientModal.addEventListener("click", function (e) {
    if (e.target === editPatientModal) {
        editPatientModal.classList.add("hidden")
    }
})

submitPatientBtn.addEventListener("click", function () {
    var first = document.getElementById("pFirstName").value.trim()
    var middle = document.getElementById("pMiddleName").value.trim()
    var last = document.getElementById("pLastName").value.trim()
    var phone = document.getElementById("pPhone").value.trim()
    var age = document.getElementById("pAge").value.trim()
    var gender = document.getElementById("pGender").value

    if (!first || !middle || !last || !phone || !age || !gender) {
        showAlert("Please fill in all required fields.")
        return
    }

    fetch("/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: first,
            middleName: middle,
            lastName: last,
            age: parseInt(age),
            sex: gender,
            phone: phone
        })
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            patientModal.classList.add("hidden")
            if (patientSuccessText) patientSuccessText.textContent = "Added Successfully!"
            patientSuccessModal.classList.remove("hidden")
            loadPatients()
            setTimeout(function () {
                patientSuccessModal.classList.add("hidden")
            }, 2000)
        })
})

submitEditPatientBtn.addEventListener("click", function () {
    var id = document.getElementById("editPatientId").value
    var first = document.getElementById("editFirstName").value.trim()
    var middle = document.getElementById("editMiddleName").value.trim()
    var last = document.getElementById("editLastName").value.trim()
    var phone = document.getElementById("editPhone").value.trim()
    var age = document.getElementById("editAge").value.trim()
    var gender = document.getElementById("editGender").value

    if (!first || !middle || !last || !phone || !age || !gender) {
        showAlert("Please fill in all required fields.")
        return
    }

    fetch("/patients/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: first,
            middleName: middle,
            lastName: last,
            age: parseInt(age),
            sex: gender,
            phone: phone
        })
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            editPatientModal.classList.add("hidden")
            if (patientSuccessText) patientSuccessText.textContent = "Updated Successfully!"
            patientSuccessModal.classList.remove("hidden")
            loadPatients()
            if (typeof loadAppointments === "function") loadAppointments()
            setTimeout(function () {
                patientSuccessModal.classList.add("hidden")
            }, 2000)
        })
})

patientSuccessModal.addEventListener("click", function () {
    patientSuccessModal.classList.add("hidden")
})
