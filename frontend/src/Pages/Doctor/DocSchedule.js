import React, { useState } from 'react';
import { Card } from '../../components/common';
import SidebarDoc from '../../components/layout/SidebarDoc';
import Header from '../../components/layout/Header';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon,
  Clock,
  Users,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

const CalendarDoc = () => {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

  // Helper Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
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
    for (let i = 8; i < 20; i++) {
      slots.push(i);
    }
    return slots;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (hour) => {
    return `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };

  // Sample appointment data with more details
  const appointments = [
    {
      id: 1,
      title: 'John Smith',
      date: new Date(2024, 10, 14, 9, 0),
      duration: 60,
      doctor: 'Dr. Sarah Johnson',
      type: 'Check-up',
      status: 'confirmed',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Mary Johnson',
      date: new Date(2024, 11, 14, 11, 0),
      duration: 30,
      doctor: 'Dr. Sarah Johnson',
      type: 'Follow-up',
      status: 'pending',
      color: 'amber'
    }
  ];

  // Reusable components
  const StatusBadge = ({ status }) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-amber-100 text-amber-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:bg-gray-100 rounded-full">
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
              {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

  // Helper functions (keeping the existing ones)...

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
            className={`group min-h-28 p-2 border transition-all duration-200 
              ${day.isPadding ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'} 
              ${day.date.toDateString() === new Date().toDateString()
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200'}`}
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
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
          <div className={`text-2xl mt-1 ${
            date.toDateString() === new Date().toDateString()
              ? 'text-blue-600'
              : 'text-gray-900'
          }`}>
            {date.getDate()}
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
                apt.date.toDateString() === date.toDateString() &&
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
                    className="absolute inset-x-0 m-1 cursor-pointer"
                  >
                    <div className={`text-xs p-1 rounded bg-${apt.color}-100 text-${apt.color}-800 truncate shadow-sm`}>
                      {apt.title}
                    </div>
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
            apt.date.toDateString() === currentDate.toDateString() &&
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
                <AppointmentCard key={apt.id} appointment={apt} />
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return (
    <div className="bg-white  min-h-screen flex">
        <div className={`fixed top-0 left-0 h-full z-50 ${isSidebarOpen ? 'w-72' : 'w-0'} md:w-72 md:block`}>
        <SidebarDoc 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          activeTab={"schedule"}
        />
      </div>
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-72' : ''} md:ml-72`}>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto ">
      <Card className="p-6 shadow-lg">
        {/* Enhanced Calendar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
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
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
            
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Doctors</option>
                <option>Dr. Sarah Johnson</option>
                <option>Dr. John Doe</option>
              </select>
              <select className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Types</option>
                <option>Check-up</option>
                <option>Follow-up</option>
              </select>
              <select className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
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
    </div>
  );
};

export default CalendarDoc;