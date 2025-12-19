const express = require("express");
const router = express.Router();
const {
  getAvailableSlotsByDate,
  requestAppointment,
  getPatientAppointments,
  getAllPatientAppointments,
  cancelAppointment,
  requestRescheduleAppointment,
  viewAppointmentDetails,
} = require("../Controllers/Patient/patient");

router.get("/available-slots", getAvailableSlotsByDate);

router.post("/appointments", requestAppointment);

router.get("/appointments", getPatientAppointments);

router.get("/appointments/all", getAllPatientAppointments);

router.put("/:appointmentid/cancel", cancelAppointment);

router.put("/:appointment_id/reschedule", requestRescheduleAppointment);

router.get("/:appointmentid/details", viewAppointmentDetails);

module.exports = router;
