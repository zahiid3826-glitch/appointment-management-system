import React from "react";
import SidebarPatient from "../../components/layout/SidebarPatient";

// Mock data for appointments
const appointments = [
  {
    id: 1,
    doctorName: "Dr. John Doe",
    specialization: "Cardiology",
    date: "2024-12-08",
    time: "10:30 AM",
    status: "Upcoming",
  },
  {
    id: 2,
    doctorName: "Dr. Sarah Smith",
    specialization: "Dermatology",
    date: "2024-12-05",
    time: "1:00 PM",
    status: "Completed",
  },
  {
    id: 3,
    doctorName: "Dr. Emily Brown",
    specialization: "Pediatrics",
    date: "2024-12-01",
    time: "11:00 AM",
    status: "Completed",
  },
  {
    id: 4,
    doctorName: "Dr. John Doe",
    specialization: "Cardiology",
    date: "2024-12-10",
    time: "9:00 AM",
    status: "Upcoming",
  },
];

const PatientAppointments = () => {
  const today = new Date().toISOString().split("T")[0];

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.date >= today && appointment.status === "Upcoming"
  );

  const previousAppointments = appointments.filter(
    (appointment) => appointment.date < today || appointment.status === "Completed"
  );

  return (
    <div className="min-h-screen flex">
      <SidebarPatient activeTab="appointments" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

        {/* Upcoming Appointments Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">{appointment.doctorName}</h3>
                    <p className="text-sm text-gray-600">
                      {appointment.specialization}
                    </p>
                    <p className="text-sm">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                  <span className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm">
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming appointments.</p>
          )}
        </div>

        {/* Previous Appointments Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Previous Appointments</h2>
          {previousAppointments.length > 0 ? (
            <div className="space-y-4">
              {previousAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">{appointment.doctorName}</h3>
                    <p className="text-sm text-gray-600">
                      {appointment.specialization}
                    </p>
                    <p className="text-sm">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                  <span className="bg-gray-400 text-white px-4 py-1 rounded-lg text-sm">
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No previous appointments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;
