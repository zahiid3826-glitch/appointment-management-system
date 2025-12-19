import React from 'react';
import { Card, CardContent, Avatar } from '../common';
import { Star } from 'lucide-react';

const DoctorCard = ({ doctor, onBookAppointment }) => (
  <Card className="mb-4 bg-gradient-to-r from-blue-50 to-sky-100 shadow-md hover:shadow-lg transition-shadow w-full">
    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 w-full">
      <div className="flex items-center gap-4 w-full">
        <Avatar className="h-14 w-14 shrink-0">
          <img
            src={doctor.image || "/default-avatar.png"} // Placeholder image
            alt={`Avatar of ${doctor.name}`}
            className="h-full w-full rounded-full object-cover"
          />
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg truncate">{doctor.name}</h3>
          <p className="text-sm text-gray-700">{doctor.specialization}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="text-yellow-500 h-4 w-4" />
            <span className="text-sm font-medium text-gray-800">{doctor.rating}</span>
            <span className="text-sm text-gray-600 ml-2">{doctor.experience} Years Experience</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onBookAppointment(doctor)}
        className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors text-center"
        aria-label={`Book appointment with ${doctor.name}`}
      >
        Book Appointment
      </button>
    </CardContent>
  </Card>
);

export default DoctorCard;
