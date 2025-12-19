import React, { useState } from 'react';
import { 
  Calendar, CheckCircle, Heart, Clock, 
  Bell, Search, ChevronUp, ChevronDown 
} from 'lucide-react';
import Sidebar from '../../components/layout/SidebarPatient';
import Header from '../../components/layout/Header';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`bg-${color}-100 p-3 rounded-full`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
    <h3 className="mt-4 text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-sm text-gray-600 mt-1">{title}</p>
  </div>
);

const AppointmentCard = ({ appointment }) => {
  const statusColors = {
    Confirmed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{appointment.type}</p>
            <p className="text-sm text-gray-600">{appointment.date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">{appointment.time}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[appointment.status]}`}>
            {appointment.status}
          </span>
        </div>
      </div>
      <div className="mt-4 text-right">
        <button className="text-blue-600 hover:underline">View Prescription</button>
        {/* You can add another button for download if needed */}
        {/* <button className="ml-4 text-blue-600 hover:underline">Download Prescription</button> */}
      </div>
    </div>
  );
};

const PatientDashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');

  const healthMetrics = [
    { date: 'Mon', heartRate: 72, steps: 4500 },
    { date: 'Tue', heartRate: 76, steps: 5000 },
    { date: 'Wed', heartRate: 70, steps: 4800 },
    { date: 'Thu', heartRate: 74, steps: 5200 },
    { date: 'Fri', heartRate: 68, steps: 4300 },
    { date: 'Sat', heartRate: 75, steps: 5100 },
    { date: 'Sun', heartRate: 71, steps: 4600 },
  ];

  const upcomingAppointments = [
    { id: 1, type: 'Routine Check-up', date: 'Dec 6, 2024', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, type: 'Follow-up Visit', date: 'Dec 10, 2024', time: '02:00 PM', status: 'Pending' },
    { id: 3, type: 'Consultation', date: 'Dec 12, 2024', time: '09:30 AM', status: 'Confirmed' },
  ];

  const stats = [
    { icon: Calendar, title: 'Next Appointment', value: 'Dec 6, 10:00 AM', color: 'blue' },
    { icon: CheckCircle, title: 'Completed Visits', value: '12', color: 'green' },
    { icon: Heart, title: 'Avg Heart Rate', value: '72 bpm', color: 'red' },
    { icon: Clock, title: 'Daily Steps Avg', value: '4,800', color: 'yellow' },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className={`fixed top-0 left-0 h-full z-50 ${isSidebarOpen ? 'w-72' : 'w-0'} md:w-72 md:block`}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          activeTab={"dashboard"}
        />
      </div>
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-72' : ''} md:ml-72`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, Dr. Naveed Ahmed</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Health Metrics and Appointments Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Health Metrics */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Health Metrics</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Area type="monotone" dataKey="heartRate" stroke="#F87171" fill="#FEE2E2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Your Appointments</h2>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
