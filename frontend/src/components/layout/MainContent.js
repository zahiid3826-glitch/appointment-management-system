import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { Card } from '../common';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../common/DialogComponent';
import logindetails from '../../JSONFiles/logindetails.json';

const MainContent = ({ activeTab }) => {
  // State variables for filters
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // State variables for booking
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');

  // State for managing doctors data
  const [doctors, setDoctors] = useState([]);

  // State for managing Dialogs
  const [isSlotsDialogOpen, setIsSlotsDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  // Retrieve currentUser._id from localStorage
  const currentUserId = localStorage.getItem('useridloggedin');

  // Extract doctors and patients from logindetails.json
  const doctorDetails = logindetails.filter((user) => user.role === 'doctor');
  const patientDetails = logindetails.filter((user) => user.role === 'patient');

  // Create a mapping from doctor ID to doctor name
  const doctorIdToName = {};
  doctorDetails.forEach((doctor) => {
    doctorIdToName[doctor._id] = doctor.username;
  });

  // Extract doctor names for the dropdown
  const doctorNames = doctorDetails.map((doctor) => doctor.username);

  // Extract patient names and IDs for the customer dropdown
  const patientOptions = patientDetails.map((patient) => ({
    username: patient.username,
    _id: patient._id,
  }));

  // Fetch available slots when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    } else {
      setDoctors([]);
    }
  }, [selectedDate]);

  // Function to fetch available slots from backend
  const fetchAvailableSlots = async (date) => {
    try {
      const response = await fetch('http://localhost:3001/receptionist/availableslots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const data = await response.json();
      if (data.doctors) {
        const updatedDoctors = data.doctors.map((doc) => ({
          ...doc,
          name: doctorIdToName[doc.doctorid] || 'Unknown Doctor',
          availableSlots: doc.availableSlots.map((slot) => ({
            date: slot.start.split('T')[0],
            startTime: new Date(slot.start).toISOString(),
            endTime: new Date(slot.end).toISOString(),
            displayStartTime: new Date(slot.start).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            displayEndTime: new Date(slot.end).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          })),
        }));
        setDoctors(updatedDoctors);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setDoctors([]);
    }
  };

  // Handle slot selection
  const handleSlotSelection = (slot, doctor) => {
    setSelectedSlot(slot);
    setBookingDoctor(doctor);
    setIsSlotsDialogOpen(false);
    setIsConfirmationDialogOpen(true);
  };

  // Confirm booking
  const confirmBooking = async () => {
    if (!bookingDoctor || !selectedSlot || !selectedPatient) {
      alert('Please select a patient.');
      return;
    }
console.log({
  addedbyuserid: currentUserId,
  timestart: selectedSlot.startTime,
  timeend: selectedSlot.endTime,
  doctorid: bookingDoctor.doctorid,
  patientid: selectedPatient,
})
    try {
      const response = await fetch('http://localhost:3001/receptionist/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addedbyuserid: currentUserId,
          timestart: selectedSlot.startTime,
          timeend: selectedSlot.endTime,
          doctorid: bookingDoctor.doctorid,
          patientid: selectedPatient,
        }),
      });
      const result = await response.json();
      if (result.message === 'Appointment booked successfully.') {
        alert('Booking confirmed!');
        // Refresh available slots after booking
        fetchAvailableSlots(selectedDate);
      } else {
        alert('Failed to confirm booking.');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('An error occurred while confirming your booking.');
    } finally {
      // Reset the selection
      setIsConfirmationDialogOpen(false);
      setSelectedSlot(null);
      setBookingDoctor(null);
      setSelectedPatient('');
    }
  };

  // Apply Filters based on user input
  const filteredDoctors = doctors
    .filter((doctor) => {
      // Filter by doctor name if selectedDoctor is provided
      if (selectedDoctor && doctor.name !== selectedDoctor) {
        return false;
      }
      return true;
    })
    .map((doctor) => ({
      ...doctor,
      availableSlots: doctor.availableSlots.filter((slot) => {
        // Convert time strings to comparable values
        const slotStart = slot.startTime;
        const slotEnd = slot.endTime;
        const filterStart = startTime
          ? new Date(`${selectedDate}T${startTime}`).toISOString()
          : null;
        const filterEnd = endTime
          ? new Date(`${selectedDate}T${endTime}`).toISOString()
          : null;

        if (filterStart && filterEnd) {
          // Both startTime and endTime are selected
          return slotStart >= filterStart && slotEnd <= filterEnd;
        } else if (filterStart) {
          // Only startTime is selected
          return slotStart >= filterStart;
        } else if (filterEnd) {
          // Only endTime is selected
          return slotEnd <= filterEnd;
        }
        // If no time filters are applied, include all slots
        return true;
      }),
    }))
    .filter((doctor) => doctor.availableSlots.length > 0); // Remove doctors with no available slots after filtering

  // Handle Receptionist not logged in
  if (!currentUserId) {
    return (
      <div className="p-4 md:p-6 bg-white">
        <p className="text-red-500">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white">
      {/* Search Form */}
      <Card className="p-4 md:p-6 mb-6 bg-white shadow-md rounded-lg">
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-gray-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          {/* Start Time Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-md border border-gray-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          {/* End Time Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-md border border-gray-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          {/* Doctor Name Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Doctor Name</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="rounded-md border border-gray-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Doctors</option>
              {doctorNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          {/* No Search Button since filtering is instant */}
        </form>
      </Card>

      {/* Available Doctors Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Doctors</h2>

        {/* Optional Additional Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search Doctor"
            className="w-full p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.doctorid}
                className="bg-[#ADD8E680] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 shadow-sm"
              >
                {/* Doctor Info */}
                <div className="flex items-center space-x-4">
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    className="w-10 h-10 rounded-full bg-gray-200"
                  />
                  <div>
                    <h3 className="font-medium">{doctor.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{doctor.rating}</span>
                      <span className="text-sm text-gray-400">• {doctor.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Book Appointment Button */}
                <button
                  onClick={() => {
                    setBookingDoctor(doctor);
                    setIsSlotsDialogOpen(true);
                  }}
                  className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No available doctors match your filters.</p>
          )}
        </div>
      </div>

      {/* Slots Dialog */}
      <Dialog open={isSlotsDialogOpen} onOpenChange={setIsSlotsDialogOpen}>
        <DialogContent className="sm:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle>Book Appointment with {bookingDoctor?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {bookingDoctor?.availableSlots.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left">Date</th>
                        <th className="border p-3 text-left">Available Slots</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingDoctor.availableSlots.map((slot, index) => (
                        <tr key={index}>
                          <td className="border p-3">{slot.date}</td>
                          <td className="border p-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleSlotSelection(slot, bookingDoctor)}
                                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-sm transition-colors"
                              >
                                {slot.displayStartTime} - {slot.displayEndTime}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No available slots for this doctor on the selected date.</p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <button
              onClick={() => setIsSlotsDialogOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>
              Are you sure you want to book an appointment with <strong>{bookingDoctor?.name}</strong>?
            </p>
            <p className="mt-2">
              <strong>Date:</strong> {selectedSlot?.date}
            </p>
            <p>
              <strong>Time:</strong>{' '}
              {new Date(selectedSlot?.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}{' '}
              -{' '}
              {new Date(selectedSlot?.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </p>

            {/* Customer Dropdown */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Select Customer</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-2 pl-3 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a customer</option>
                {patientOptions.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmationDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                  !selectedPatient ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!selectedPatient}
              >
                Confirm Booking
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainContent;
