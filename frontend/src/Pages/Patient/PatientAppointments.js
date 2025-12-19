import React, { useState, useEffect } from "react";
import SidebarPatient from "../../components/layout/SidebarPatient";
import axios from "axios";
import { Loader2, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientAppointments = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [rescheduling, setRescheduling] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const patientId = localStorage.getItem("useridloggedin");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [upcomingRes, allRes] = await Promise.all([
        axios.get("http://localhost:3001/patient/appointments", {
          params: { patientid: patientId },
        }),
        axios.get("http://localhost:3001/patient/appointments/all", {
          params: { patientid: patientId },
        }),
      ]);

      setUpcomingAppointments(upcomingRes.data.appointments || []);
      setAllAppointments(allRes.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancelling(appointmentId);
    try {
      const response = await axios.put(
        `http://localhost:3001/patient/${appointmentId}/cancel`,
        { patientid: patientId }
      );

      if (response.data.status === "confirmed") {
        toast.success("Appointment cancelled successfully!");
        fetchAppointments();
      } else {
        toast.error("Cancellation request was rejected.");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.error || "Failed to cancel appointment.");
    } finally {
      setCancelling(null);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  const closeRescheduleModal = () => {
    setSelectedAppointment(null);
    setRescheduleDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  const fetchAvailableSlotsForReschedule = async () => {
    if (!rescheduleDate || !selectedAppointment) return;

    setFetchingSlots(true);
    try {
      const response = await axios.get("http://localhost:3001/patient/available-slots", {
        params: {
          date: rescheduleDate,
          doctorid: selectedAppointment.doctorid,
        },
      });

      if (response.data.doctors && response.data.doctors.length > 0) {
        setAvailableSlots(response.data.doctors[0].availableSlots || []);
      } else {
        setAvailableSlots([]);
        toast.info("No available slots for the selected date.");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to fetch available slots.");
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }

    setRescheduling(selectedAppointment._id);
    try {
      const response = await axios.put(
        `http://localhost:3001/patient/${selectedAppointment._id}/reschedule`,
        {
          newStartTime: selectedSlot.start,
          newEndTime: selectedSlot.end,
          patientid: patientId,
        }
      );

      if (response.data.status === "confirmed") {
        toast.success("Appointment rescheduled successfully!");
        closeRescheduleModal();
        fetchAppointments();
      } else {
        toast.error("Rescheduling request was rejected.");
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error(error.response?.data?.error || "Failed to reschedule appointment.");
    } finally {
      setRescheduling(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const previousAppointments = allAppointments.filter(
    (apt) =>
      apt.status.toLowerCase() === "canceled" ||
      apt.status.toLowerCase() === "completed" ||
      new Date(apt.timestart) < new Date()
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarPatient activeTab="history" />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Appointments</h1>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-2 text-gray-600">Loading appointments...</span>
          </div>
        )}

        {!loading && (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-medium mb-4 text-gray-700 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Appointments
              </h2>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          Dr. {appointment.doctorid}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.timestart)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatTime(appointment.timestart)} -{" "}
                              {formatTime(appointment.timeend)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-4 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                        <button
                          onClick={() => openRescheduleModal(appointment)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={cancelling === appointment._id}
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {cancelling === appointment._id ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming appointments.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-medium mb-4 text-gray-700">
                Appointment History
              </h2>
              {previousAppointments.length > 0 ? (
                <div className="space-y-4">
                  {previousAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          Dr. {appointment.doctorid}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.timestart)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatTime(appointment.timestart)} -{" "}
                              {formatTime(appointment.timeend)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No previous appointments.</p>
              )}
            </div>
          </>
        )}
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Reschedule Appointment</h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Current Appointment:</strong>
              </p>
              <p className="text-gray-600">
                Doctor: Dr. {selectedAppointment.doctorid}
              </p>
              <p className="text-gray-600">
                Date: {formatDate(selectedAppointment.timestart)}
              </p>
              <p className="text-gray-600">
                Time: {formatTime(selectedAppointment.timestart)} -{" "}
                {formatTime(selectedAppointment.timeend)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setAvailableSlots([]);
                  setSelectedSlot(null);
                }}
                min={getTodayDate()}
                className="border rounded-lg p-2 w-full"
              />
            </div>

            {rescheduleDate && (
              <div className="mb-4">
                <button
                  onClick={fetchAvailableSlotsForReschedule}
                  disabled={fetchingSlots}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {fetchingSlots ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Fetching Slots...
                    </>
                  ) : (
                    "Get Available Slots"
                  )}
                </button>
              </div>
            )}

            {availableSlots.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select New Time Slot
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 border rounded-lg transition-all text-sm ${
                        selectedSlot?.start === slot.start
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                      }`}
                    >
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rescheduleDate && !fetchingSlots && availableSlots.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Click "Get Available Slots" to see available time slots for the selected date.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeRescheduleModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleAppointment}
                disabled={!selectedSlot || rescheduling}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {rescheduling ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Rescheduling...
                  </>
                ) : (
                  "Confirm Reschedule"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
