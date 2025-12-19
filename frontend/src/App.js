import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReceptionDashboard from "./Pages/Reception/ReceptionDashboard"
import DoctorsList from "./Pages/Reception/SearchDoctors"
import Schedule from "./Pages/Reception/Schedule"
import History from "./Pages/Reception/History"
import Upcoming from "./Pages/Reception/Upcoming"
import Login from './Pages/All/Login';

import DoctorDashboard from "./Pages/Doctor/DoctorDashboard"
import CalendarDoc from './Pages/Doctor/DocSchedule';
import AppointmentListDoc from './Pages/Doctor/Upcoming';
import DocAvailability from './Pages/Doctor/DocAvailability';


//patient

import PatientDashboard from "./Pages/Patient/PatientDashboard";
import BookAppointment from "./Pages/Patient/BookAppointment"; 
import PatientAppointments from "./Pages/Patient/PatientAppointments";




const App = () => {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<ReceptionDashboard />} />
          <Route path="/dashboard" element={<ReceptionDashboard />} />
          <Route path="/doctorslist" element={<DoctorsList />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/history" element={<History />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/login" element={<Login />} />
        <Route path="/docDashboard" element = {<DoctorDashboard />} />
          <Route path="/docDashboard/dashboard" element={<DoctorDashboard />} />
          <Route path="/docDashboard/availaility" element={<DocAvailability />} />
          <Route path="/docDashboard/upcoming" element={<AppointmentListDoc />} />
          {/* <Route path="/docDashboard/calendar" element={<CalendarDoc />} /> */}
          //patient
        <Route path="/patientDashboard/dashboard" element={<PatientDashboard />} />
        <Route path="/patientDashboard/book-appointment" element={<BookAppointment />} />
        <Route path="/patientDashboard/history" element={<PatientAppointments />} />


        </Routes>
    </Router>
  );
};

export default App;
