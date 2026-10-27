const patientRoutes = require("../routes/patientRoutes");

const express= require("express");
const mongoose= require("mongoose");

const app= express();

app.use(express.json());
app.use(express.static("public"));
app.use("/patients", patientRoutes);


mongoose.connect("mongodb://localhost:27017/clinic")
    .then(() => {
            console.log("Mongoose connected...")

            app.listen(3000, () => {
                console.log("Server is running...")
            })
    })

    .catch ((err) => {
        error: err.message;
    })
app.listen(3000, (req, res) => {
    console.log("Server is running...")
})



