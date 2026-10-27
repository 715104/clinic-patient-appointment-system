
const Patient = require("../models/Patient");

const createPatient = async (req, res) => {
    try {
        const patient = new Patient({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            sex: req.body.sex,
            phone: req.body.phone
        });

        await patient.save();

        res.status(201).json({
            message: "Patient registered successfully.",
            patient: patient
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to register patient."
        });
    }
};


const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find();

        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve patients."
        });
    }
};


module.exports = { createPatient, getPatients };
