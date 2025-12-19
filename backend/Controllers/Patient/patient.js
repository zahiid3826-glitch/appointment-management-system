const mongoose = require("mongoose");
const Appointment = require("../../models/Appointment.schema");
const Availability = require("../../models/Doctoravailabilityltime.schema");

const getTimeSlots = (startTime, endTime, interval = 30) => {
  const slots = [];
  let current = new Date(startTime);
  const end = new Date(endTime);

  while (current < end) {
    const slotStart = new Date(current);
    current.setMinutes(current.getMinutes() + interval);
    const slotEnd = new Date(current);

    if (slotEnd <= end) {
      slots.push({ start: slotStart, end: slotEnd });
    }
  }

  return slots;
};

const getAvailableSlotsByDate = async (req, res) => {
  try {
    const { date, doctorid } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required." });
    }

    let filter = {};
    if (doctorid) {
      filter = { doctorid: doctorid };
    }

    const availabilities = await Availability.find(filter);

    if (availabilities.length === 0) {
      return res.status(404).json({ message: "No doctors found with availability." });
    }

    const dayName = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const results = [];

    for (const availability of availabilities) {
      const { doctorid, days } = availability;

      const dayAvailability = days.find((day) => day.day === dayName);

      if (!dayAvailability) {
        continue;
      }

      const dayStartTime = new Date(`${date}T${dayAvailability.timestart}`);
      const dayEndTime = new Date(`${date}T${dayAvailability.timeend}`);
      const allSlots = getTimeSlots(dayStartTime, dayEndTime);

      const appointments = await Appointment.find({
        doctorid,
        timestart: { $gte: dayStartTime, $lt: dayEndTime },
        status: { $in: ["Scheduled"] }
      });

      const bookedSlots = appointments.map((appt) => ({
        start: new Date(appt.timestart),
        end: new Date(appt.timeend),
      }));

      const availableSlots = allSlots.filter((slot) => {
        return !bookedSlots.some(
          (booked) =>
            (slot.start >= booked.start && slot.start < booked.end) ||
            (slot.end > booked.start && slot.end <= booked.end) ||
            (slot.start <= booked.start && slot.end >= booked.end)
        );
      });

      if (availableSlots.length > 0) {
        results.push({
          doctorid,
          availableSlots,
        });
      }
    }

    res.json({ doctors: results });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const requestAppointment = async (req, res) => {
  try {
    const { timestart, timeend, doctorid, patientid } = req.body;

    if (!timestart || !timeend || !doctorid || !patientid) {
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
      addedbyuserid: patientid,
      timestart: appointmentStart,
      timeend: appointmentEnd,
      doctorid,
      patientid,
      status: "Scheduled"
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment request accepted successfully.",
      status: "accepted",
      appointment
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: "rejected"
    });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const { patientid } = req.query;

    if (!patientid) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    const now = new Date();

    const appointments = await Appointment.find({
      patientid,
      timestart: { $gte: now },
      status: "Scheduled"
    }).sort({ timestart: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllPatientAppointments = async (req, res) => {
  try {
    const { patientid } = req.query;

    if (!patientid) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    const appointments = await Appointment.find({
      patientid
    }).sort({ timestart: -1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentid } = req.params;
    const { patientid } = req.body;

    if (!appointmentid) {
      throw new Error("Appointment ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentid)) {
      throw new Error("Invalid Appointment ID.");
    }

    const appointment = await Appointment.findOne({ _id: appointmentid });

    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    if (appointment.patientid !== patientid) {
      throw new Error("Unauthorized: You can only cancel your own appointments.");
    }

    if (appointment.status === "Canceled") {
      throw new Error("Appointment is already canceled.");
    }

    appointment.status = "Canceled";
    await appointment.save();

    res.status(200).json({
      message: "Appointment cancellation request accepted.",
      status: "confirmed",
      appointment
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: "rejected"
    });
  }
};

const requestRescheduleAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { newStartTime, newEndTime, patientid } = req.body;

    if (!newStartTime || !newEndTime) {
      return res.status(400).json({ error: "New start and end times are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      return res.status(400).json({ error: "Invalid Appointment ID." });
    }

    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    if (appointment.patientid !== patientid) {
      return res.status(403).json({ error: "Unauthorized: You can only reschedule your own appointments." });
    }

    if (appointment.status === "Canceled") {
      return res.status(400).json({ error: "Cannot reschedule a canceled appointment." });
    }

    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);

    if (newStart >= newEnd) {
      return res.status(400).json({ error: "End time must be after start time." });
    }

    const doctorAvailability = await Availability.findOne({ doctorid: appointment.doctorid });
    if (!doctorAvailability) {
      return res.status(400).json({ error: "Doctor's availability not set." });
    }

    const newDay = newStart.toLocaleDateString("en-GB", { weekday: "long" });
    const dayAvailability = doctorAvailability.days.find(day => day.day === newDay);

    if (!dayAvailability) {
      return res.status(400).json({ error: `Doctor is not available on ${newDay}.` });
    }

    const availableStart = new Date(newStart);
    const availableEnd = new Date(newStart);

    const [availStartHour, availStartMinute] = dayAvailability.timestart.split(":").map(Number);
    const [availEndHour, availEndMinute] = dayAvailability.timeend.split(":").map(Number);

    availableStart.setHours(availStartHour, availStartMinute, 0, 0);
    availableEnd.setHours(availEndHour, availEndMinute, 0, 0);

    if (newStart < availableStart || newEnd > availableEnd) {
      return res.status(400).json({ error: "The new time is outside of the doctor's available hours." });
    }

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

    appointment.timestart = newStart;
    appointment.timeend = newEnd;
    await appointment.save();

    res.status(200).json({
      message: "Appointment rescheduling request accepted.",
      status: "confirmed",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: "rejected"
    });
  }
};

const viewAppointmentDetails = async (req, res) => {
  try {
    const { appointmentid } = req.params;
    const { patientid } = req.query;

    if (!appointmentid) {
      throw new Error("Appointment ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentid)) {
      throw new Error("Invalid Appointment ID.");
    }

    const appointment = await Appointment.findById(appointmentid);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    if (appointment.patientid !== patientid) {
      return res.status(403).json({ error: "Unauthorized: You can only view your own appointments." });
    }

    res.status(200).json({
      appointment: {
        id: appointment._id,
        date: appointment.timestart.toDateString(),
        startTime: appointment.timestart.toISOString(),
        endTime: appointment.timeend.toISOString(),
        doctorId: appointment.doctorid,
        patientId: appointment.patientid,
        status: appointment.status
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAvailableSlotsByDate,
  requestAppointment,
  getPatientAppointments,
  getAllPatientAppointments,
  cancelAppointment,
  requestRescheduleAppointment,
  viewAppointmentDetails,
};
