import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle, Clock,
  Bell, Search, Loader2
} from 'lucide-react';
import Sidebar from '../../components/layout/SidebarPatient';
import Header from '../../components/layout/Header';
import axios from 'axios';

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
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Dr. {appointment.doctorid}</p>
            <p className="text-sm text-gray-600">{formatDate(appointment.timestart)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">{formatTime(appointment.timestart)}</p>
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
            {appointment.status}
          </span>
        </div>
      </div>
    </div>
  );
};

const PatientDashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const completedVisits = allAppointments.filter(
    apt => apt.status.toLowerCase() === 'completed'
  ).length;

  const nextAppointment = upcomingAppointments.length > 0
    ? upcomingAppointments[0]
    : null;

  const nextAppointmentText = nextAppointment
    ? `${new Date(nextAppointment.timestart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date(nextAppointment.timestart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'No upcoming';

  const stats = [
    { icon: Calendar, title: 'Next Appointment', value: nextAppointmentText, color: 'blue' },
    { icon: CheckCircle, title: 'Completed Visits', value: completedVisits.toString(), color: 'green' },
    { icon: Clock, title: 'Upcoming', value: upcomingAppointments.length.toString(), color: 'yellow' },
  ];

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, Patient</p>
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

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-2 text-gray-600">Loading dashboard...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Appointment Overview</h2>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingAppointments.slice(0, 5).map((appointment) => (
                          <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Dr. {appointment.doctorid}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(appointment.timestart).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(appointment.timestart).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.location.href = '/patientDashboard/book-appointment'}
                        className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors text-left"
                      >
                        <Calendar className="inline h-5 w-5 mr-2" />
                        Book New Appointment
                      </button>
                      <button
                        onClick={() => window.location.href = '/patientDashboard/history'}
                        className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-left"
                      >
                        <Clock className="inline h-5 w-5 mr-2" />
                        View All Appointments
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
