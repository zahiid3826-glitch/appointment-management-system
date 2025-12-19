import React, { useState, useEffect } from "react";
import SidebarPatient from "../../components/layout/SidebarPatient";
import axios from "axios";
import { Loader2, Calendar, Clock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookAppointment = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const patientId = localStorage.getItem("useridloggedin");

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    } else {
      setDoctors([]);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/patient/available-slots", {
        params: { date: selectedDate },
      });

      if (response.data.doctors) {
        setDoctors(response.data.doctors);
      } else {
        setDoctors([]);
        toast.info("No doctors available for the selected date.");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to fetch available slots.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      toast.error("Please select a doctor and time slot.");
      return;
    }

    setBooking(true);

    try {
      const response = await axios.post("http://localhost:3001/patient/appointments", {
        timestart: selectedSlot.start,
        timeend: selectedSlot.end,
        doctorid: selectedDoctor.doctorid,
        patientid: patientId,
      });

      if (response.data.status === "accepted") {
        toast.success("Appointment booked successfully!");
        setSelectedDoctor(null);
        setSelectedSlot(null);
        fetchAvailableSlots();
      } else {
        toast.error("Appointment booking was rejected.");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(error.response?.data?.error || "Failed to book appointment.");
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarPatient activeTab="book-appointment" />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Book an Appointment</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-medium mb-4 text-gray-700">Select Date</h2>
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTodayDate()}
              className="border rounded-lg p-3 w-full max-w-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-2 text-gray-600">Loading available doctors...</span>
          </div>
        )}

        {!loading && selectedDate && doctors.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No doctors available for the selected date.</p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-medium mb-4 text-gray-700">Available Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.doctorid}
                  onClick={() => handleDoctorSelect(doctor)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDoctor?.doctorid === doctor.doctorid
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <h3 className="font-bold text-lg text-gray-800">Dr. {doctor.doctorid}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {doctor.availableSlots.length} slots available
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDoctor && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-medium mb-4 text-gray-700">
              Available Slots for Dr. {selectedDoctor.doctorid}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedDoctor.availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotSelect(slot)}
                  className={`p-3 border rounded-lg transition-all flex items-center justify-center gap-2 ${
                    selectedSlot?.start === slot.start
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSlot && selectedDoctor && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium mb-4 text-gray-700">Confirm Booking</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-700">
                <strong>Doctor:</strong> Dr. {selectedDoctor.doctorid}
              </p>
              <p className="text-gray-700">
                <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                <strong>Time:</strong> {formatTime(selectedSlot.start)} -{" "}
                {formatTime(selectedSlot.end)}
              </p>
            </div>
            <button
              onClick={handleBookAppointment}
              disabled={booking}
              className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {booking ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
