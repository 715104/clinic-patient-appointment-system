const mongoose= require("mongoose");

const appointmentSchema= mongoose.Schema({
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true},
    appointmentDate: {type: Date, required: true},
    reason: {type: String, required: true},
    status: {type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled"}
})

const Appointment= mongoose.model("Appointment", appointmentSchema);

module.exports= Appointment;