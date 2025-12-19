// controllers/appointmentController.js
const mongoose = require("mongoose");
const Appointment = require("../../models/Appointment.schema");
const Availability = require("../../models/Doctoravailabilityltime.schema");

/**
 * Book an Appointment
 */
function formatDateToISOWithoutTimezone(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
const bookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      addedbyuserid,
      timestart,
      timeend,
      doctorid,
      patientid,
    } = req.body;

  

    // Validate required fields
    if (!addedbyuserid || !timestart || !timeend || !doctorid || !patientid) {
      throw new Error("All fields are required.");
    }

    // Parse the provided timestart and timeend as Date objects
    const appointmentStart = new Date(timestart);
    const appointmentEnd = new Date(timeend);

    // Validate that parsed dates are valid
    if (isNaN(appointmentStart.getTime()) || isNaN(appointmentEnd.getTime())) {
      throw new Error("Invalid date format.");
    }

    // Format timestart and timeend to `YYYY-MM-DDTHH:mm:ss` without the time zone
    const formattedStart = formatDateToISOWithoutTimezone(appointmentStart);
    const formattedEnd = formatDateToISOWithoutTimezone(appointmentEnd);

    // Extract the day of the week from timestart in Pakistan Standard Time (PST)
    const appointmentDay = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
    }).format(appointmentStart);

    // Find doctor's availability
    const availability = await Availability.findOne({ doctorid }).session(session);
    if (!availability) {
      throw new Error("Doctor's availability not set.");
    }

    // Check if the doctor is available on the specified day
    const dayAvailability = availability.days.find(
      (day) => day.day === appointmentDay
    );

    if (!dayAvailability) {
      throw new Error(`Doctor is not available on ${appointmentDay}.`);
    }
 
    // Check if the appointment time is within the doctor's available time
    const [availStartHour, availStartMinute] = dayAvailability.timestart.split(':').map(Number);
    const [availEndHour, availEndMinute] = dayAvailability.timeend.split(':').map(Number);

    const availableStart = new Date(appointmentStart);
    availableStart.setHours(availStartHour, availStartMinute, 0, 0);

    const availableEnd = new Date(appointmentStart);
    availableEnd.setHours(availEndHour, availEndMinute, 0, 0);

    if (
      appointmentStart < availableStart ||
      appointmentEnd > availableEnd ||
      appointmentStart >= appointmentEnd
    ) {
      throw new Error("Appointment time is outside of the doctor's available hours.");
    }
console.log(appointmentEnd,appointmentStart)
    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({
      doctorid,
      status: "Scheduled",
      timestart:appointmentStart,
      timeend:appointmentEnd
      // $or: [
      //   // Check if the new appointment starts before an existing one ends
      //   {
      //     timestart: { $lt: appointmentEnd },
      //     timeend: { $gt: appointmentStart },
      //   },
      //   // Check if the new appointment ends after an existing one starts
      //   {
      //     timestart: { $gte: appointmentStart },
      //     timeend: { $lte: appointmentEnd },
      //   },
      //   // Check if the appointment starts during an existing one
      //   {
      //     timestart: { $gte: appointmentStart },
      //     timeend: { $gte: appointmentEnd },
      //   },
      //   // Check if the appointment ends during an existing one
      //   {
      //     timestart: { $lte: appointmentStart },
      //     timeend: { $lte: appointmentEnd },
      //   }
      // ],
    }).session(session);

    if (overlappingAppointment) {
      throw new Error("The doctor already has an appointment at this time.");
    }
    console.log(addedbyuserid,
      timestart,
      timeend,
      doctorid,
      patientid,)

    // Create the appointment using formatted timestamps
    const appointment = new Appointment({
      addedbyuserid,
      timestart: formattedStart,
      timeend: formattedEnd,
      doctorid,
      patientid,
      status: "Scheduled",
    });

    await appointment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};

/**
 * Cancel an Appointment
 */
const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { appointmentid } = req.params;

    if (!appointmentid) {
      throw new Error("Appointment ID is required.");
    }

    const appointment = await Appointment.findById(appointmentid).session(session);

    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    if (appointment.status === "Canceled") {
      throw new Error("Appointment is already canceled.");
    }

    appointment.status = "Canceled";
    await appointment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Appointment canceled successfully.",
      appointment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};


const markAsDoneAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log("called")
    const { appointmentid } = req.params;

    if (!appointmentid) {
      throw new Error("Appointment ID is required.");
    }

    const appointment = await Appointment.findById(appointmentid).session(session);

    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    if (appointment.status === "Completed") {
      throw new Error("Appointment is already completed.");
    }

    appointment.status = "Completed";
    await appointment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Appointment completed successfully.",
      appointment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reschedule an Appointment
 */
const rescheduleAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { appointmentid } = req.params;
    const { newtimestart, newtimeend } = req.body;

    if (!appointmentid || !newtimestart || !newtimeend) {
      throw new Error("Appointment ID and new times are required.");
    }

    const appointment = await Appointment.findById(appointmentid).session(session);

    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    if (appointment.status !== "Scheduled") {
      throw new Error("Only scheduled appointments can be rescheduled.");
    }

    const doctorid = appointment.doctorid;

    // Check doctor's availability
    const appointmentDate = new Date(newtimestart).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const availability = await Availability.findOne({ doctorid }).session(session);

    if (!availability) {
      throw new Error("Doctor's availability not set.");
    }

    const dayAvailability = availability.days.find(
      (day) => day.day === appointmentDate
    );

    if (!dayAvailability) {
      throw new Error(`Doctor is not available on ${appointmentDate}.`);
    }

    // Check if new appointment time is within doctor's available time
    const appointmentStart = new Date(newtimestart);
    const appointmentEnd = new Date(newtimeend);

    const [availStartHour, availStartMinute] = dayAvailability.timestart
      .split(":")
      .map(Number);
    const [availEndHour, availEndMinute] = dayAvailability.timeend
      .split(":")
      .map(Number);

    const availableStart = new Date(newtimestart);
    availableStart.setHours(availStartHour, availStartMinute, 0, 0);

    const availableEnd = new Date(newtimestart);
    availableEnd.setHours(availEndHour, availEndMinute, 0, 0);

    if (
      appointmentStart < availableStart ||
      appointmentEnd > availableEnd ||
      appointmentStart >= appointmentEnd
    ) {
      throw new Error("New appointment time is outside of doctor's available hours.");
    }

    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({
      _id: { $ne: appointmentid },
      doctorid,
      status: "Scheduled",
      $or: [
        {
          timestart: { $lt: appointmentEnd },
          timeend: { $gt: appointmentStart },
        },
      ],
    }).session(session);

    if (overlappingAppointment) {
      throw new Error("The doctor already has an appointment at the new time.");
    }

    // Update the appointment times
    appointment.timestart = appointmentStart;
    appointment.timeend = appointmentEnd;
    await appointment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Appointment rescheduled successfully.",
      appointment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get Today's Appointments
 */
const getTodaysAppointments = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      timestart: { $gte: todayStart, $lte: todayEnd },
      status: "Scheduled",
    })
      .populate("doctorid", "name")
      .populate("patientid", "name")
      .exec();

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get Appointments of a Specific Doctor
 */
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorid } = req.params;

    if (!doctorid) {
      throw new Error("Doctor ID is required.");
    }

    const appointments = await Appointment.find({
      doctorid,
      status: "Scheduled",
    })
      .populate("patientid", "name")
      .exec();

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


/**
 * Get Appointments within a Date Range
 */
const getAppointmentsInDateRange = async (req, res) => {
  try {
    const { startdate, enddate } = req.query;

    // Validate input dates
    if (!startdate || !enddate) {
      return res.status(400).json({ error: "Start date and end date are required." });
    }

    // Parse the input dates as UTC (assuming they're in YYYY-MM-DD format)
    const startUTC = new Date(`${startdate}T00:00:00Z`);  // Start of the day in UTC
    const endUTC = new Date(`${enddate}T23:59:59Z`);    // End of the day in UTC

    // Check for invalid date parsing
    if (isNaN(startUTC.getTime()) || isNaN(endUTC.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    console.log("Parsed Date Range (UTC):", startUTC.toISOString(), "to", endUTC.toISOString());

    const appointments = await Appointment.find({
      timestart: { $gte: startUTC, $lte: endUTC },
      // status: "Scheduled",  // Only include scheduled appointments
    }).exec();

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found in the given date range." });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments in date range:", error);
    res.status(500).json({ error: "Failed to fetch appointments." });
  }
};

/**
 * Get Appointment Details by ID
 */
const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentid } = req.params;

    if (!appointmentid) {
      throw new Error("Appointment ID is required.");
    }

    const appointment = await Appointment.findById(appointmentid)
      .populate("doctorid", "name")
      .populate("patientid", "name")
      .exec();

    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    res.status(200).json({ appointment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get All Appointments
 */
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctorid", "name")
      .populate("patientid", "name")
      .exec();

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const addDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, days } = req.body;

    if (!doctorId || !days || !Array.isArray(days)) {
      throw new Error("Doctor ID and days array are required.");
    }

    const availability = new Availability({
      doctorid: doctorId,
      days,
    });

    await availability.save();

    res.status(201).json({
      message: "Doctor availability added successfully.",
      availability,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Utility function to convert time strings to minutes for comparison
function timeStringToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Utility function to extract day of the week from a date string (e.g. "2024-11-10" → "Sunday")
function getDayOfWeekFromDate(dateStr) {
  const date = new Date(dateStr);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek[date.getDay()];
}

// Utility function to check if a time slot is within a given range
function isSlotAvailable(doctorAvailability, day, startTime, endTime) {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  // Check if doctor is available on the requested day
  const availability = doctorAvailability.days.find(slot => slot.day === day);
  if (availability) {
    const slotStart = timeStringToMinutes(availability.timestart);
    const slotEnd = timeStringToMinutes(availability.timeend);
    // Check if requested slot is within the available slot
    return startMinutes >= slotStart && endMinutes <= slotEnd;
  }
  return false;
}

// Utility function to check if a slot is already booked
function isSlotBooked(appointments, startTime, endTime) {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  return appointments.some(appointment => {
    const appointmentStart = timeStringToMinutes(appointment.timestart);
    const appointmentEnd = timeStringToMinutes(appointment.timeend);
    return (startMinutes < appointmentEnd && endMinutes > appointmentStart);
  });
}
const getDoctorsBySlotAvailability1 = async (req, res) => {
  const { date, day, startTime, endTime } = req.body;

  // If day is provided, use that; otherwise, calculate day from date
  let selectedDay = day;
  if (!selectedDay && date) {
    selectedDay = getDayOfWeekFromDate(date); // Get the day from the date if day is not provided
  }
  console.log(selectedDay)

  // If date is provided, we can use that to extract the day
  if (!date && !selectedDay) {
    return res.status(400).json({ error: "Either 'date' or 'day' must be provided" });
  }

  if (!startTime || !endTime) {
    return res.status(400).json({ error: "Missing required time parameters" });
  }

  try {
    // Convert start and end times to Date objects
    const startDateTime = new Date(`${date}T${startTime}:00Z`);
    const endDateTime = new Date(`${date}T${endTime}:00Z`);

    // Find doctors with available slots on the specified day
    const doctors = await Availability.find({ "days.day": selectedDay });

    const availableDoctors = [];

    for (const doctor of doctors) {
      // Check if the doctor has available slots for the specified time and day
      if (isSlotAvailable(doctor, selectedDay, startDateTime, endDateTime)) {
        // Find appointments for the doctor on the same day
        const appointments = await Appointment.find({
          doctorid: doctor.doctorid,
          $and: [
            { timestart: { $lt: endDateTime } },
            { timeend: { $gt: startDateTime } }
          ]
        });

        const slotBooked = isSlotBooked(appointments, startDateTime, endDateTime);

        availableDoctors.push({
          doctorid: doctor.doctorid,
          available: !slotBooked,
          slotStatus: slotBooked ? "Booked" : "Available"
        });
      }
    }

    res.status(200).json({ doctors: availableDoctors });
  } catch (error) {
    console.error("Error fetching doctors by slot availability:", error);
    res.status(500).json({ error: "Failed to fetch available doctors" });
  }
};

// Helper function to check if a slot is available
function isSlotAvailable(doctor, selectedDay, startDateTime, endDateTime) {
  // Implement logic based on your availability data structure for the doctor
  // Example: check if the doctor has a slot on the given day and time range
  const daySlots = doctor.days.find(day => day.day === selectedDay);
  if (!daySlots) return false;

  // Assuming that daySlots contains start and end times of available slots
  for (const slot of daySlots.slots) {
    const slotStart = new Date(`${startDateTime.toISOString().split('T')[0]}T${slot.start}:00Z`);
    const slotEnd = new Date(`${startDateTime.toISOString().split('T')[0]}T${slot.end}:00Z`);

    if (startDateTime >= slotStart && endDateTime <= slotEnd) {
      return true;
    }
  }

  return false;
}

// Helper function to check if the slot is booked based on appointments
function isSlotBooked(appointments, startDateTime, endDateTime) {
  // Check if there are any overlapping appointments in the specified time range
  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.timestart);
    const appointmentEnd = new Date(appointment.timeend);

    if (
      (startDateTime < appointmentEnd && startDateTime >= appointmentStart) ||
      (endDateTime > appointmentStart && endDateTime <= appointmentEnd) ||
      (startDateTime <= appointmentStart && endDateTime >= appointmentEnd)
    ) {
      return true; // Slot is booked if there's any overlap
    }
  }
  return false; // Slot is available
}
const getTimeSlots = (startTime, endTime, interval = 30) => {
  const slots = [];
  let current = new Date(startTime);

  while (current < endTime) {
    const slotStart = new Date(current);
    current.setMinutes(current.getMinutes() + interval);
    slots.push({ start: slotStart, end: new Date(current) });
  }

  return slots;
};

const getSlotsofDoctor =async (req, res) => {
  try {
    const { doctorid, date } = req.body;

    if (!doctorid || !date) {
      return res.status(400).json({ error: "Doctor ID and date are required" });
    }

    // Fetch availability for the doctor
    const availability = await Availability.findOne({ doctorid });
    if (!availability) {
      return res.status(404).json({ error: "No availability found for this doctor" });
    }

    // Find the day's availability
    const dayName = new Date(date).toLocaleString("en-US", { weekday: "long" }); // e.g., 'Monday'
    const dayAvailability = availability.days.find((day) => day.day === dayName);
    if (!dayAvailability) {
      return res.status(404).json({ error: "No availability found for this day" });
    }
    // Parse available time range
    const dayStartTime = new Date(`${date}T${dayAvailability.timestart}`);
    const dayEndTime = new Date(`${date}T${dayAvailability.timeend}`);
    const allSlots = getTimeSlots(dayStartTime, dayEndTime);

    // Fetch appointments for the doctor on the given date
    const appointments = await Appointment.find({
      doctorid,
      timestart: { $gte: dayStartTime, $lt: dayEndTime },
    });

    // Filter out booked slots
    const bookedSlots = appointments.map((appt) => ({
      start: new Date(appt.timestart),
      end: new Date(appt.timeend),
    }));

    const availableSlots = allSlots.filter((slot) => {
      return !bookedSlots.some(
        (booked) =>
          (slot.start >= booked.start && slot.start < booked.end) || // Overlaps start
          (slot.end > booked.start && slot.end <= booked.end) || // Overlaps end
          (slot.start <= booked.start && slot.end >= booked.end) // Encloses
      );
    });

    res.json({ availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
const getDoctorsBySlotAvailability = async (req, res) => {
  try {
    const { startTime, endTime, date } = req.body;

    // Validate input
    if (!startTime || !endTime || !date) {
      return res.status(400).json({ error: "'startTime', 'endTime' and 'date' are required" });
    }

    // Convert the input start and end times into Date objects
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // Check if the times are valid
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: "Invalid time or date format" });
    }

    // Get the weekday name from the provided date
    const selectedDay = getDayOfWeekFromDate(date);
    console.log(`Selected Day: ${selectedDay}`);

    // Get all availability for doctors on the specified weekday
    const doctors = await Availability.find({
      "days.day": selectedDay // Match doctors available on the specified weekday
    });

    const availableDoctors = [];

    // Loop through each doctor to check their availability
    for (const doctor of doctors) {
      // Find the availability slots for this doctor on the specified weekday
      const daySlots = doctor.days.find(day => day.day === selectedDay);

      if (daySlots) {
        // Convert available start and end times to Date objects
        const doctorStartTime = new Date(`${date}T${daySlots.timestart}:00`);
        const doctorEndTime = new Date(`${date}T${daySlots.timeend}:00`);

        // Check if the doctor's available time slot covers the requested time
        if (startDateTime >= doctorStartTime && endDateTime <= doctorEndTime) {
          
          // Check if there are any conflicting appointments for this doctor within the requested time
          const conflictingAppointments = await Appointment.find({
            doctorid: doctor.doctorid,
            $and: [
              { timestart: { $lt: endDateTime } },
              { timeend: { $gt: startDateTime } }
            ]
          });

          // If there are no conflicting appointments, add this doctor to the list of available doctors
          if (conflictingAppointments.length === 0) {
            availableDoctors.push({
              doctorid: doctor.doctorid,
              available: true,
              slotStatus: "Available"
            });
          }
        }
      }
    }

    // Return the list of available doctors
    if (availableDoctors.length === 0) {
      return res.status(404).json({ message: "No available doctors found for the selected time." });
    }

    return res.status(200).json({ doctors: availableDoctors });
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    return res.status(500).json({ error: "Failed to fetch available doctors." });
  }
};

// Helper function to get time slots between start and end time
const getTimeSlots1 = (startTime, endTime, interval = 30) => {
  const slots = [];
  let current = new Date(startTime);

  while (current < endTime) {
    const slotStart = new Date(current);
    current.setMinutes(current.getMinutes() + interval);
    slots.push({ start: slotStart, end: new Date(current) });
  }

  return slots;
};

// Route to get all doctors with available slots for a given date
const availableslots= async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Fetch all doctors' availability
    const availabilities = await Availability.find();
    if (!availabilities || availabilities.length === 0) {
      return res.status(404).json({ error: "No availabilities found" });
    }

    const results = [];

    for (const availability of availabilities) {
      const { doctorid, days } = availability;

      // Find the day's availability
      const dayName = new Date(date).toLocaleString("en-US", { weekday: "long" }); // e.g., 'Monday'
      const dayAvailability = days.find((day) => day.day === dayName);

      if (!dayAvailability) {
        results.push({
          doctorid,
          availableSlots: [],
        });
        continue;
      }

      // Parse available time range
      const dayStartTime = new Date(`${date}T${dayAvailability.timestart}`);
      const dayEndTime = new Date(`${date}T${dayAvailability.timeend}`);
      const allSlots = getTimeSlots1(dayStartTime, dayEndTime);

      // Fetch appointments for the doctor on the given date
      const appointments = await Appointment.find({
        doctorid,
        timestart: { $gte: dayStartTime, $lt: dayEndTime },
      });

      // Filter out booked slots
      const bookedSlots = appointments.map((appt) => ({
        start: new Date(appt.timestart),
        end: new Date(appt.timeend),
      }));

      const availableSlots = allSlots.filter((slot) => {
        return !bookedSlots.some(
          (booked) =>
            (slot.start >= booked.start && slot.start < booked.end) || // Overlaps start
            (slot.end > booked.start && slot.end <= booked.end) || // Overlaps end
            (slot.start <= booked.start && slot.end >= booked.end) // Encloses
        );
      });

      results.push({
        doctorid,
        availableSlots,
      });
    }

    res.json({ doctors: results });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  getAllAppointments,
  getAppointmentsInDateRange,
  getDoctorAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getTodaysAppointments,
  addDoctorAvailability,
  getAppointmentDetails,
  getDoctorsBySlotAvailability,
  getSlotsofDoctor,
  availableslots,
  markAsDoneAppointment
};
