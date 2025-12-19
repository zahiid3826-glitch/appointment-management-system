const mongoose = require("mongoose");
const Appointment = require("../../models/Appointment.schema");
const Availability = require("../../models/Doctoravailabilityltime.schema");


 // View Available Slots of Doctors
 
const getAvailableSlots = async (req, res) => {
    try {
      
      const { doctorid } = req.query; 
    
      let filter = {};
      if (doctorid) {
        filter = { doctorid: doctorid }; 
      }
      const availabilities = await Availability.find(filter);
      if (availabilities.length === 0) {
        return res.status(404).json({ message: "No available timeslots found." });
      }
    
     
      const availableSlots = availabilities.map((availability) => ({
        doctorId: availability.doctorid,
        slots: availability.days.map((day) => ({
          day: day.day,
          startTime: day.timestart,
          endTime: day.timeend,
        }))
      }));
    
      
      res.status(200).json({ availableSlots });
    } catch (error) {
      
      res.status(400).json({ error: error.message });
    }
  };
  
  
  // Book Appointment
  const requestAppointment = async (req, res) => {
    try {
        const { addedbyuserid, timestart, timeend, doctorid, patientid } = req.body;

        if (!addedbyuserid || !timestart || !timeend || !doctorid || !patientid) {
            throw new Error("All fields are required.");
        }

        const appointmentStart = new Date(timestart);
        const appointmentEnd = new Date(timeend);
        const appointmentDate = appointmentStart.toLocaleDateString("en-GB", { weekday: "long" });

        const availability = await Availability.findOne({ doctorid });
        if (!availability) throw new Error("Doctor's availability not set.");

        const dayAvailability = availability.days.find((day) => day.day === appointmentDate);
        if (!dayAvailability) throw new Error(`Doctor is not available on ${appointmentDate}.`);

        const [availStartHour, availStartMinute] = dayAvailability.timestart.split(":").map(Number);
        const [availEndHour, availEndMinute] = dayAvailability.timeend.split(":").map(Number);

        const availableStart = new Date(appointmentStart);
        availableStart.setHours(availStartHour, availStartMinute, 0, 0);

        const availableEnd = new Date(appointmentStart);
        availableEnd.setHours(availEndHour, availEndMinute, 0, 0);

        if (appointmentStart < availableStart || appointmentEnd > availableEnd || appointmentStart >= appointmentEnd) {
            throw new Error("Appointment time is outside of doctor's available hours.");
        }

        const overlappingAppointment = await Appointment.findOne({
            doctorid,
            status: "Scheduled",
            $or: [
                { timestart: { $lt: appointmentEnd }, timeend: { $gt: appointmentStart } }
            ]
        });

        if (overlappingAppointment) {
            throw new Error("The doctor already has an appointment at this time.");
        }

        const appointment = new Appointment({
            addedbyuserid,
            timestart: appointmentStart,
            timeend: appointmentEnd,
            doctorid,
            patientid,
            status: "Scheduled"
        });

        await appointment.save();

        res.status(201).json({ message: "Appointment scheduled successfully.", appointment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

  

// Cancel Appointment
 
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentid } = req.params;
        if (!appointmentid) {
            throw new Error("Appointment ID is required.");
        }

        
        if (!mongoose.Types.ObjectId.isValid(appointmentid)) {
            throw new Error("Invalid Appointment ID.");
        }

        // Find the appointment by appointmentid
        const appointment = await Appointment.findOne({ _id: appointmentid });

        // Check if the appointment was found
        if (!appointment) {
            throw new Error("Appointment not found.");
        }

        // Check if the appointment is already canceled
        if (appointment.status === "Canceled") {
            throw new Error("Appointment is already canceled.");
        }

        // Update status to Canceled
        appointment.status = "Canceled";
        await appointment.save();

        res.status(200).json({ message: "Appointment canceled successfully.", appointment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

  


// Reschedule Appointment
const requestRescheduleAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { newStartTime, newEndTime } = req.body;

       
        if (!newStartTime || !newEndTime) {
            return res.status(400).json({ error: "New start and end times are required." });
        }

        if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
            return res.status(400).json({ error: "Invalid Appointment ID." });
        }

        // Find the appointment by ID
        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found." });
        }

        if (appointment.status === "Canceled") {
            return res.status(400).json({ error: "Cannot reschedule a canceled appointment." });
        }

        const newStart = new Date(newStartTime);
        const newEnd = new Date(newEndTime);

        if (newStart >= newEnd) {
            return res.status(400).json({ error: "End time must be after start time." });
        }

        // Check doctor's availability for the given day
        const doctorAvailability = await Availability.findOne({ doctorid: appointment.doctorid });
        if (!doctorAvailability) {
            return res.status(400).json({ error: "Doctor's availability not set." });
        }

        const newDay = newStart.toLocaleDateString("en-GB", { weekday: "long" });
        const dayAvailability = doctorAvailability.days.find(day => day.day === newDay);

        if (!dayAvailability) {
            return res.status(400).json({ error: `Doctor is not available on ${newDay}.` });
        }

        // Convert availability times to Date objects for comparison
        const availableStart = new Date(newStart);
        const availableEnd = new Date(newStart);

        const [availStartHour, availStartMinute] = dayAvailability.timestart.split(":").map(Number);
        const [availEndHour, availEndMinute] = dayAvailability.timeend.split(":").map(Number);

        availableStart.setHours(availStartHour, availStartMinute, 0, 0);
        availableEnd.setHours(availEndHour, availEndMinute, 0, 0);

        if (newStart < availableStart || newEnd > availableEnd) {
            return res.status(400).json({ error: "The new time is outside of the doctor's available hours." });
        }

        // Check for overlapping appointments
        const overlappingAppointment = await Appointment.findOne({
            doctorid: appointment.doctorid,
            status: "Scheduled",
            _id: { $ne: appointment._id },
            timestart: { $lt: newEnd },
            timeend: { $gt: newStart },
        });

        if (overlappingAppointment) {
            return res.status(400).json({ error: "The doctor already has an appointment at this new time." });
        }

        // Update the appointment times and save
        appointment.timestart = newStart;
        appointment.timeend = newEnd;
        await appointment.save();

        res.status(200).json({ message: "Appointment rescheduled successfully.", appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

  
// View Appointment Details
const viewAppointmentDetails = async (req, res) => {
  try {
      const { appointmentid } = req.params;

      if (!appointmentid) {
          throw new Error("Appointment ID is required.");
      }

      if (!mongoose.Types.ObjectId.isValid(appointmentid)) {
          throw new Error("Invalid Appointment ID.");
      }

      const appointment = await Appointment.findById(appointmentid)
          .populate("doctorid", "name specialty") 
          .populate("patientid", "name");  

      if (!appointment) {
          return res.status(404).json({ error: "Appointment not found." });
      }

      res.status(200).json({
          appointmentDetails: {
              date: appointment.timestart.toDateString(),
              startTime: appointment.timestart.toTimeString(),
              endTime: appointment.timeend.toTimeString(),
              doctor: {
                  id: appointment.doctorid._id,
                  name: appointment.doctorid.name,
                  specialty: appointment.doctorid.specialty
              },
              patient: {
                  id: appointment.patientid._id,
                  name: appointment.patientid.name
              },
              status: appointment.status
          }
      });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};




module.exports = {
  getAvailableSlots,
  requestAppointment,
  cancelAppointment,
  requestRescheduleAppointment,
  viewAppointmentDetails,
};