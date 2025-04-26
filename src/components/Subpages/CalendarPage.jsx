import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data.map(evt => ({ id: evt.id, date: new Date(evt.appointment_date) })));
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const hasEventOn = (date) => {
    return events.some(evt => isSameDay(evt.date, date));
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
    <div className="max-w-4xl mx-auto p-8 h-screen text-white">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(prev => addMonths(prev, -1))} className="text-xl">←</button>
        <h2 className="text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="text-xl">→</button>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="text-center font-medium">{d}</div>
          ))}

          {calendar.map((date, idx) => (
            <div
              key={idx}
              className={`p-2 text-center border rounded ${isSameMonth(date, currentMonth) ? '' : 'opacity-50'}`}
            >
              <span className="block">{format(date, 'd')}</span>
              {hasEventOn(date) && <span className="mt-1 inline-block w-2 h-2 bg-darkGold rounded-full"></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
