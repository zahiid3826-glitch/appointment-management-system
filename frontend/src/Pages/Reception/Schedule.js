// src/Pages/Reception/Schedule.js

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon,
  Clock,
  Users,
  Search,
  Filter,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/common';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { format } from 'date-fns';

// Extracted StatusBadge Component
const StatusBadge = ({ status }) => {
  const colors = {
    canceled: 'red',
    completed: 'green',
    scheduled: 'blue'
  };
  
  const color = colors[status.toLowerCase()] || 'gray';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Extracted AppointmentCard Component
const AppointmentCard = ({ appointment, onReschedule }) => (
  <div className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onReschedule(appointment)}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
    </div>
    <div className="flex items-start space-x-3">
      <div className={`w-1 h-full rounded-full bg-${appointment.color}-500`} />
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{appointment.title}</h4>
        <div className="mt-1 space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {format(appointment.date, 'hh:mm a')}
            <span className="mx-1">•</span>
            {appointment.duration} mins
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {appointment.doctor}
          </div>
        </div>
        <div className="mt-2">
          <StatusBadge status={appointment.status} />
        </div>
      </div>
    </div>
  </div>
);

const Calendar = () => {
  // State Variables
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  
  const [filters, setFilters] = useState({
    status: 'all',
    doctor: 'all'
  });
  
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

  // Day Detail Modal States
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayAppointments, setDayAppointments] = useState([]);

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
        // Map API data to UI structure
        const mappedAppointments = data.appointments.map(appt => ({
          id: appt._id,
          title: `Patient ID: ${appt.patientid}`,
          date: new Date(appt.timestart),
          duration: (new Date(appt.timeend) - new Date(appt.timestart)) / (1000 * 60), // duration in minutes
          doctor: appt.doctorid,
          status: appt.status,
          color: getStatusColor(appt.status) // Assign color based on status
        }));
        setAppointments(mappedAppointments);
        setFilteredAppointments(mappedAppointments);
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

  const appointmentStatuses = ['all', ...getUniqueValues('status')];
  const doctors = ['all', ...getUniqueValues('doctor')];

  // Handle filter changes
  const handleFilterChange = (value, filterType) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    let filtered = appointments;

    if (newFilters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status.toLowerCase() === newFilters.status.toLowerCase());
    }

    if (newFilters.doctor !== 'all') {
      filtered = filtered.filter(apt => apt.doctor === newFilters.doctor);
    }

    setFilteredAppointments(filtered);
  };

  // Function to determine status color
  function getStatusColor(status) {
    const colors = {
      canceled: 'red',
      completed: 'green',
      scheduled: 'blue'
    };
    return colors[status.toLowerCase()] || 'gray';
  }

  // Helper Functions for Calendar
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // Months are zero-indexed

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = [];

    // Add padding days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      daysInMonth.unshift({
        date: prevDate,
        isPadding: true
      });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysInMonth.push({
        date: new Date(year, month, i),
        isPadding: false
      });
    }

    return daysInMonth;
  };

  const getWeekDays = (date) => {
    const week = [];
    const current = new Date(date);
    current.setDate(current.getDate() - current.getDay());

    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return week;
  };

  const getHourSlots = () => {
    const slots = [];
    for (let i = 8; i < 20; i++) { // 8 AM to 8 PM
      slots.push(i);
    }
    return slots;
  };

  const formatDate = (date) => {
    return format(date, 'MMMM yyyy');
  };

  const formatTime = (hour) => {
    return format(new Date().setHours(hour, 0, 0, 0), 'hh:mm a');
  };

  const getAppointmentsForDate = (date) => {
    return filteredAppointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };

  // Handle Reschedule Appointment
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
      const response = await fetch(`http://localhost:3001/receptionist/reschedule/${currentAppointment.id}`, {
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
          apt.id === currentAppointment.id
            ? { ...apt, date: new Date(newtimestart), duration: (new Date(newtimeend) - new Date(newtimestart)) / (1000 * 60) }
            : apt
        );
        setAppointments(updatedAppointments);

        // Re-apply filters
        let filtered = updatedAppointments;
        if (filters.status !== 'all') {
          filtered = filtered.filter(apt => apt.status.toLowerCase() === filters.status.toLowerCase());
        }
        if (filters.doctor !== 'all') {
          filtered = filtered.filter(apt => apt.doctor === filters.doctor);
        }
        setFilteredAppointments(filtered);

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

  // Fetch available slots based on doctor and date
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
          date, // Expected format: 'YYYY-MM-DD'
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

  // Handle Day Box Click
  const handleDayClick = (day) => {
    setSelectedDay(day.date);
    const appts = getAppointmentsForDate(day.date);
    setDayAppointments(appts);
    setIsDayModalOpen(true);
  };

  // Reusable components
  // StatusBadge and AppointmentCard have been moved outside the Calendar component

  // Calendar Views
  const MonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center font-medium text-gray-600">
          {day}
        </div>
      ))}
      {getDaysInMonth(currentDate).map((day, index) => {
        const appts = getAppointmentsForDate(day.date);
        return (
          <div
            key={index}
            onClick={() => !day.isPadding && handleDayClick(day)}
            className={`group min-h-28 p-2 border transition-all duration-200 
              ${day.isPadding ? 'bg-gray-50 cursor-default' : 'bg-white hover:bg-blue-50 cursor-pointer'} 
              ${day.date.toDateString() === new Date().toDateString()
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200'}
              relative`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-medium text-sm ${
                day.isPadding ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {day.date.getDate()}
              </span>
              {appts.length > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {appts.length}
                </span>
              )}
            </div>
            <div className="mt-1 space-y-1">
              {appts.slice(0, 2).map(apt => (
                <div
                  key={apt.id}
                  className={`text-xs px-2 py-1 rounded truncate bg-${apt.color}-100 text-${apt.color}-800`}
                >
                  {apt.title}
                </div>
              ))}
              {appts.length > 2 && (
                <div className="text-xs text-gray-500 px-2">
                  +{appts.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const WeekView = () => (
    <div className="grid grid-cols-8 gap-1">
      <div className="sticky left-0 bg-white"></div>
      {getWeekDays(currentDate).map((date, index) => (
        <div key={index} className={`text-center p-2 ${
          date.toDateString() === new Date().toDateString()
            ? 'bg-blue-50 rounded-t-lg'
            : ''
        }`}>
          <div className="font-medium text-gray-600">
            {format(date, 'EEE')}
          </div>
          <div className={`text-2xl mt-1 ${
            date.toDateString() === new Date().toDateString()
              ? 'text-blue-600'
              : 'text-gray-900'
          }`}>
            {format(date, 'd')}
          </div>
        </div>
      ))}
      {getHourSlots().map(hour => (
        <React.Fragment key={hour}>
          <div className="sticky left-0 bg-white text-right pr-2 py-2 text-sm text-gray-600">
            {formatTime(hour)}
          </div>
          {getWeekDays(currentDate).map((date, index) => {
            const dayAppointments = appointments.filter(
              apt => 
                format(apt.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
                apt.date.getHours() === hour
            );
            return (
              <div
                key={`${hour}-${index}`}
                className="relative border border-gray-200 hover:bg-blue-50 transition-colors duration-200"
              >
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className={`absolute inset-x-0 m-1 cursor-pointer text-xs p-1 rounded bg-${apt.color}-100 text-${apt.color}-800 shadow-sm`}
                  >
                    {apt.title}
                  </div>
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  const DayView = () => (
    <div className="space-y-2">
      {getHourSlots().map(hour => {
        const hourAppointments = appointments.filter(
          apt => 
            format(apt.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd') &&
            apt.date.getHours() === hour
        );

        return (
          <div key={hour} className="grid grid-cols-6 gap-4">
            <div className="text-right">
              <span className="inline-block bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-600">
                {formatTime(hour)}
              </span>
            </div>
            <div className="col-span-5 space-y-2">
              {hourAppointments.map(apt => (
                <AppointmentCard 
                  key={apt.id} 
                  appointment={apt} 
                  onReschedule={handleRescheduleAppointment} 
                />
              ))}
              {hourAppointments.length === 0 && (
                <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-colors duration-200 cursor-pointer"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Handle reschedule from AppointmentCard
  const handleRescheduleAppointment = (appointment) => {
    setCurrentAppointment(appointment);
    setIsRescheduleModalOpen(true);
    setRescheduleDate('');
    setAvailableSlots([]);
    setSelectedRescheduleSlot(null);
  };

  return (
    <div className="bg-white min-h-screen flex">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-72`}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab="schedule"
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

        {/* Calendar Card */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="p-6 shadow-lg">
            {/* Enhanced Calendar Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
              <div className="flex items-center space-x-4">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
                    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
                    else newDate.setDate(newDate.getDate() - 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Current View Title */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CalIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {formatDate(currentDate)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {appointments.length} appointments this {view}
                    </p>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
                    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
                    else newDate.setDate(newDate.getDate() + 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
             
                
                {/* Toggle Filters */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* View Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {['month', 'week', 'day'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-4 py-2 rounded-md transition-all duration-200 ${
                        view === v
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Filter */}
                  <select
                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.status}
                    onChange={(e) => handleFilterChange(e.target.value, 'status')}
                  >
                    {appointmentStatuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>

                  {/* Doctor Filter */}
                  <select
                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.doctor}
                    onChange={(e) => handleFilterChange(e.target.value, 'doctor')}
                  >
                    {doctors.map(doctor => (
                      <option key={doctor} value={doctor}>
                        {doctor === 'all' ? 'All Doctors' : doctor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Calendar Content with smooth transitions */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <div className="min-w-full transition-all duration-300">
                {view === 'month' && <MonthView />}
                {view === 'week' && <WeekView />}
                {view === 'day' && <DayView />}
              </div>
            </div>
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
                  onClick={() => fetchAvailableSlots(currentAppointment.doctor, rescheduleDate)}
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

      {/* Day Detail Modal */}
      {isDayModalOpen && selectedDay && (
        <Dialog>
          <DialogContent className="max-w-lg mx-4 w-full sm:w-auto">
            <DialogHeader>
              <DialogTitle>Appointments on {format(selectedDay, 'MMMM dd, yyyy')}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {dayAppointments.length === 0 ? (
                <p className="text-gray-500">No appointments for this day.</p>
              ) : (
                dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-lg">{apt.title}</h4>
                        <p className="text-sm text-gray-600">{apt.doctor}</p>
                        <p className="text-sm text-gray-600">
                          {format(apt.date, 'hh:mm a')} - {apt.duration} mins
                        </p>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                    <div className="mt-2 flex space-x-2">
                      {apt.status.toLowerCase() === 'scheduled' && (
                        <>
                          <button
                            onClick={() => {
                              setCurrentAppointment(apt);
                              setIsRescheduleModalOpen(true);
                              setRescheduleDate('');
                              setAvailableSlots([]);
                              setSelectedRescheduleSlot(null);
                              setIsDayModalOpen(false); // Close the day modal
                            }}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors"
                          >
                            Reschedule
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors">
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
                                  onClick={() => {
                                    // Implement cancel functionality here
                                    toast.info('Cancel functionality not implemented.');
                                    setIsDayModalOpen(false);
                                  }}
                                  className="bg-red-500 hover:bg-red-600 flex items-center justify-center"
                                >
                                  Yes, cancel
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter className="flex justify-end">
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Calendar;
