const doctor = require("../Controllers/Doctor/doctor")
const express = require("express");
const { AuthenticateUser } = require("../utils");

const router = express.Router();

router.post("/addschedule", doctor.addDoctorAvailability); // Add Doctor's Schedule//

router.put("/resetschedule", doctor.resetDoctorAvailability); // Resets Entire Schedule//

router.patch("/updateschedule", doctor.updateDoctorAvailability); // Update Doctor's Schedule

router.get("/getschedule", doctor.viewDoctorSchedule); //get doctor's schedule//

router.get("/getappointments", doctor.getAppointments);//getting appointments between a particular date range//

router.get("/getappointmentdetail", doctor.getAppointmentDetail); //getting one particular appointment's detail//

router.get("/getpatientappointment", doctor.seePatientAppointmentHistory);//gets patient appointment history

module.exports = router;
