const mongoose = require("mongoose");
const Appointment = require("../../models/Appointment.schema");
const Availability = require("../../models/Doctoravailabilityltime.schema");


//1. Controller to Input Schedule by Doctor
exports.addDoctorAvailability = async (req, res) => {
    try {
      const { doctorId, days } = req.body;
      
      //Validate Input
      if (!doctorId || !days || !Array.isArray(days)) {
        throw new Error("Doctor ID and days array are required.");
      }

      //checking if schedule is already uploaded
      const findAvailability = await Availability.findOne({
        doctorid: doctorId,
      })

      if (findAvailability) {
        return res.status(200).json({
          message: "Availability is already added",
          findAvailability,
        });
      }
      
      // Store entire schedule
      const availability = new Availability({
        doctorid: doctorId,
        days,
      });
      
      await availability.save();
  
      res.status(201).json({
        message: "Doctor availability added successfully.",
        availability,
      });

    } catch (error) { //Error Handling
      res.status(400).json({ error: error.message });
    }
};

// 2. Rewrite entire Schedule 
exports.resetDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, days } = req.body;

    //Validate Input
    if (!doctorId || !days || !Array.isArray(days)) {
      throw new Error("Doctor ID and days array are required.");
    }

    const resetAvailability = await Availability.findOneAndUpdate(
      { doctorid: doctorId },
      { days },
      { new: true, overwrite: true }
    );

    if (!resetAvailability) { //Error handling is schedule isnt added
      throw new Error("Doctor's Schedule not found");
    }

    res.status(200).json({
      message: "Doctor's Schedule Updated Successfully",
      resetAvailability,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//3. Updates part of schedule --> time for one day
exports.updateDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, day, timestart, timeend } = req.body;

    //Validate Input
    if (!doctorId || !day || !timestart || !timeend) {
      throw new Error("Incomplete input provided");
    }

    //Update Schedule for particular day
    const updatedAvailability = await Availability.findOneAndUpdate(
      { doctorid: doctorId, "days.day": day },
      { $set: { "days.$.timestart": timestart, "days.$.timeend": timeend } },
      { new: true }
    );

    if (!updatedAvailability) { //Error handling is schedule isnt added
      throw new Error("Doctor's Schedule not found");
    }

    res.status(200).json({
      message: "Doctor's Schedule Updated Successfully",
      updatedAvailability,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//4. Doctor Views Their own schedule
exports.viewDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.query; //replace with JWT user id later

    if (!doctorId) {
      throw new Error("Doctor ID is required.");
    }

    const availability = await Availability.findOne({ doctorid: doctorId});

    if (!availability) {
      throw new Error("Doctor's Schedule not found");
    }

    res.status(200).json({
      availability
    });

  } catch (error){
    res.status(400).json({ error: error.message });
  }
}

//5. Get appointment between particular dates
exports.getAppointments = async (req, res) => {
  try {
    const { startdate, enddate, doctorId } = req.query;
    if (!doctorId) {
      throw new Error("Doctor ID is required.");
    }

    let start, end;
    
    if (!startdate || !enddate) {
      const today = new Date();
      start = new Date(today);
      start.setHours(0, 0, 0, 0); 

      end = new Date(today);
      end.setHours(23, 59, 59, 999);
    }
    else {
      start = new Date(startdate);
      start.setHours(0, 0, 0, 0);

      end = new Date(enddate);
      end.setHours(23, 59, 59, 999);
    }

  
    const appointments = await Appointment.find({
      doctorid: doctorId,
      timestart: { $gte: start, $lte: end }, 
    });

    if (!appointments) {
      res.status(200).json({ message: "No appointments found for the specified date range"})
    }

    console.log({ start, end, doctorId, appointments });
    console.log( { startdate, enddate})

    res.status(200).json({
      message: "Appointment for particular date range",
      appointments 
    });

  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

//6. Get particular appointment details
exports.getAppointmentDetail = async (req, res) => {
  try {
    const {doctorId} = req.body; //replace with JWT user id later
    const {appointmentid} = req.params;

    if (!appointmentid) {
      throw new Error("Appointment ID is required.");
    }

    if (!doctorId) {
      throw new Error("Doctor ID is required.");
    }

    const appointment = await Appointment.findOne({
      doctorid: appointmentid,
      doctorid: doctorId,
    });

    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    res.status(200).json({ appointment });

  } catch(err) {
    res.status(400).json({ error: err.message })
  }
}

// 9. See particular patient's appointment history
exports.seePatientAppointmentHistory = async(req, res) => {
  try {
    const {doctorId} = req.body;
    const {patientId} = req.params;

    const patientAppointments = await Appointment.find({
      doctorid: doctorId,
      patientid: patientId
    })

    if (!patientAppointments) {
      throw new Error("Patient Appointments not found.");
    }

    res.status(200).json({ patientAppointments });

  } catch(err) {
    res.status(400).json({ error: err.message })
  }
}

//--> I dontthink the doctor should have this functionality
//8. Set an appointment as no show
//7. Cancel appointments between particular date and time range