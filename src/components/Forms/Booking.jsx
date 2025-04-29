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
  parseISO
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
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-oxfordBlue/30 rounded-lg p-2 shadow-sm">
        <button 
          onClick={() => onChangeMonth(-1)} 
          className="text-white hover:text-darkGold p-1 rounded-full hover:bg-white/10 transition-all duration-200"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg sm:text-xl text-white font-bold tracking-wide">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button 
          onClick={() => onChangeMonth(1)} 
          className="text-white hover:text-darkGold p-1 rounded-full hover:bg-white/10 transition-all duration-200"
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/5 rounded-xl p-2 md:p-3 shadow-md">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div 
              key={d} 
              className="text-center py-1 text-darkGold font-semibold text-xs"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendar.map((date, i) => {
            const inMonth = isSameMonth(date, currentMonth);
            const weekend = isWeekend(date);
            const tooSoon = isBefore(date, minDate);
            const selected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const disabled = !inMonth || weekend || tooSoon;
            
            return (
              <button
                key={i}
                onClick={() => !disabled && onSelectDate(date)}
                disabled={disabled}
                className={`
                  relative h-8 sm:h-10 aspect-square rounded-md flex flex-col items-center justify-center
                  transition-all duration-200
                  ${selected 
                    ? "bg-darkGold text-white font-bold shadow-md scale-102 z-10" 
                    : inMonth && !disabled 
                      ? "bg-white/10 text-white hover:bg-darkGold/40" 
                      : "bg-white/5 text-white/40"}
                  ${isToday && !selected ? "ring-1 ring-darkGold ring-opacity-70" : ""}
                  ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* Date Display */}
                <div className="flex flex-col items-center">
                  {!inMonth && (
                    <span className="text-[7px] text-white/40 font-light">
                      {format(date, "MMM")}
                    </span>
                  )}
                  <span className={`
                    font-medium text-xs sm:text-sm
                    ${selected ? "text-white" : ""}
                    ${weekend && inMonth ? "text-white/40" : ""}
                  `}>
                    {format(date, "d")}
                  </span>
                </div>
                
                {/* Indicator for Today */}
                {isToday && !selected && (
                  <div className="absolute bottom-0.5 w-1 h-1 bg-darkGold rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary */}
      {selectedDate && (
        <div className="bg-white/10 p-2 rounded-lg text-center mt-3">
          <h3 className="text-white text-sm font-semibold">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
      )}

      {/* Cascading Selection UI */}
      {/* Duration Selection (appears when date is selected) */}
      {selectedDate && availableDurations.length > 0 && (
        <div className="mt-4 animate-fadeIn">
          <h4 className="text-white text-sm mb-2 font-medium">Session Duration</h4>
          <div className="relative overflow-hidden">
            <div className="flex overflow-x-auto py-2 gap-2 pb-3 scrollbar-hide">
              {availableDurations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => onSelectDuration(duration)}
                  className={`
                    flex-none px-4 py-2 rounded-lg text-center min-w-[100px] transition-all
                    ${selectedDuration === duration 
                      ? "bg-darkGold text-black font-semibold transform scale-102" 
                      : "bg-white/10 text-white hover:bg-white/20"}
                  `}
                >
                  <span className="block text-sm font-medium">{formatDuration(duration)}</span>
                </button>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-oxfordBlue to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-oxfordBlue to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}

      {/* Time Slots Selection (appears when duration is selected) */}
      {selectedDate && selectedDuration && availableTimeSlots.length > 0 && (
        <div className="mt-4 animate-fadeIn">
          <div className="relative overflow-hidden">
            <div className="flex overflow-x-auto py-2 gap-2 pb-3 scrollbar-hide">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => onTimeSelection(time)}
                  className={`
                    flex-none px-3 py-2 rounded-lg text-center min-w-[70px] transition-all
                    ${selectedTime === time 
                      ? "bg-darkGold text-black font-semibold transform scale-102" 
                      : "bg-white/10 text-white hover:bg-white/20"}
                  `}
                >
                  <span className="block text-sm font-medium">{time}</span>
                </button>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-oxfordBlue to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-oxfordBlue to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}

      {/* Booking Summary (when all selections are made) */}
      {selectedDate && selectedDuration && selectedTime && (
        <div className="mt-4 p-3 bg-darkGold/20 rounded-lg animate-fadeIn">
          <h4 className="text-white font-semibold mb-2 text-center text-sm">Booking Summary</h4>
          <div className="text-white/90 text-xs">
            <p><span className="font-medium">Date:</span> {format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            <p><span className="font-medium">Time:</span> {selectedTime} - {calculateEndTime(selectedTime, selectedDuration)}</p>
            <p><span className="font-medium">Duration:</span> {formatDuration(selectedDuration)}</p>
          </div>
        </div>
      )}

      {/* No available options message */}
      {selectedDate && availableDurations.length === 0 && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl text-center">
          <p className="text-white/80">No available time slots for this date. Please select another date.</p>
        </div>
      )}
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
        <label className="block text-white text-sm sm:text-base md:text-lg">{t("booking.name_label")}</label>
        <input
          name="name"
          placeholder={t("booking.name_placeholder")}
          value={formData.name}
          onChange={onChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg">{t("booking.email_label")}</label>
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

      {/* Final Booking Summary */}
      <div className="mt-6 p-4 bg-darkGold/20 rounded-xl">
        <h4 className="text-white font-semibold mb-3 text-center">Your Booking Details</h4>
        <div className="text-white space-y-2 text-sm sm:text-base">
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span>Name:</span>
            <span className="font-medium">{formData.name || "Not provided"}</span>
          </div>
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span>Email:</span>
            <span className="font-medium">{formData.email || "Not provided"}</span>
          </div>
          {formData.bookingSummary && (
            <>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span>Date:</span>
                <span className="font-medium">{formData.bookingSummary.dateFormatted}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span>Time:</span>
                <span className="font-medium">{formData.bookingSummary.timeRange}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span>Duration:</span>
                <span className="font-medium">{formData.bookingSummary.duration}</span>
              </div>
            </>
          )}
        </div>
      </div>
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
    bookingSummary: null
  });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  // Business hours buffer - start scheduling from tomorrow
  const minDate = addDays(new Date(), 1);

  // Stripe checkout links by duration (minutes)
  const STRIPE_LINKS = {
    45: "https://buy.stripe.com/9AQ4h1gy6fG90Te7sw",
    60: "https://buy.stripe.com/5kA4h12HgalPbxSeUZ",
    75: "https://buy.stripe.com/8wM4h1fu265z9pK8wE",
    90: "https://buy.stripe.com/fZe6p9a9I79D7hC6ov",
    105: "https://buy.stripe.com/9AQ4h195Edy11Xi28h",
    120: "https://buy.stripe.com/28o7tdfu2eC50Te4gm",
  };

  // Auto-redirect to Stripe at payment step
  useEffect(() => {
    if (step === 3 && selectedDuration) {
      window.open(STRIPE_LINKS[selectedDuration], "_blank");
    }
  }, [step, selectedDuration]);

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
      const availableDurs = ALL_DURATIONS.filter(duration => 
        // Check if any time slot works with this duration
        ALL_TIME_SLOTS.some(timeSlot => isSlotFree(selectedDate, timeSlot, duration))
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
      const availableTimes = ALL_TIME_SLOTS.filter(timeSlot => 
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
        duration = `${selectedDuration / 60} hour${selectedDuration > 60 ? 's' : ''}`;
      } else {
        duration = `${Math.floor(selectedDuration / 60)}h ${selectedDuration % 60}m`;
      }
      
      // Update form data with booking summary
      setFormData(prev => ({
        ...prev,
        bookingSummary: {
          dateFormatted,
          timeRange,
          duration
        }
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
        to: end                       // End of consultation
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

  // Now only 3 steps with combined date+duration+time
  const STEPS = [
    { title: t("booking.step_1"), component: CombinedSelectionStep },
    { title: t("booking.step_2"), component: InfoStep },
    { title: t("booking.step_3"), component: InlineChatbotStep },
  ];
  const UI_STEPS = STEPS.length + 1;

  // Navigation logic
  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime && selectedDuration;
    if (step === 2) return formData.name && formData.email;
    if (step === 3) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (step === 1 && selectedDate && selectedTime && selectedDuration) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
  
      // Build the ISO timestamp for the consultation start time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);
      const appointment_date = appointmentDate.toISOString();
  
      try {
        const payload = {
          appointment_date,
          duration_minutes: selectedDuration,
          name: formData.name,
          email: formData.email,
          user_id: user?.id // Add user ID if logged in
        }

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
        
        setStep(3); // Move to the next step
      } catch (error) {
        console.error("Error creating booking:", error);
        // Here you could add user notification about the error
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleStepClick = dot => {
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
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 sm:mb-6 font-semibold">{STEPS[step - 1].title}</h3>
          
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
                  onChangeMonth={inc => setCurrentMonth(prev => addMonths(prev, inc))}
                  minDate={minDate}
                  selectedDuration={selectedDuration}
                  onSelectDuration={setSelectedDuration}
                  availableDurations={availableDurations}
                  selectedTime={selectedTime}
                  onTimeSelection={setSelectedTime}
                  availableTimeSlots={availableTimeSlots}
                />
              )}
              
              {step === 2 && (
                <InfoStep
                  formData={formData}
                  onChange={handleChange}
                />
              )}
              
              {step === 3 && (
                <InlineChatbotStep
                  requestId={bookingId}
                  tableName="booking_chat_messages"
                />
              )}
            </>
          )}

          <div className="flex justify-between mt-4 sm:mt-5">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onBackService()}
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
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("booking.processing")}
                  </span>
                ) : (
                  step === 2 ? t("booking.complete_booking") : t("booking.next")
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </section>
  );
}