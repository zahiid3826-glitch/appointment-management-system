import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Calendar, CheckCircle, TrendingUp, 
  Clock, DollarSign, Activity, Bell, Search,
  ChevronUp, ChevronDown, Filter
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const StatCard = ({ icon: Icon, title, value, trend, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`bg-${color}-100 p-3 rounded-full`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'} 
        flex items-center`}>
        {trend >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {Math.abs(trend)}%
      </span>
    </div>
    <h3 className="mt-4 text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-sm text-gray-600 mt-1">{title}</p>
  </div>
);

const AppointmentCard = ({ appointment }) => {
  const statusColors = {
    Confirmed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Canceled: 'bg-red-100 text-red-800',
    Completed: 'bg-blue-100 text-blue-800',
    Scheduled: 'bg-indigo-100 text-indigo-800'
  };

  // Format the appointment time
  const startTime = new Date(appointment.timestart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(appointment.timeend).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // You might need to fetch patient and doctor details if you want to display names
  // For simplicity, we'll display patientid and doctorid
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{appointment.patientid}</p>
            <p className="text-sm text-gray-600">Doctor ID: {appointment.doctorid}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">{`${startTime} - ${endTime}`}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[appointment.status]}`}>
            {appointment.status}
          </span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    completedThisWeek: 0,
    totalPatients: 0,
    revenueThisWeek: 0
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Fetch appointments from the API
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:3001/receptionist');
        setAppointments(response.data.appointments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    // Filter appointments based on search query
    if (searchQuery.trim() === '') {
      setFilteredAppointments(appointments);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = appointments.filter(appointment =>
        appointment.patientid.toLowerCase().includes(lowercasedQuery) ||
        appointment.doctorid.toLowerCase().includes(lowercasedQuery) ||
        appointment.status.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredAppointments(filtered);
    }
  }, [searchQuery, appointments]);

  useEffect(() => {
    // Compute statistics based on appointments
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Assuming week starts on Sunday

    const todaysAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.timestart);
      return appointmentDate.toDateString() === today.toDateString();
    }).length;

    const completedThisWeek = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.timestart);
      return appointment.status === 'Completed' && appointmentDate >= startOfWeek && appointmentDate <= today;
    }).length;

    // Assuming each appointment represents a unique patient
    const totalPatients = new Set(appointments.map(app => app.patientid)).size;

    // Placeholder for revenue calculation
    // You need to have a revenue field in your appointment data or calculate it based on other factors
    // For demonstration, we'll assume each completed appointment contributes $100
    const revenueThisWeek = appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.timestart);
        return appointment.status === 'Completed' && appointmentDate >= startOfWeek && appointmentDate <= today;
      })
      .length * 100;

    setStats({
      todaysAppointments,
      completedThisWeek,
      totalPatients,
      revenueThisWeek
    });
  }, [appointments]);

  // Mock revenue data for the graph (can be replaced with actual data if available)
  const revenueData = [
    { date: 'Mon', revenue: 2400, patients: 24 },
    { date: 'Tue', revenue: 1800, patients: 18 },
    { date: 'Wed', revenue: 3000, patients: 30 },
    { date: 'Thu', revenue: 2600, patients: 26 },
    { date: 'Fri', revenue: 2800, patients: 28 },
    { date: 'Sat', revenue: 1500, patients: 15 },
    { date: 'Sun', revenue: 1200, patients: 12 }
  ];

  const statsArray = [
    { 
      icon: Calendar, 
      title: "Today's Appointments", 
      value: stats.todaysAppointments, 
      trend: 12, // You might want to compute actual trend based on previous data
      color: "blue" 
    },
    { 
      icon: CheckCircle, 
      title: "Completed This Week", 
      value: stats.completedThisWeek, 
      trend: 8, 
      color: "green" 
    },
    { 
      icon: Users, 
      title: "Total Patients", 
      value: stats.totalPatients, 
      trend: 15, 
      color: "purple" 
    },
    { 
      icon: DollarSign, 
      title: "Revenue This Week", 
      value: `$${stats.revenueThisWeek}K`, 
      trend: -3, 
      color: "yellow" 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 ${isSidebarOpen ? 'w-72' : 'w-0'} md:w-72 md:block transition-width duration-300`}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          activeTab={"dashboard"}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-72' : 'ml-0'} md:ml-72 transition-margin duration-300`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, Ms. Wilson</p>
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
              {statsArray.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Charts and Appointments Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedPeriod === 'week'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPeriod('week')}
                    >
                      Week
                    </button>
                    <button
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedPeriod === 'month'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPeriod('month')}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFF',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Filter className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-center text-gray-600">Loading appointments...</p>
                  ) : error ? (
                    <p className="text-center text-red-600">Failed to load appointments.</p>
                  ) : filteredAppointments.length === 0 ? (
                    <p className="text-center text-gray-600">No appointments found.</p>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
