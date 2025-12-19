import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/common/SelectComponent";
import { Calendar, Clock, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
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

const AppointmentHistory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    doctor: "all"
  });
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reschedule Modal States
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch appointments from API when component mounts
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3001/receptionist');
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setAppointments(data.appointments);
        setFilteredAppointments(data.appointments);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        setError('Failed to load appointments. Please try again later.');
        toast.error('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Get unique values for filter options based on fetched data
  const getUniqueValues = (key) => {
    const unique = appointments
      .map(apt => apt[key])
      .filter((value, index, self) => value && self.indexOf(value) === index);
    return unique;
  };

  const appointmentStatuses = ["all", ...getUniqueValues("status")];
  const doctors = ["all", ...getUniqueValues("doctorid")];

  // Handle filter changes
  const handleFilterChange = (value, filterType) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    let filtered = appointments;

    if (newFilters.status !== "all") {
      filtered = filtered.filter(apt => apt.status.toLowerCase() === newFilters.status.toLowerCase());
    }

    if (newFilters.doctor !== "all") {
      filtered = filtered.filter(apt => apt.doctorid === newFilters.doctor);
    }

    setFilteredAppointments(filtered);
  };

  // Function to handle rescheduling
  const handleReschedule = async () => {
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
      const response = await fetch(`http://localhost:3001/receptionist/reschedule/${currentAppointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newtimestart,
          newtimeend,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.message === 'Appointment rescheduled successfully.') {
        // Update the appointment in the local state
        const updatedAppointments = appointments.map(apt =>
          apt._id === currentAppointment._id
            ? { ...apt, timestart: newtimestart, timeend: newtimeend }
            : apt
        );
        setAppointments(updatedAppointments);
        setFilteredAppointments(updatedAppointments.filter(apt => {
          // Re-apply current filters
          if (filters.status !== "all" && apt.status.toLowerCase() !== filters.status.toLowerCase()) {
            return false;
          }
          if (filters.doctor !== "all" && apt.doctorid !== filters.doctor) {
            return false;
          }
          return true;
        }));
        toast.success('Appointment has been rescheduled successfully.');
        // Close the modal and reset states
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

  // Function to fetch available slots
  const fetchAvailableSlots = async (doctorId, date) => {
    setFetchingSlots(true);
    setAvailableSlots([]);
    setSelectedRescheduleSlot(null);

    try {
      const response = await fetch('http://localhost:3001/receptionist/getslotsofdoctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorid: doctorId,
          date,
        }),
      });

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

  // Function to determine status color
  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800"
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-72`}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab="history"
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-72' : ''} md:ml-72`}>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Appointment History</CardTitle>
              <div className="flex flex-wrap gap-4 mt-6">
                {/* Status Filter */}
                <Select 
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange(value, "status")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Doctor Filter */}
                <Select
                  value={filters.doctor}
                  onValueChange={(value) => handleFilterChange(value, "doctor")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Doctor Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor} value={doctor}>
                        {doctor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No appointments found matching the selected filters.
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-shrink-0">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{appointment.patientid}</h3>
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(appointment.timestart), 'MMM dd, yyyy')}</span>
                              <Clock className="w-4 h-4 ml-4" />
                              <span>{format(new Date(appointment.timestart), 'hh:mm a')}</span>
                            </div>
                            <div className="text-gray-600 mt-1">
                              Doctor: {appointment.doctorid}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                         
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && currentAppointment && (
        <Dialog>
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
                  min={format(new Date(), 'yyyy-MM-dd')} // Prevent selecting past dates
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
                      const formattedStart = format(start, 'hh:mm a');
                      const formattedEnd = format(end, 'hh:mm a');
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
                onClick={handleReschedule}
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
    </div>
  );
};

// Tabs Component within AppointmentHistory
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

export default AppointmentHistory;
