import React, { useState, useEffect } from 'react';

const daysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const firstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const Calendar = ({
  value ,
  onChange,
  className,
  ...props
}) => {
  const [currentDate, setCurrentDate] = useState(value);

  useEffect(() => {
    setCurrentDate(value);
  }, [value]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();

  const numDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(year, month, day);
    setCurrentDate(newDate);
    onChange?.(newDate);
  };

  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-md shadow-md',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-t-md">
        <button
          className="p-2 -m-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          onClick={handlePrevMonth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <p className="text-lg font-medium">
          {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
        <button
          className="p-2 -m-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          onClick={handleNextMonth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px p-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div
            key={index}
            className="flex h-10 w-10 items-center justify-center bg-slate-50 text-xs font-medium text-slate-500"
          >
            {day}
          </div>
        ))}
        {Array(firstDay)
          .fill(0)
          .map((_, index) => (
            <div key={`empty-${index}`} className="h-10 w-10" />
          ))}
        {Array(numDays)
          .fill(0)
          .map((_, index) => (
            <button
              key={index + 1}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
                {
                  'bg-slate-950 text-white': index + 1 === today,
                  'text-slate-950': index + 1 !== today
                }
              )}
              onClick={() => handleDateClick(index + 1)}
            >
              {index + 1}
            </button>
          ))}
      </div>
    </div>
  );
};

export default Calendar;

