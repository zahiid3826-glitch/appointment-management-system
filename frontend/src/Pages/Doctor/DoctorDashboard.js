import React, { useState } from 'react';
import useUser from '../../components/layout/useUser';
import { 
  Users, Calendar, CheckCircle, TrendingUp, 
  Clock, DollarSign, Activity, Bell, Search,
  ChevronUp, ChevronDown, Filter
} from 'lucide-react';
import SidebarDoc from '../../components/layout/SidebarDoc';
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
    Cancelled: 'bg-red-100 text-red-800'
  };

  

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{appointment.patientName}</p>
            <p className="text-sm text-gray-600">{appointment.type}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">{appointment.time}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[appointment.status]}`}>
            {appointment.status}
          </span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {

  const { username } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');

  const revenueData = [
    { date: 'Mon', revenue: 2400, patients: 24 },
    { date: 'Tue', revenue: 1800, patients: 18 },
    { date: 'Wed', revenue: 3000, patients: 30 },
    { date: 'Thu', revenue: 2600, patients: 26 },
    { date: 'Fri', revenue: 2800, patients: 28 },
    { date: 'Sat', revenue: 1500, patients: 15 },
    { date: 'Sun', revenue: 1200, patients: 12 }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      time: "09:00 AM",
      type: "Check-up",
      status: "Confirmed"
    },
    {
      id: 2,
      patientName: "Michael Chen",
      time: "10:30 AM",
      type: "Follow-up",
      status: "Pending"
    },
    {
      id: 3,
      patientName: "Emma Davis",
      time: "11:45 AM",
      type: "Consultation",
      status: "Confirmed"
    },
    {
      id: 4,
      patientName: "James Wilson",
      time: "02:15 PM",
      type: "Emergency",
      status: "Pending"
    }
  ];

  const stats = [
    { icon: Calendar, title: "Today's Appointments", value: "24", trend: 12, color: "blue" },
    { icon: CheckCircle, title: "Completed This Week", value: "145", trend: 8, color: "green" },
    { icon: Users, title: "Total Patients", value: "1,234", trend: 15, color: "purple" },
    { icon: DollarSign, title: "Revenue This Week", value: "$24.5K", trend: -3, color: "yellow" }
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

         
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
    <div className={`fixed top-0 left-0 h-full z-50 ${isSidebarOpen ? 'w-72' : 'w-0'} md:w-72 md:block`}>
        <SidebarDoc 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          activeTab={"dashboard"}
        />
      </div>
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-72' : ''} md:ml-72`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back, {username}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
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
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Patient Demographics</h2>
            <div className="space-y-6">
              {[
                { age: '20-30', percentage: 45 },
                { age: '31-50', percentage: 30 },
                { age: '51+', percentage: 25 }
              ].map((item) => (
                <div key={item.age} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Age {item.age}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Treatment Distribution</h2>
            <div className="space-y-6">
              {[
                { type: 'Check-ups', percentage: 45, color: 'purple' },
                { type: 'Treatments', percentage: 30, color: 'blue' },
                { type: 'Consultations', percentage: 25, color: 'green' }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className={`h-5 w-5 text-${item.color}-500 mr-2`} />
                    <span className="text-gray-600">{item.type}</span>
                  </div>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Metrics</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">This Month</span>
                </div>
                <span className="font-medium">$24,500</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Last Month</span>
                </div>
                <span className="font-medium">$22,300</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Growth</span>
                  <span className="text-green-600 font-medium">+9.87%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
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