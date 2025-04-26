import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("id, appointment_date, name, duration_minutes");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        // Transform data for better display
        const formattedEvents = data.map(evt => ({
          id: evt.id,
          date: new Date(evt.appointment_date),
          title: evt.name || "Appointment",
          duration: evt.duration_minutes || 60,
          time: format(new Date(evt.appointment_date), "h:mm a")
        }));
        setEvents(formattedEvents);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dayEvents = events.filter(evt => isSameDay(evt.date, selectedDate));
      setSelectedEvents(dayEvents);
    } else {
      setSelectedEvents([]);
    }
  }, [selectedDate, events]);

  const hasEventOn = (date) => {
    return events.some(evt => isSameDay(evt.date, date));
  };

  const countEventsOn = (date) => {
    return events.filter(evt => isSameDay(evt.date, date)).length;
  };

  // Build calendar grid for display: show 42 days (6 weeks)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay(); // 0 (Sun) - 6
  const daysFromPrev = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const prevDays = [];
  for (let i = daysFromPrev; i > 0; i--) {
    prevDays.push(addDays(monthStart, -i));
  }

  const totalCells = 42;
  const daysFromNext = totalCells - (prevDays.length + days.length);
  const nextDays = [];
  const lastDay = days[days.length - 1];
  for (let i = 1; i <= daysFromNext; i++) {
    nextDays.push(addDays(lastDay, i));
  }

  const calendar = [...prevDays, ...days, ...nextDays];

  return (
    <div className="min-h-screen py-6 px-4 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">Calendar</h1>
        
        <div className="bg-gentleGray rounded-xl shadow-md p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setCurrentMonth(prev => addMonths(prev, -1))} 
              className="bg-oxfordBlue text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-black">{format(currentMonth, "MMMM yyyy")}</h2>
            <button 
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} 
              className="bg-oxfordBlue text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <div key={d} className="text-center font-medium text-oxfordBlue py-2">{d}</div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendar.map((date, idx) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isCurrentDay = isToday(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const hasEvent = hasEventOn(date);
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        h-14 p-1 border rounded-lg transition-all cursor-pointer flex flex-col items-center justify-between
                        ${isCurrentMonth ? 'hover:border-darkGold hover:shadow-md' : 'text-gray-400 bg-gray-50'}
                        ${isSelected ? 'border-darkGold bg-darkGold/10 shadow-md' : 'border-gray-200'}
                        ${isCurrentDay ? 'ring-2 ring-oxfordBlue' : ''}
                      `}
                    >
                      {/* Day Number - Centered */}
                      <div className="w-full flex-1 flex items-center justify-center">
                        <span className={`
                          font-medium text-center
                          ${isCurrentDay ? 'text-oxfordBlue' : ''}
                          ${isSelected ? 'text-oxfordBlue' : ''}
                        `}>
                          {format(date, 'd')}
                        </span>
                      </div>
                      
                      {/* Single Event Indicator */}
                      <div className="w-full flex justify-center items-center h-4">
                        {hasEvent && (
                          <div className="w-2 h-2 rounded-full bg-darkGold"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-oxfordBlue mb-4">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map(event => (
                    <div key={event.id} className="bg-gentleGray p-4 rounded-lg border-l-4 border-darkGold">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-oxfordBlue">{event.title}</h4>
                        <span className="bg-oxfordBlue text-white px-2 py-1 rounded text-xs">{event.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Duration: {event.duration} minutes</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No appointments scheduled for this day.</p>
              )}
              
              <button 
                className="mt-4 bg-oxfordBlue text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}