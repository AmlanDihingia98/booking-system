'use client';

import { useState } from 'react';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  service: {
    name: string;
  };
  staff?: {
    full_name: string;
  };
  patient?: {
    full_name: string;
  };
}

interface CalendarProps {
  appointments: Appointment[];
  userRole?: 'patient' | 'staff' | 'admin';
}

export default function Calendar({ appointments, userRole = 'patient' }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get number of days in month
  const daysInMonth = lastDayOfMonth.getDate();

  // Get previous month's last few days
  const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointment_date === dateString);
  };

  // Generate calendar days
  const calendarDays = [];

  // Previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days = 42
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
    });
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((calendarDay, index) => {
          const dayAppointments = getAppointmentsForDate(calendarDay.date);
          const isTodayDate = isToday(calendarDay.date);

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border rounded-lg transition
                ${calendarDay.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isTodayDate ? 'border-blue-500 border-2' : 'border-gray-200'}
                hover:shadow-md
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${!calendarDay.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                    ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                  `}
                >
                  {calendarDay.day}
                </span>
                {dayAppointments.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                    {dayAppointments.length}
                  </span>
                )}
              </div>

              {/* Appointments */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map(apt => (
                  <div
                    key={apt.id}
                    className={`text-xs p-1.5 rounded ${getStatusColor(apt.status)} bg-opacity-10 border border-current border-opacity-20`}
                  >
                    <div className="font-semibold text-gray-900 truncate">
                      {apt.start_time}
                    </div>
                    <div className="text-gray-700 truncate">
                      {apt.service.name}
                    </div>
                    {userRole === 'staff' && apt.patient && (
                      <div className="text-gray-600 truncate text-[10px]">
                        {apt.patient.full_name}
                      </div>
                    )}
                    {userRole === 'patient' && apt.staff && (
                      <div className="text-gray-600 truncate text-[10px]">
                        {apt.staff.full_name}
                      </div>
                    )}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Confirmed</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Cancelled</span>
        </div>
      </div>
    </div>
  );
}
