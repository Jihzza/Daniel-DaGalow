import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { AuthModalContext } from "../../App";
import { useContext } from "react";
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
  isBefore,
  addMonths,
  setHours,
  setMinutes,
  parseISO,
} from "date-fns";
import { fetchBookings } from "../../services/bookingService";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// Shared StepIndicator
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 mt-6 md:mt-8">
      {Array.from({ length: stepCount }).map((_, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;

        return (
          <React.Fragment key={stepNum}>
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              disabled={stepNum > currentStep}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 transition-colors text-sm md:text-base ${
                isActive
                  ? "bg-darkGold border-darkGold text-white transform scale-110"
                  : "bg-white/20 border-white/50 text-white/80 hover:border-darkGold hover:text-white"
              } ${
                stepNum > currentStep
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              aria-label={`Go to step ${stepNum}`}
            >
              {stepNum}
            </button>
            {idx < stepCount - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 md:mx-2 transition-colors ${
                  currentStep > stepNum ? "bg-darkGold" : "bg-white/20"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Combined Step: Date, Duration, and Time Selection
function CombinedSelectionStep({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
  bookedEvents,
  minDate,
  selectedDuration,
  onSelectDuration,
  availableDurations,
  selectedTime,
  onTimeSelection,
  availableTimeSlots,
}) {
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const prevMonthDays = [];
  const nextMonthDays = [];
  const firstDayOfWeek = days[0].getDay();
  const daysFromPrev = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = daysFromPrev; i > 0; i--)
    prevMonthDays.push(addDays(days[0], -i));
  const totalCells = 42;
  const daysFromNext = totalCells - (days.length + prevMonthDays.length);
  for (let i = 1; i <= daysFromNext; i++)
    nextMonthDays.push(addDays(days[days.length - 1], i));
  const calendar = [...prevMonthDays, ...days, ...nextMonthDays];

  // Format duration for display
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes % 60 === 0) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  // Calculate end time
  const calculateEndTime = (timeString, durationMinutes) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = addMinutes(startTime, durationMinutes);
    return format(endTime, "h:mm a");
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header - Modern Design */}
      <div className="bg-oxfordBlue/90 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onChangeMonth(-1)}
            className="text-white hover:text-darkGold p-2 rounded-full hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-50"
            aria-label="Previous month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h3 className="text-xl sm:text-2xl text-white font-bold tracking-wide">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button
            onClick={() => onChangeMonth(1)}
            className="text-white hover:text-darkGold p-2 rounded-full hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-50"
            aria-label="Next month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-center py-2 text-darkGold font-semibold text-xs sm:text-sm"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days - Modern Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendar.map((date, i) => {
            const inMonth = isSameMonth(date, currentMonth);
            const weekend = isWeekend(date);
            const tooSoon = isBefore(date, minDate);
            const selected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const disabled = !inMonth || weekend || tooSoon;
            const hasEvent =
              bookedEvents &&
              bookedEvents.some((event) => isSameDay(event.date, date));

            return (
              <button
                key={i}
                onClick={() => !disabled && onSelectDate(date)}
                disabled={disabled}
                className={`
                  group relative aspect-square rounded-lg flex flex-col items-center justify-center
                  transition-all duration-300 text-center p-1
                  ${
                    selected
                      ? "bg-darkGold text-white font-bold shadow-lg transform scale-105 z-10"
                      : inMonth && !disabled
                      ? "bg-white/10 text-white hover:bg-darkGold/40"
                      : "bg-white/5 text-white/40"
                  }
                  ${
                    isToday && !selected
                      ? "ring-2 ring-darkGold ring-opacity-70"
                      : ""
                  }
                  ${
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer hover:shadow-md"
                  }
                `}
              >
                {/* Date Number */}
                <span
                  className={`
                  font-medium text-sm sm:text-base
                  ${selected ? "text-white" : ""}
                  ${weekend && inMonth ? "text-white/40" : ""}
                `}
                >
                  {format(date, "d")}
                </span>

                {/* Month indicator for days from other months */}
                {!inMonth && (
                  <span className="text-[7px] text-white/40 font-light">
                    {format(date, "MMM")}
                  </span>
                )}

                {/* Event Indicator */}
                {hasEvent && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 bg-darkGold rounded-full"></span>
                )}

                {/* Today Indicator */}
                {isToday && !selected && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-darkGold rounded-full"></span>
                )}

                {/* Hover effect */}
                <span
                  className={`absolute inset-0 rounded-lg bg-darkGold/0 group-hover:bg-darkGold/20 
                  transition-colors duration-300 ${selected ? "hidden" : ""}`}
                ></span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && availableDurations.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white text-base font-medium mb-3">
            Choose Duration
          </h4>
          <div className="relative">
            <div className="flex overflow-x-auto p-2 gap-2 pb-4 scrollbar-hide">
              {availableDurations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => onSelectDuration(duration)}
                  className={`flex-none px-3 py-2 rounded-lg text-xs text-center min-w-[70px] transition-all duration-300
                    ${
                      selectedDuration === duration
                        ? "bg-gentleGray text-black font-semibold shadow transform scale-102"
                        : "text-white border-2 border-gentleGray"
                    }`}
                >
                  {formatDuration(duration)}
                </button>
              ))}
            </div>
            {/* Left/Right fade indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-oxfordBlue to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-oxfordBlue to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* Time Slots Selection - Slide-Up Animation */}
      {selectedDate && selectedDuration && availableTimeSlots.length > 0 && (
        <div className="animate-wheel-reveal">
          <h4 className="text-white text-sm font-medium mb-2">Select Time</h4>
          <div className="relative mx-auto max-w-xs">
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-12 bg-darkGold/15 border-t border-b border-darkGold pointer-events-none z-10 rounded-lg" />

            <div className="h-48 overflow-auto time-wheel-container py-16 mask-gradient">
              <div className="flex flex-col items-center space-y-1">
                {availableTimeSlots.map((time) => (
                  <div
                    key={time}
                    onClick={() => onTimeSelection(time)}
                    className={`w-full py-2 flex justify-center items-center transition-transform duration-200 cursor-pointer snap-center
                      ${
                        selectedTime === time
                          ? "text-darkGold font-semibold text-lg scale-115"
                          : "text-white text-base hover:text-darkGold/80"
                      }`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* Fade gradients */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-oxfordBlue to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-oxfordBlue to-transparent pointer-events-none" />
          </div>
        </div>
      )}
      {/* Booking Summary - Modern Card */}
      {selectedDate && selectedDuration && selectedTime && (
        <div className="p-5 rounded-xl">
          <div className="rounded-lg p-4 flex flex-col items-center">
            <div className="text-white/90 text-center space-y-2 text-sm">
              <div>
                <span className="block bg-gentleGray rounded-lg py-1 px-2 font-medium text-black w-[60vw] text-lg mb-1">
                  {format(selectedDate, "EE, MMMM d")}
                </span>
              </div>
                <div className="flex flex-row gap-2 justify-center">
                  <div className="flex flex-col items-center bg-gentleGray rounded-lg p-2 w-1/2">
                    <span className="text-xs text-gray-600 font-medium">
                      From
                    </span>
                    <span className="font-semibold text-black text-sm">
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-gentleGray rounded-lg p-2 w-1/2">
                    <span className="text-xs text-gray-600 font-medium">
                      To
                    </span>
                    <span className="font-semibold text-black text-sm">
                      {calculateEndTime(selectedTime, selectedDuration)}
                    </span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Available Options Message */}
      {selectedDate && availableDurations.length === 0 && (
        <div className="mt-6 p-5 bg-oxfordBlue/60 rounded-xl text-center animate-fade-in shadow-lg backdrop-blur-sm">
          <svg
            className="w-8 h-8 mx-auto text-darkGold mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-white/90">
            No available time slots for this date. Please select another date.
          </p>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Step 2: Contact info
function InfoStep({ formData, onChange }) {
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);
  return (
    <div className="space-y-4 max-w-md mx-auto w-full">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg">
          {t("booking.name_label")}
        </label>
        <input
          name="name"
          placeholder={t("booking.name_placeholder")}
          value={formData.name}
          onChange={onChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg">
          {t("booking.email_label")}
        </label>
        <input
          name="email"
          type="email"
          placeholder={t("booking.email_placeholder")}
          value={formData.email}
          onChange={onChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base"
        />
      </div>
      <div className="text-white text-sm text-right sm:text-base md:text-lg">
        <button
          type="button"
          onClick={openAuthModal}
          className="text-xs text-white underline"
        >
          {t("services.common_login_signup")}
        </button>
      </div>
    </div>
  );
}

// Step 3: Payment step (new)
function PaymentStep({ selectedDate, selectedTime, selectedDuration, formData }) {
  const { t } = useTranslation();
  
  // Generate pricing based on duration
  const price = selectedDuration * 1.5; // Example: €1.5 per minute
  
  // Format end time
  const formatDateAndTime = (date, timeString, duration) => {
    if (!date || !timeString) return "";
    
    const [hours, minutes] = timeString.split(":").map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = addMinutes(startTime, duration);
    
    return {
      date: format(date, "EEEE, MMMM d, yyyy"),
      start: format(startTime, "h:mm a"),
      end: format(endTime, "h:mm a")
    };
  };
  
  const bookingDetails = formData.bookingSummary || {};
  const formattedDateTime = formatDateAndTime(
    selectedDate, 
    selectedTime, 
    selectedDuration
  );
  
  // Stripe checkout links by duration (minutes)
  const STRIPE_LINKS = {
    45: "https://buy.stripe.com/9AQ4h1gy6fG90Te7sw",
    60: "https://buy.stripe.com/5kA4h12HgalPbxSeUZ",
    75: "https://buy.stripe.com/8wM4h1fu265z9pK8wE",
    90: "https://buy.stripe.com/fZe6p9a9I79D7hC6ov",
    105: "https://buy.stripe.com/9AQ4h195Edy11Xi28h",
    120: "https://buy.stripe.com/28o7tdfu2eC50Te4gm",
  };
  
  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Booking Summary Card */}
      <div className="bg-white/10 rounded-xl p-6 shadow-md">
        <h3 className="text-white text-xl mb-4 font-semibold">Booking Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between text-white">
            <span className="text-white/70">Date:</span>
            <span className="font-medium">{bookingDetails.dateFormatted || formattedDateTime.date}</span>
          </div>
          <div className="flex justify-between text-white">
            <span className="text-white/70">Time:</span>
            <span className="font-medium">{bookingDetails.timeRange || `${formattedDateTime.start} - ${formattedDateTime.end}`}</span>
          </div>
          <div className="flex justify-between text-white">
            <span className="text-white/70">Duration:</span>
            <span className="font-medium">{bookingDetails.duration || `${selectedDuration} minutes`}</span>
          </div>
          <div className="flex justify-between text-white">
            <span className="text-white/70">Customer:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex justify-between text-white">
              <span className="text-xl">Total:</span>
              <span className="text-xl font-bold">€{price}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Button */}
      <div className="flex flex-col items-center space-y-3">
        <a
          href={STRIPE_LINKS[selectedDuration]}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-darkGold text-black font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 7H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Proceed to Payment</span>
        </a>
        <p className="text-white/60 text-sm text-center">
          After completing the payment, click "Next" to confirm your booking
        </p>
      </div>
    </div>
  );
}

// Step 4: Confirmation step (new)
function ConfirmationStep() {
  return (
    <div className="text-center py-6">
      <div className="bg-green-500/20 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl text-white font-bold mb-2">
        Your booking is confirmed!
      </h3>
      <p className="text-white/80 mb-4">
        We've sent a confirmation email with all the details.
      </p>
      <p className="text-white/60 text-sm">
        You can now chat with our assistant to prepare for your consultation.
      </p>
    </div>
  );
}

export default function Booking({ onBackService }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableDurations, setAvailableDurations] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    bookingSummary: null,
  });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  // Business hours buffer - start scheduling from tomorrow
  const minDate = addDays(new Date(), 1);

  // Load existing bookings
  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const { data } = await fetchBookings();
        setBookedEvents(data || []);
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  // Define time slots and durations
  const generateTimeSlots = () => {
    // Generate time slots from 10:00 to 21:00
    return Array.from({ length: 12 }, (_, i) => `${10 + i}:00`);
  };

  const ALL_TIME_SLOTS = generateTimeSlots();
  const ALL_DURATIONS = [45, 60, 75, 90, 105, 120]; // in minutes

  // When a date is selected, check which durations are available
  useEffect(() => {
    if (selectedDate) {
      // Filter durations based on availability
      const availableDurs = ALL_DURATIONS.filter((duration) =>
        // Check if any time slot works with this duration
        ALL_TIME_SLOTS.some((timeSlot) =>
          isSlotFree(selectedDate, timeSlot, duration)
        )
      );

      setAvailableDurations(availableDurs);

      // Reset selections when date changes
      setSelectedDuration(null);
      setSelectedTime(null);
      setAvailableTimeSlots([]);
    } else {
      setAvailableDurations([]);
    }
  }, [selectedDate, bookedEvents]);

  // When duration is selected, compute available time slots
  useEffect(() => {
    if (selectedDate && selectedDuration) {
      // Filter time slots based on availability for selected duration
      const availableTimes = ALL_TIME_SLOTS.filter((timeSlot) =>
        isSlotFree(selectedDate, timeSlot, selectedDuration)
      );

      setAvailableTimeSlots(availableTimes);
      setSelectedTime(null); // Reset time selection
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, selectedDuration]);

  // Update booking summary when all details are selected
  useEffect(() => {
    if (selectedDate && selectedTime && selectedDuration) {
      // Format the times for summary
      const dateFormatted = format(selectedDate, "EEEE, MMMM d, yyyy");
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startDate = new Date(selectedDate);
      startDate.setHours(hours, minutes, 0, 0);

      const endTime = addMinutes(startDate, selectedDuration);
      const timeRange = `${selectedTime} - ${format(endTime, "h:mm a")}`;

      // Format duration
      let duration;
      if (selectedDuration < 60) {
        duration = `${selectedDuration} minutes`;
      } else if (selectedDuration % 60 === 0) {
        duration = `${selectedDuration / 60} hour${
          selectedDuration > 60 ? "s" : ""
        }`;
      } else {
        duration = `${Math.floor(selectedDuration / 60)}h ${
          selectedDuration % 60
        }m`;
      }

      // Update form data with booking summary
      setFormData((prev) => ({
        ...prev,
        bookingSummary: {
          dateFormatted,
          timeRange,
          duration,
        },
      }));
    }
  }, [selectedDate, selectedTime, selectedDuration]);

  // Build blocked intervals based on existing bookings
  // Each booking blocks from 30min before the start time to the end time
  const getBlockedTimes = () => {
    return bookedEvents.map((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      return {
        from: addMinutes(start, -30), // 30min prep time before consultation
        to: end, // End of consultation
      };
    });
  };

  const blocked = getBlockedTimes();

  // Check if a specific hour and duration is available on the selected date
  function isSlotFree(date, hourString, durationMinutes) {
    if (!date) return false;

    // Create datetime objects for the proposed booking
    const [hour, minute] = hourString.split(":").map(Number);

    const consultationStart = new Date(date);
    consultationStart.setHours(hour, minute, 0, 0);

    const prepStart = addMinutes(consultationStart, -30); // 30min prep time
    const consultationEnd = addMinutes(consultationStart, durationMinutes);

    // Check if the booking would extend past 10pm (22:00)
    if (consultationEnd.getHours() >= 22 && consultationEnd.getMinutes() > 0) {
      return false;
    }

    // Check for conflicts with existing bookings
    for (const block of blocked) {
      // Check if there's any overlap between the proposed booking (including prep time)
      // and any existing booking
      if (
        (prepStart < block.to && consultationEnd > block.from) ||
        (block.from < consultationEnd && block.to > prepStart)
      ) {
        return false; // Conflict detected
      }
    }

    return true; // No conflicts found
  }

  // Now with 4 steps:
  // 1: Date/Duration/Time selection
  // 2: Contact info
  // 3: Payment (no database save yet)
  // 4: Confirmation (only save to database after successful payment)
  // 5: Chat
  const STEPS = [
    { title: t("booking.step_1"), component: CombinedSelectionStep },
    { title: t("booking.step_2"), component: InfoStep },
    { title: "Payment", component: PaymentStep },
    { title: "Confirmation", component: ConfirmationStep },
    { title: t("booking.step_4"), component: InlineChatbotStep },
  ];
  const UI_STEPS = STEPS.length + 1;

  // Navigation logic
  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime && selectedDuration;
    if (step === 2) return formData.name && formData.email;
    // For step 3 (payment), we'll assume the user has completed the payment externally
    if (step === 3) return true; // Simulating payment completion
    return true;
  };

  const handleNext = async () => {
    if (step === 1 && selectedDate && selectedTime && selectedDuration) {
      setStep(2);
    } else if (step === 2 && formData.name && formData.email) {
      // Move to payment step
      setStep(3);
    } else if (step === 3) {
      // This is the payment step
      // Here we move to confirmation and now save to database
      setLoading(true);

      try {
        // Build the ISO timestamp for the consultation start time
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(hours, minutes, 0, 0);
        const appointment_date = appointmentDate.toISOString();

        // Now we save to database after "payment" is complete
        const payload = {
          appointment_date,
          duration_minutes: selectedDuration,
          name: formData.name,
          email: formData.email,
          user_id: user?.id, // Add user ID if logged in
          payment_status: "paid" // Mark as paid
        };

        const { data, error } = await supabase
          .from("bookings")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        setBookingId(data.id);

        // Refresh bookings data to update availability
        const { data: fresh } = await fetchBookings();
        setBookedEvents(fresh || []);

        // Move to confirmation step
        setStep(4);
      } catch (error) {
        console.error("Error creating booking:", error);
        // Here you could add user notification about the error
      } finally {
        setLoading(false);
      }
    } else if (step === 4) {
      // Move to chat step after confirmation
      setStep(5);
    }
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStepClick = (dot) => {
    if (dot === 1) onBackService();
    else setStep(dot - 1);
  };

  return (
    <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-4" id="bookingForm">
      <div className="max-w-full sm:max-w-2xl md:max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("booking.title")}
        </h2>
        <div className="bg-oxfordBlue rounded-xl p-6 sm:p-6 md:p-8 shadow-xl">
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 sm:mb-6 font-semibold">
            {STEPS[step - 1].title}
          </h3>

          {loading && step === 1 ? (
            <div className="flex justify-center py-6 sm:py-10">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-darkGold"></div>
            </div>
          ) : (
            <>
              {step === 1 && (
                <CombinedSelectionStep
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  currentMonth={currentMonth}
                  onChangeMonth={(inc) =>
                    setCurrentMonth((prev) => addMonths(prev, inc))
                  }
                  minDate={minDate}
                  selectedDuration={selectedDuration}
                  onSelectDuration={setSelectedDuration}
                  availableDurations={availableDurations}
                  selectedTime={selectedTime}
                  onTimeSelection={setSelectedTime}
                  availableTimeSlots={availableTimeSlots}
                  bookedEvents={bookedEvents}
                />
              )}

              {step === 2 && (
                <InfoStep formData={formData} onChange={handleChange} />
              )}
              
              {step === 3 && (
                <PaymentStep 
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedDuration={selectedDuration}
                  formData={formData}
                />
              )}
              
              {step === 4 && (
                <ConfirmationStep />
              )}

              {step === 5 && (
                <InlineChatbotStep
                  requestId={bookingId}
                  tableName="booking_chat_messages"
                />
              )}
            </>
          )}

          <div className="flex justify-between mt-4 sm:mt-5">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : onBackService())}
              className="px-2 py-1 border border-darkGold text-darkGold rounded-lg text-sm"
            >
              {t("booking.back")}
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="px-3 py-1 bg-darkGold text-black rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("booking.processing")}
                  </span>
                ) : step === 3 ? (
                  "Confirm Booking"
                ) : (
                  t("booking.next")
                )}
              </button>
            )}
          </div>

          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={step + 1}
            onStepClick={handleStepClick}
            className="pt-3 sm:pt-4"
          />
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </section>
  );
}