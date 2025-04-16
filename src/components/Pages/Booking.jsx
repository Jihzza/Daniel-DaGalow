// components/Pages/Booking.jsx
import React, { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWeekend,
  addMinutes,
} from "date-fns";
import {
  fetchBookings,
  createBooking,
  checkTimeSlotAvailability,
} from "../../services/bookingService";

function Booking() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Load booked events from Supabase on component mount
  useEffect(() => {
    loadBookedEvents();
  }, []);

  // Function to load booked events from Supabase
  const loadBookedEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await fetchBookings();

      if (error) throw error;

      setBookedEvents(data || []);
    } catch (error) {
      console.error("Error loading booked events:", error);
      setError("Failed to load booking information. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate available times (10 AM to 10 PM)
  const availableTimes = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 10;
    return `${hour}:00`;
  });

  // Check if a time slot is available
  const isTimeAvailable = (date, time) => {
    const eventDate = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    eventDate.setHours(hours, minutes, 0, 0);

    // Check 30 minutes before and 90 minutes after for conflicts
    const startCheck = addMinutes(eventDate, -30);
    const endCheck = addMinutes(eventDate, 90);

    return !bookedEvents.some((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (startCheck >= eventStart && startCheck < eventEnd) ||
        (endCheck > eventStart && endCheck <= eventEnd) ||
        (startCheck <= eventStart && endCheck >= eventEnd)
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create booking record
      const bookingData = {
        name: formData.name,
        email: formData.email,
        date: selectedDate,
        time: selectedTime,
      };

      // Save booking to Supabase
      const { data, error } = await createBooking(bookingData);

      if (error) throw error;

      // Reload bookings to show the new booking
      await loadBookedEvents();

      // Move to step 4 without resetting the form
      setStep(4);
    } catch (error) {
      console.error("Error submitting booking:", error);
      setError("Failed to create booking. Please try again later.");
      alert("There was an error with your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate days for the current month
  const generateMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Get days for previous and next month to fill the calendar grid
  const generateCalendarDays = () => {
    const days = generateMonthDays();
    const firstDay = days[0];
    const lastDay = days[days.length - 1];

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate how many days we need from the previous month
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Calculate how many days we need from the next month
    const daysFromNextMonth = 42 - (days.length + daysFromPrevMonth); // 42 = 6 weeks * 7 days

    const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) =>
      addDays(firstDay, -(daysFromPrevMonth - i))
    );

    const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) =>
      addDays(lastDay, i + 1)
    );

    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const changeMonth = (increment) => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + increment);
      return newMonth;
    });
  };

  // Display loading state
  if (isLoading && step === 1) {
    return (
      <section id="booking" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-black">
            Schedule Your Consultation
          </h2>
          <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl flex justify-center items-center h-64">
            <p className="text-white">Loading booking information...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-black text-center">
          Schedule Your Consultation
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          {/* Progress Steps */}
            <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 1
                    ? "bg-darkGold text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                1
              </div>
              <div
                className={`w-10 h-0.5 ${
                  step > 1 ? "bg-darkGold" : "bg-white/20"
                }`}
              ></div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 2
                    ? "bg-darkGold text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                2
              </div>
              <div
                className={`w-10 h-0.5 ${
                  step > 2 ? "bg-darkGold" : "bg-white/20"
                }`}
              ></div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 3
                    ? "bg-darkGold text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                3
              </div>
              <div
                className={`w-10 h-0.5 ${
                  step > 3 ? "bg-darkGold" : "bg-white/20"
                }`}
              ></div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 4
                    ? "bg-darkGold text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                4
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => changeMonth(-1)}
                  className="text-white font-bold p-2"
                >
                  ←
                </button>
                <h3 className="text-xl text-white text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="text-white font-bold p-2"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 max-w-3xl mx-auto">
                {/* Week day headers */}
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-white/60 text-sm py-2"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar days */}
                {generateCalendarDays().map((date, i) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isWeekendDay = isWeekend(date);
                  const hasEvents = bookedEvents.some(
                    (event) =>
                      isSameDay(new Date(event.start), date) &&
                      event.type === "main"
                  );

                  return (
                    <button
                      key={i}
                      onClick={() =>
                        !isWeekendDay &&
                        isCurrentMonth &&
                        handleDateSelect(date)
                      }
                      disabled={isWeekendDay || !isCurrentMonth || isLoading}
                      className={`
                        aspect-square rounded-full p-2 flex flex-col items-center justify-center text-sm relative
                        ${
                          !isCurrentMonth
                            ? "text-white/20 cursor-not-allowed"
                            : ""
                        }
                        ${isWeekendDay ? "bg-white/5 cursor-not-allowed" : ""}
                        ${
                          !isWeekendDay && isCurrentMonth
                            ? "hover:bg-darkGold hover:text-white cursor-pointer"
                            : ""
                        }
                        ${
                          isSameDay(date, selectedDate)
                            ? "bg-darkGold text-white"
                            : "bg-white/10"
                        }
                        ${isCurrentMonth && !isWeekendDay ? "text-white" : ""}
                      `}
                    >
                      <span className="text-xs text">
                        {format(date, "MMM")}
                      </span>
                      <span className="text-base font-bold">
                        {format(date, "d")}
                      </span>
                      {hasEvents && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-darkGold"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-xl text-white mb-2">Select a Time</h3>
                <p className="text-white/60">
                  {format(selectedDate, "EEEE, MMMM d")}
                </p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
                {availableTimes.map((time) => {
                  const isAvailable = isTimeAvailable(selectedDate, time);
                  return (
                    <button
                      key={time}
                      onClick={() => isAvailable && handleTimeSelect(time)}
                      disabled={!isAvailable || isLoading}
                      className={`
                        p-4 rounded-xl text-center transition-all
                        ${
                          !isAvailable
                            ? "bg-white/5 text-white/40 cursor-not-allowed"
                            : "hover:bg-darkGold hover:text-white cursor-pointer"
                        }
                        ${
                          time === selectedTime
                            ? "bg-darkGold text-white"
                            : "bg-white/10 text-white"
                        }
                      `}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="block mx-auto mt-6 text-white/60 hover:text-white"
              >
                ← Back to dates
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl text-white mb-2">Complete Booking</h3>
                <p className="text-white/60">
                  {format(selectedDate, "EEEE, MMMM d")} at {selectedTime}
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                  setStep(4);
                }}
                className="space-y-6"
              >
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="w-1/2 p-4 border-2 border-darkGold text-darkGold font-bold rounded-xl hover:bg-darkGold hover:text-white transition-all duration-300 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-1/2 bg-darkGold text-white font-bold p-4 rounded-xl hover:bg-yellow-500 transition-all duration-300 disabled:opacity-50 flex justify-center items-center"
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : (
                      <span>Confirm</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 rounded-xl p-6">
                {/* Chat Interface */}
                <div className="space-y-4">
                  {/* Bot Message */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 rounded-2xl">
                      <p className="text-white/90">
                        Hi {formData.name}! I'm looking forward to our consultation on {format(selectedDate, "EEEE, MMMM d")} at {selectedTime}. To make our session more productive, I'd like to know more about you. Feel free to share:
                      </p>
                      <ul className="mt-3 space-y-2 text-white/70">
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-darkGold mr-2"></span>
                          Your professional background
                        </li>
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-darkGold mr-2"></span>
                          Your financial goals and current situation
                        </li>
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-darkGold mr-2"></span>
                          Any specific concerns or questions
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* User Input Area */}
                  <div className="flex items-end space-x-3 ">
                    <div className="flex-1 relative">
                      <textarea
                        className="w-full p-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 resize-none"
                        rows={3}
                        placeholder="Type your message here..."
                      />
                      <button className="absolute right-3 bottom-3 p-2 bg-darkGold text-white rounded-xl hover:bg-yellow-500 transition-all duration-300">
                        <svg
                          className="w-5 h-5 rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .calendar-container .fc {
          background: transparent;
          border: none;
        }
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .calendar-container .fc-day-today {
          background: rgba(184, 134, 11, 0.2) !important;
        }
        .calendar-container .fc-event {
          background-color: #b8860b;
          border: none;
          margin: 1px 0;
          padding: 2px 4px;
        }
        .calendar-container .fc-event.buffer {
          background-color: rgba(211, 211, 211, 0.3);
          color: rgba(255, 255, 255, 0.6);
        }
        .calendar-container .fc-day-past {
          opacity: 0.5;
        }
        .calendar-container .fc-day-disabled {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </section>
  );
}

export default Booking;
