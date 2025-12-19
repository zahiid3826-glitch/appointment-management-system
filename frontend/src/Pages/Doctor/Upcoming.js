import React, { useState } from 'react';
import { Search, Calendar, Clock, Menu, Star } from 'lucide-react';
import { Card } from '../../components/common';
import SidebarDoc from '../../components/layout/SidebarDoc';
import Header from '../../components/layout/Header';
import useUser from '../../components/layout/useUser';
import axios from "axios";


const AppointmentListDoc = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const { username } = useUser();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  //fetch appointments ased on the selected date range
  const fetchAppointments = async () => {
    //const userId = localStorage.getItem('useridloggedin');
    const userId= username
    try {

      const params = { startdate: startTime, enddate: endTime, doctorId: userId };
      const response = await axios.get("http://localhost:3001/doctor/getappointments", {
        params
      });
      console.log(response.data)
      if (response.data) {
        setAppointments(response.data.appointments);
      } else {
        alert("Error in getting appointments")
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-72`}
      >
        <SidebarDoc
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab="upcoming"
        />
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-0 md:ml-72" : "ml-72"}`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="p-4 md:p-6 bg-white">
          <Card className="p-4 md:p-6 mb-6 bg-white shadow-md rounded-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchAppointments();
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-md border border-gray-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-md border border-gray-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </Card>
        </div>

        <main className="p-4 md:p-6">
          <Card className="p-4 md:p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
            <div className="space-y-3">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-[#F8F9FA] rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <img
                        src={appointment.imageUrl || "/api/placeholder/40/40"}
                        alt={appointment.doctorName}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                      <div>
                        <h3 className="font-medium">{appointment.patientid || "Unknown Patient"}</h3>
                        <div className="flex space-x-3 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(appointment.timestart).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(appointment.timestart).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-500">{appointment.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No appointments found for the selected range.</p>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AppointmentListDoc;