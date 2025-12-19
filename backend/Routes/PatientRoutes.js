const express = require("express");
const router = express.Router();
const {
  getAvailableSlots,
  requestAppointment,
  cancelAppointment,
  requestRescheduleAppointment,
  viewAppointmentDetails,
} = require("../Controllers/Patient/patient");

// View Available Slots of Doctors
router.get("/available", getAvailableSlots);

// Book Appointment
router.post("/request", requestAppointment);

// Cancel Appointment
router.delete("/:appointmentid/cancel", cancelAppointment);

// Request for reschedule appointment
router.put("/:appointment_id/reschedule", requestRescheduleAppointment);

// View Appointment Details
router.get("/:appointmentid/details", viewAppointmentDetails);


module.exports = router;
