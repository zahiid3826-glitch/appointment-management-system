const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    addedbyuserid: String,
    timestart: Date,  // Change this to Date
    timeend: Date,    // Change this to Date
    doctorid: String,
    patientid: String,
    status: String
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
