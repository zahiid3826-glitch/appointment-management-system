import React, { useState, useEffect } from "react";
import SidebarDoc from "../../components/layout/SidebarDoc";
import useUser from '../../components/layout/useUser';
import axios from "axios";

// Generate time options dynamically in 30-minute increments (00:00 to 23:30)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    const formattedHour = hour.toString(); 
    times.push(`${formattedHour}:00`);
    times.push(`${formattedHour}:30`);
  }
  return times;
};


const timeOptions = generateTimeOptions();

const DocAvailability = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { username } = useUser();

  // Initial state for availability
  const [availability, setAvailability] = useState([
    { day: "Monday", isAvailable: false, timings: [] },
    { day: "Tuesday", isAvailable: false, timings: [] },
    { day: "Wednesday", isAvailable: false, timings: [] },
    { day: "Thursday", isAvailable: false, timings: [] },
    { day: "Friday", isAvailable: false, timings: [] },
    { day: "Saturday", isAvailable: false, timings: [] },
    { day: "Sunday", isAvailable: false, timings: [] },
  ]);

  function formatTime(timeString) {
    if (timeString.includes('.')) {
      timeString = timeString.replace('.', ':');
    }
  
    // Split the time string into hours and minutes
    const [hours, minutes] = timeString.split(':').map(Number);
  
    // Check for valid time components
    if (isNaN(hours) || isNaN(minutes)) {
      return ""; // Return an empty string if invalid
    }
  
    // Format the time manually to ensure it's in 24-hour format
    let formattedHour = hours < 10 ? `${hours}` : `${hours}`;
    let formattedMinute = minutes < 10 ? `${minutes}` : `${minutes}`;
  
    // Return the formatted time in HH:mm (24-hour) format
    return `${formattedHour}:${formattedMinute}`;
  }
  

  useEffect(() => {
    const fetchSchedule = async () => {
      const userId = localStorage.getItem('useridloggedin');
      try {
        const doctorId = userId; 
        console.log(doctorId)
        const response = await axios.get(
          `http://localhost:3001/doctor/getschedule?doctorId=${doctorId}` 
        );


        const availabilityData = response.data.availability;
        const days = availabilityData.days || { days: [] };
        console.log(days);
        console.log(availabilityData)

        // Map over the days from the backend
        const updatedAvailability = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => {
          const matchedDay = days.find((dayData) => dayData.day === day);
          return matchedDay
            ? {
              day,
              isAvailable: true,
              timings: [
                {
                  timestart: formatTime(matchedDay.timestart),
                  timeend: formatTime(matchedDay.timeend),
                },
              ],
            }
            : { day, isAvailable: false, timings: [] };
        });

        setAvailability(updatedAvailability);
      } catch (error) {
        console.error("No Schedule");
        if (error.response && error.response.status === 400) {
          console.warn("No schedule found for this doctor. Falling back to default availability.");
          setAvailability([
            { day: "Monday", isAvailable: false, timings: [] },
            { day: "Tuesday", isAvailable: false, timings: [] },
            { day: "Wednesday", isAvailable: false, timings: [] },
            { day: "Thursday", isAvailable: false, timings: [] },
            { day: "Friday", isAvailable: false, timings: [] },
            { day: "Saturday", isAvailable: false, timings: [] },
            { day: "Sunday", isAvailable: false, timings: [] },
          ]);
        } else {
          console.error("Error fetching schedule:", error);
        }
      }
    };

    if (username) {
      fetchSchedule();
    }
  }, [username]);


  // Toggle availability for a day
  const handleToggleAvailability = (index) => {
    setAvailability((prev) =>
      prev.map((day, i) =>
        i === index
          ? { ...day, isAvailable: !day.isAvailable, timings: [] } : day
      )
    );
  };

  // Add timing slot
  const handleAddTiming = (index) => {
    setAvailability((prev) =>
      prev.map((day, i) =>
        i === index && day.timings.length === 0
          ? { ...day, timings: [{ timestart: "", timeend: "" }] } : day
      )
    );
  };

  // Handle start time change
  const handleStartChange = (index, value) => {
    setAvailability((prev) =>
      prev.map((day, i) =>
        i === index
          ? { ...day, timings: [{ ...day.timings[0], timestart: value }] }
          : day
      )
    );
  };

  // Handle end time change
  const handleEndChange = (index, value) => {
    setAvailability((prev) =>
      prev.map((day, i) =>
        i === index
          ? { ...day, timings: [{ ...day.timings[0], timeend: value }] }
          : day
      )
    );
  };

  // Save availability (connect to backend here)
  const handleSave = async () => {
    const userId = localStorage.getItem('useridloggedin');
    console.log("Availability to save:", availability);
    try {
      const availabilityData = {
        doctorId: userId,
        days: availability.filter((day) => day.isAvailable)
          .map((day) => ({
            day: day.day,
            timestart: day.timings[0]?.timestart || "",
            timeend: day.timings[0]?.timeend || ""
          }))
      };

      if (!availabilityData) {
        console.log("No availale days to save");
        return;
      }

      console.log("Data sent to database" + availabilityData.days + availabilityData.doctorId)

      const response = await axios.post(
        "http://localhost:3001/doctor/addschedule",
        availabilityData
      )

      if (response.status === 201) {
        alert("Availality Added Successfully")
      }
      else if (response.status === 200) {
        alert("Your schedule is already saved")
      }
      else {
        console.log("Error" + response.data)
      }
    } catch (err) {
      console.log("Error" + err)
      alert("An error occured whilst saving schdeule")
    }

  };

  const handleUpdateSchedule = async () => {
    const userId = localStorage.getItem('useridloggedin');
    console.log("Availability to save:", availability);
    try {
      const availabilityData = {
        doctorId: userId,
        days: availability.filter((day) => day.isAvailable)
          .map((day) => ({
            day: day.day,
            timestart: day.timings[0]?.timestart || "",
            timeend: day.timings[0]?.timeend || ""
          }))
      };

      if (!availabilityData) {
        console.log("No availale days to save");
        return;
      }

      console.log("Data sent to database" + availabilityData.days + availabilityData.doctorId)

      const response = await axios.put(
        "http://localhost:3001/doctor//resetschedule",
        availabilityData
      )

      if (response.status === 200) {
        alert("Your schedule is updated")
      }
      else {
        console.log("Error" + response.data)
      }
    } catch (err) {
      console.log("Error" + err)
      alert("An error occured whilst saving schdeule")
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-72`}
      >
        <SidebarDoc
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab="availaility"
        />
      </div>

      {/* Main Content */}
      <div className="ml-0 md:ml-72 p-4">
        <h1 className="text-2xl font-bold mb-4">Doctor Availability</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
          {availability.map((day, index) => (
            <div key={index} className="border rounded p-4 shadow">
              <h2 className="text-lg font-bold mb-2">{day.day}</h2>

              {/* Toggle Button */}
              <div className="flex items-center gap-4 mb-4">
                <label className="font-semibold">Available:</label>
                <button
                  className={`px-4 py-2 rounded ${day.isAvailable
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-black"
                    }`}
                  onClick={() => handleToggleAvailability(index)}
                >
                  {day.isAvailable ? "Yes" : "No"}
                </button>
              </div>

              {/* Add and Update Timing */}
              {day.isAvailable && (
                <div>
                  {day.timings.length === 0 ? (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() => handleAddTiming(index)}
                    >
                      Add Timing
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div>
                        <label className="block font-semibold">Start Time</label>
                        <select
                          value={day.timings[0]?.timestart || ""}
                          onChange={(e) =>
                            handleStartChange(index, e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="">Select Start Time</option>
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold">End Time</label>
                        <select
                          value={day.timings[0]?.timeend || ""}
                          onChange={(e) =>
                            handleEndChange(index, e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="">Select End Time</option>
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded mt-4"
          onClick={handleSave}
        >
          Save
        </button> <br></br>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded mt-4"
          onClick={handleUpdateSchedule}
        >
          Update Schedule
        </button>
      </div>
    </div>
  );
};

export default DocAvailability;
