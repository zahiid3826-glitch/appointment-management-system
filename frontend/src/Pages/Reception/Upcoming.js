import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Clock,
  Star,
  Loader2,
  Menu,
} from 'lucide-react';
import { Card } from '../../components/common';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../components/common/DialogComponent';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/common/Alerts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Optional: Import DatePicker if using a library
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

const AppointmentList = () => {
  // State Variables
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Scheduled');
  const [cancelling, setCancelling] = useState(false);
  const [markingAsDone, setMarkingAsDone] = useState(false);

  // Rescheduling State Variables
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);

  // Toggle Sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Helper Function: Get Current Month Range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Months are zero-indexed

    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    return { startDate, endDate };
  };

  // Categorize Appointments
  const categorizeAppointments = () => {
    const cancelled = appointments.filter(
      (appt) => appt.status.toLowerCase() === 'canceled'
    );
    const scheduled = appointments.filter(
      (appt) => appt.status.toLowerCase() === 'scheduled'
    );
    const completed = appointments.filter(
      (appt) => appt.status.toLowerCase() === 'completed'
    );

    return { cancelled, scheduled, completed };
  };

  // Destructure Categorized Appointments
  const { cancelled, scheduled, completed } = categorizeAppointments();

  // Fetch Appointments on Mount
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getCurrentMonthRange();
      const apiUrl = `http://localhost:3001/receptionist/range?startdate=${startDate}&enddate=${endDate}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setAppointments(data.appointments);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Handle Cancel Appointment
  const handleCancel = async (appointmentId) => {
    setCancelling(true); // Start cancellation process

    try {
      const response = await fetch(
        `http://localhost:3001/receptionist/cancel/${appointmentId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.message === 'Appointment cancelled successfully.') {
        // Update the appointment's status in the local state
        const updatedAppointments = appointments.map((appt) =>
          appt._id === appointmentId
            ? { ...appt, status: 'Canceled' }
            : appt
        );
        setAppointments(updatedAppointments);
        toast.success('Appointment has been cancelled successfully.');
      } else {
        throw new Error(result.message || 'Failed to cancel appointment.');
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      toast.error(`Failed to cancel appointment. ${err.message}`);
    } finally {
      setCancelling(false); // End cancellation process
    }
  };

  // Handle Mark as Completed
  const handleComplete = async (appointmentId) => {
    setMarkingAsDone(true); // Start marking as done process

    try {
      const response = await fetch(
        `http://localhost:3001/receptionist/markAsDoneAppointment/${appointmentId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.message === 'Appointment marked as completed.') {
        // Update the appointment's status in the local state
        const updatedAppointments = appointments.map((appt) =>
          appt._id === appointmentId
            ? { ...appt, status: 'Completed' }
            : appt
        );
        setAppointments(updatedAppointments);
        toast.success('Appointment marked as completed.');
      } else {
        throw new Error(result.message || 'Failed to mark appointment as completed.');
      }
    } catch (err) {
      console.error('Failed to mark appointment as completed:', err);
      toast.error(`Failed to mark appointment as completed. ${err.message}`);
    } finally {
      setMarkingAsDone(false); // End marking as done process
    }
  };

  // Handle Reschedule Appointment
  const handleReschedule = async (appointmentId) => {
    if (!rescheduleDate) {
      toast.error('Please select a date.');
      return;
    }

    if (!selectedRescheduleSlot) {
      toast.error('Please select a time slot.');
      return;
    }

    setRescheduling(true); // Start rescheduling process

    const newtimestart = new Date(selectedRescheduleSlot.start).toISOString();
    const newtimeend = new Date(selectedRescheduleSlot.end).toISOString();

    try {
      const response = await fetch(
        `http://localhost:3001/receptionist/reschedule/${appointmentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newtimestart,
            newtimeend,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.message === 'Appointment rescheduled successfully.') {
        // Update the appointment's time in the local state
        const updatedAppointments = appointments.map((appt) =>
          appt._id === appointmentId
            ? { ...appt, timestart: newtimestart, timeend: newtimeend }
            : appt
        );
        setAppointments(updatedAppointments);
        toast.success('Appointment has been rescheduled successfully.');
        // Close the modal and reset reschedule state
        setIsRescheduleModalOpen(false);
        setRescheduleDate('');
        setAvailableSlots([]);
        setSelectedRescheduleSlot(null);
        setCurrentAppointment(null);
      } else {
        throw new Error(result.message || 'Failed to reschedule appointment.');
      }
    } catch (err) {
      console.error('Failed to reschedule appointment:', err);
      toast.error(`Failed to reschedule appointment. ${err.message}`);
    } finally {
      setRescheduling(false); // End rescheduling process
    }
  };

  // Fetch Available Slots
  const fetchAvailableSlots = async (doctorId, date) => {
    setFetchingSlots(true);
    setAvailableSlots([]);
    setSelectedRescheduleSlot(null);

    try {
      const response = await fetch(
        'http://localhost:3001/receptionist/getslotsofdoctor',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorid: doctorId,
            date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.availableSlots && data.availableSlots.length > 0) {
        setAvailableSlots(data.availableSlots);
      } else {
        setAvailableSlots([]);
        toast.info('No available slots found for the selected date.');
      }
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
      toast.error(`Failed to fetch available slots. ${err.message}`);
    } finally {
      setFetchingSlots(false);
    }
  };

  // Render Appointments Based on Category
  const renderAppointments = (appointments) => {
    if (appointments.length === 0) {
      return <p className="text-gray-500">No appointments in this category.</p>;
    }

    return appointments
      .filter((appointment) => {
        // Implement search filtering if needed
        if (searchQuery.trim() === '') return true;
        const query = searchQuery.toLowerCase();
        return (
          appointment.doctorid.toLowerCase().includes(query) ||
          appointment.patientid.toLowerCase().includes(query) ||
          new Date(appointment.timestart).toLocaleDateString().includes(query) ||
          new Date(appointment.timestart).toLocaleTimeString().includes(query)
        );
      })
      .map((appointment) => (
        <div
          key={appointment._id}
          className="bg-[#F8F9FA] rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 shadow-sm border border-gray-100"
        >
          {/* Appointment Info */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <img
              src="/api/placeholder/40/40" // Replace with actual image URL if available
              alt={`Doctor ${appointment.doctorid}`}
              className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"
            />
            <div>
              <h3 className="font-medium text-sm md:text-base truncate">
                {`Doctor ID: ${appointment.doctorid}`}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 truncate">
                {`Patient ID: ${appointment.patientid}`}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs md:text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {new Date(appointment.timestart).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {new Date(appointment.timestart).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{appointment.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {/* Reschedule Button */}
            {appointment.status.toLowerCase() === 'scheduled' && (
              <button
                onClick={() => {
                  setCurrentAppointment(appointment); // Set the current appointment
                  setIsRescheduleModalOpen(true); // Open the reschedule modal
                  setRescheduleDate('');
                  setAvailableSlots([]);
                  setSelectedRescheduleSlot(null);
                }}
                className="w-full sm:w-auto bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
              >
                Reschedule
              </button>
            )}

            {/* Cancel Button */}
            {appointment.status.toLowerCase() === 'scheduled' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                    Cancel
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep it</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancel(appointment._id)}
                      className="bg-red-500 hover:bg-red-600 flex items-center justify-center"
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Cancelling...
                        </>
                      ) : (
                        'Yes, cancel appointment'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Complete Button */}
            {appointment.status.toLowerCase() === 'scheduled' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                    Mark as Completed
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark as Completed</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark this appointment as completed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep it</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleComplete(appointment._id)}
                      className="bg-green-500 hover:bg-green-600 flex items-center justify-center"
                      disabled={markingAsDone}
                    >
                      {markingAsDone ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Marking...
                        </>
                      ) : (
                        'Yes, mark as completed'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-72`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab="upcoming"
        />
      </div>

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && currentAppointment && (
        <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
          <DialogContent className="max-w-lg mx-4 w-full sm:w-auto">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {/* Select New Date */}
              <div className="mb-4">
                <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Select New Date
                </label>
                <input
                  type="date"
                  id="reschedule-date"
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setAvailableSlots([]);
                    setSelectedRescheduleSlot(null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                />
              </div>

              {/* Fetch Slots Button */}
              <div className="mb-4">
                <button
                  onClick={() => fetchAvailableSlots(currentAppointment.doctorid, rescheduleDate)}
                  className={`w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center ${
                    fetchingSlots || !rescheduleDate ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={fetchingSlots || !rescheduleDate}
                >
                  {fetchingSlots ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                  {fetchingSlots ? 'Fetching Slots...' : 'Get Available Slots'}
                </button>
              </div>

              {/* Available Slots */}
              {availableSlots.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Slots
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => {
                      const start = new Date(slot.start);
                      const end = new Date(slot.end);
                      const formattedStart = start.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const formattedEnd = end.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const isSelected =
                        selectedRescheduleSlot &&
                        selectedRescheduleSlot.start === slot.start &&
                        selectedRescheduleSlot.end === slot.end;

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedRescheduleSlot(slot)}
                          className={`border rounded-md p-2 ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {formattedStart} - {formattedEnd}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Available Slots Message */}
              {rescheduleDate && !fetchingSlots && availableSlots.length === 0 && (
                <p className="text-gray-500">No available slots found for the selected date.</p>
              )}
            </div>
            <DialogFooter className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setRescheduleDate('');
                  setAvailableSlots([]);
                  setSelectedRescheduleSlot(null);
                  setCurrentAppointment(null); // Reset the current appointment
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReschedule(currentAppointment._id)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                disabled={!selectedRescheduleSlot || rescheduling}
              >
                {rescheduling ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Rescheduling...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-0 md:ml-72' : 'ml-0 md:ml-72'
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />

        <main className="p-4 md:p-6">
          <Card className="p-4 md:p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">My Appointments</h2>

        
            {/* Tabs */}
            <div className="overflow-x-auto">
              <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Loading Indicator */}
            {loading && <p className="text-gray-500">Loading appointments...</p>}

            {/* Error Message */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Appointments List */}
            {!loading && !error && (
              <div className="space-y-3">
                {activeTab === 'Scheduled' && renderAppointments(scheduled)}
                {activeTab === 'Cancelled' && renderAppointments(cancelled)}
                {activeTab === 'Completed' && renderAppointments(completed)}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

// Tabs Component within AppointmentList
const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = ['Scheduled', 'Cancelled', 'Completed'];

  return (
    <div className="flex space-x-4 border-b mb-4 whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-2 ${
            activeTab === tab
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default AppointmentList;
