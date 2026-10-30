const Appointment= require("../models/Appointment");
const Patient= require("../models/Patient");

const createAppointment= async (req, res) => {
    try{
        const { patientId, appointmentDate, reason }= req.body;

        const patient= await Patient.findById(patientId);

        if(!patient){
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        const appointment= new Appointment({
            patientId: patientId,
            appointmentDate: appointmentDate,
            reason: reason
        });

        await appointment.save();

        res.status(201).json({
            message: "Appointment created successfully.",
            appointment: appointment
        });
    
    }catch (err){
        res.status(500).json({
            message: "Failed to create appointment."
        });
    }
}

const getAppointments= async (req, res) => {
    try{
        const appointments= await Appointment.find()
            .populate("patientId");

        res.status(200).json(appointments);
    }catch (err){
        res.status(500).json({
            message: "Failed to retrieve appointments."
        })
    }
}

const getAppointmentById= async (req, res) =>{
    try{
        const appointment= await Appointment.findById(req.params.id)
            .populate("patientId");

        if(!appointment){
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        res.status(200).json(appointment);
    
    }catch (err){
        return res.status(500).json({
            message: "Failed to retrieve appointment."
        });
    }
}

const updateAppointment= async (req, res) => {
    try{
        const { patientId, appointmentDate, reason, status }= req.body

        const existing = await Appointment.findById(req.params.id);
        if(!existing){
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        if(existing.status === "Cancelled" && status === "Scheduled"){
            return res.status(400).json({
                message: "Cancelled appointments cannot be put back to Scheduled."
            });
        }

        const appointment= await Appointment.findByIdAndUpdate(req.params.id,
            {
                patientId: patientId,
                appointmentDate: appointmentDate,
                reason: reason,
                status: status
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if(!appointment){
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        res.status(200).json({
            message: "Appointment updated successfully.",
            appointment: appointment
        });

    }catch (err){
        res.status(500).json({
            message: "Failed to update appointment."
        });
    }
};

const deleteAppointment= async (req, res) => {
    try{
        const appointment= await Appointment.findByIdAndDelete(req.params.id);

        if(!appointment){
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        res.status(200).json({
            message: "Appointment deleted successfully."
        });
    
    }catch (err){
        res.status(500).json({
            message: "Failed to delete appointment."
        });
    }
};


module.exports= { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };