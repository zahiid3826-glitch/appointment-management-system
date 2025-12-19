import React, { useState } from "react";
import SidebarPatient from "../../components/layout/SidebarPatient";

// Define available slots with 30-minute intervals
const slots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
  "3:00 PM", "3:30 PM"
];

const doctors = [
  { id: 1, name: "Dr. John Doe", specialization: "Cardiology" },
  { id: 2, name: "Dr. Sarah Smith", specialization: "Dermatology" },
  { id: 3, name: "Dr. Emily Brown", specialization: "Pediatrics" },
];

const BookAppointment = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedSlot && startTime && endTime) {
      alert(`Appointment booked with ${selectedDoctor.name} at ${selectedSlot}`);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setStartTime("");
      setEndTime("");
    } else {
      alert("Please select a doctor, a time slot, and valid start and end times.");
    }
  };

  const isValidTimeSlot = (start, end) => {
    const startSlotIndex = slots.indexOf(start);
    const endSlotIndex = slots.indexOf(end);
    return startSlotIndex !== -1 && endSlotIndex !== -1 && startSlotIndex < endSlotIndex;
  };

  return (
    <div className="min-h-screen flex">
      <SidebarPatient activeTab="book" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Search Available Slots</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                className="border rounded-lg p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border rounded-lg p-2 w-full"
              >
                <option value="">Select Start Time</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border rounded-lg p-2 w-full"
              >
                <option value="">Select End Time</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Available Doctors Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Available Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedDoctor?.id === doctor.id ? "border-blue-600" : ""
                }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <h3 className="font-bold text-lg">Dr. {doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Available Slots Section */}
        {selectedDoctor && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-medium mb-4">
              Available Slots for Dr. {selectedDoctor.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  className={`border rounded-lg p-2 ${
                    selectedSlot === slot
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Appointment Button */}
        {selectedSlot && startTime && endTime && isValidTimeSlot(startTime, endTime) && (
          <div>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleBookAppointment}
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
