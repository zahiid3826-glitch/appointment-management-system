// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const {bookAppointment,markAsDoneAppointment,availableslots,getSlotsofDoctor,getDoctorsBySlotAvailability,getAppointmentDetails,addDoctorAvailability,cancelAppointment,rescheduleAppointment,getTodaysAppointments,getDoctorAppointments,getAppointmentsInDateRange,getAllAppointments} = require("../Controllers/Receptionist/receptionist");

// Booking an appointment
router.post("/book", bookAppointment);
// Canceling an appointment
router.delete("/cancel/:appointmentid", cancelAppointment);
// Rescheduling an appointment
router.put("/reschedule/:appointmentid", rescheduleAppointment);
// Get today's appointments
router.get("/today", getTodaysAppointments);
// Get appointments of a specific doctor
router.get("/doctor/:doctorid", getDoctorAppointments);
// Get appointments within a date range
router.get("/range", getAppointmentsInDateRange);
// Get all appointments
router.get("/", getAllAppointments);
// Get all appointments
router.post("/add", addDoctorAvailability); // this is mock route just to populate the data to test other functions
// Get appointment detail
router.get("/:appointmentid", getAppointmentDetails);  // still the patient and doctor info get from their profile part is not done
// Get appointment detail
router.post("/getdoctorsbyslotavailability", getDoctorsBySlotAvailability);  // still the patient and doctor info get from their profile part is not done

router.post("/getslotsofdoctor", getSlotsofDoctor); 

router.post("/availableslots", availableslots);  // still the patient and doctor info get from their profile part is not done

router.post("/markAsDoneAppointment/:appointmentid", markAsDoneAppointment); 

module.exports = router;
