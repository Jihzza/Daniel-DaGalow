import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
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
} from "date-fns";
import { fetchBookings } from "../../services/bookingService";
import InlineChatbotStep from "./InlineChatbotStep";
import { useTranslation } from "react-i18next";

// Shared StepIndicator
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick,
  className = "",
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {Array.from({ length: stepCount }).map((_, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        
        return (
          <React.Fragment key={stepNum}>
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              disabled={stepNum > currentStep}
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                isActive
                  ? "bg-darkGold border-darkGold text-white"
                  : "bg-white/20 border-white/50 text-white/50 hover:border-darkGold hover:text-white cursor-pointer"
              } ${stepNum > currentStep ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={`Go to step ${stepNum}`}
            >
              {stepNum}
            </button>
            {idx < stepCount - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${
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

// Step 1: Date selection
function DateStep({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
  bookedEvents,
  minDate,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => onChangeMonth(-1)} 
          className="text-white p-2 hover:text-darkGold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-xl text-white font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button 
          onClick={() => onChangeMonth(1)} 
          className="text-white p-2 hover:text-darkGold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-white/60 text-sm font-medium">
            {d}
          </div>
        ))}
        {calendar.map((date, i) => {
          const inMonth = isSameMonth(date, currentMonth);
          const weekend = isWeekend(date);
          const tooSoon = isBefore(date, minDate);
          const selected = selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              key={i}
              onClick={() =>
                inMonth && !weekend && !tooSoon && onSelectDate(date)
              }
              disabled={!inMonth || weekend || tooSoon}
              className={
                `aspect-square rounded-xl p-2 flex flex-col items-center justify-center text-sm relative transition-colors ` +
                (selected
                  ? "bg-darkGold text-white shadow-md"
                  : "bg-white/10 text-white") +
                (!inMonth || weekend || tooSoon
                  ? " opacity-50 cursor-not-allowed"
                  : " hover:bg-darkGold/70 hover:text-white cursor-pointer")
              }
            >
              <span className="text-xs">{format(date, "MMM")}</span>
              <span className="font-bold">{format(date, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 2: Time selection with improved UI
function TimeStep({ availability, selectedTime, onSelectTime }) {
  const [selectedHour, setSelectedHour] = useState(null);
  
  // Group availability by time slot for easier rendering
  const timeSlots = availability.filter(slot => slot.allowed.length > 0);
  
  // Handle hour selection
  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
  };
  
  // Handle duration selection
  const handleDurationSelect = (hour, duration) => {
    onSelectTime({ slot: hour, dur: duration });
  };
  
  // Convert duration minutes to readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes % 60 === 0) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  // Calculate end time for a given start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    const [h, m] = startTime.split(":").map(Number);
    const endMinutes = m + durationMinutes;
    const endHours = h + Math.floor(endMinutes / 60);
    const endMinutesRemainder = endMinutes % 60;
    return `${endHours}:${endMinutesRemainder.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-6">
      {/* If no hour is selected yet, show the hour selection grid */}
      {!selectedHour ? (
        <div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {timeSlots.map(({ slot, allowed }) => (
              <button
                key={slot}
                onClick={() => handleHourSelect(slot)}
                className="bg-white/10 hover:bg-darkGold/70 text-white rounded-xl p-3 transition-colors duration-200 flex flex-col items-center"
              >
                <span className="text-xl font-semibold">{slot}</span>
                <span className="text-xs mt-1">
                  {allowed.length} {allowed.length === 1 ? 'option' : 'options'}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* If hour is selected, show duration options for that hour */
        <div>
          <div className="flex items-center mb-4">
            <button 
              onClick={() => setSelectedHour(null)}
              className="text-white mr-2 hover:text-darkGold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {timeSlots
              .find(item => item.slot === selectedHour)?.allowed
              .map(duration => (
                <button
                  key={duration}
                  onClick={() => handleDurationSelect(selectedHour, duration)}
                  className={`relative overflow-hidden shadow-lg rounded-xl p-3 transition-all duration-200
                    ${selectedTime?.slot === selectedHour && selectedTime?.dur === duration
                      ? " bg-darkGold/30"
                      : " bg-white/10 hover:border-darkGold/70 hover:bg-white/20"
                    }`}
                >
                  <div className="flex flex-col items-center justify-center text-white">
                    <span className="text-lg font-bold mb-1">{formatDuration(duration)}</span>
                    <span className="text-xs opacity-70">
                      {selectedHour} - {calculateEndTime(selectedHour, duration)}
                    </span>
                  </div>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// Step 3: Contact info
function InfoStep({ formData, onChange }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4 max-w-md mx-auto w-full">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white">{t("booking.name_label")}</label>
        <input
          name="name"
          placeholder={t("booking.name_placeholder")}
          value={formData.name}
          onChange={onChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white">{t("booking.email_label")}</label>
        <input
          name="email"
          type="email"
          placeholder={t("booking.email_placeholder")}
          value={formData.email}
          onChange={onChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
        />
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || ""
  });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (step === 4 && selectedDuration) {
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

  // Define durations and hours
  const DURS = [45, 60, 75, 90, 105, 120]; // Duration options in minutes
  const timeOptions = Array.from({ length: 12 }, (_, i) => `${10 + i}:00`); // Hours from 10am to 9pm

  // Compute availability per hour based on the selected date
  const availability = timeOptions.map(slot => ({
    slot,
    allowed: DURS.filter(dur => isSlotFree(selectedDate, slot, dur)),
  }));

  // Booking steps
  const STEPS = [
    { title: t("booking.step_1"), component: DateStep },
    { title: t("booking.step_2"), component: TimeStep },
    { title: t("booking.step_3"), component: InfoStep },
    { title: t("booking.step_4"), component: InlineChatbotStep },
  ];
  const Current = STEPS[step - 1].component;
  const UI_STEPS = STEPS.length + 1;

  // Navigation logic
  const canProceed = () => {
    if (step === 2) return !!selectedDuration;
    if (step === 3) return formData.name && formData.email;
    if (step === 4) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      setLoading(true);
  
      // Build the ISO timestamp for the consultation start time
      const appointment_date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        ...selectedTime.split(":").map(Number)
      ).toISOString();
  
      try {
        const { data, error } = await supabase
          .from("bookings")
          .insert({
            user_id: user.id,
            appointment_date,
            duration_minutes: selectedDuration,
            name: formData.name,
            email: formData.email,
          })
          .select("id")
          .single();
    
        if (error) throw error;
        
        setBookingId(data.id);
        
        // Refresh bookings data to update availability
        const { data: fresh } = await fetchBookings();
        setBookedEvents(fresh || []);
        
        setStep(4); // Move to the next step
      } catch (error) {
        console.error("Error creating booking:", error);
        // Here you could add user notification about the error
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleStepClick = dot => {
    if (dot === 1) onBackService(); 
    else setStep(dot - 1);
  };

  return (
    <section className="py-8 px-4" id="bookingForm">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          {t("booking.title")}
        </h2>
        <div className="bg-oxfordBlue rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl text-white mb-6 font-semibold">{STEPS[step - 1].title}</h3>
          
          {loading && step === 1 ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkGold"></div>
            </div>
          ) : (
            <>
              {step === 2 ? (
                <TimeStep
                  availability={availability}
                  selectedTime={{ slot: selectedTime, dur: selectedDuration }}
                  onSelectTime={({ slot, dur }) => {
                    setSelectedTime(slot);
                    setSelectedDuration(dur);
                  }}
                />
              ) : step < 2 ? (
                <DateStep
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  currentMonth={currentMonth}
                  onChangeMonth={inc => setCurrentMonth(m => new Date(m.setMonth(m.getMonth() + inc)))}
                  minDate={minDate}
                />
              ) : step === 3 ? (
                <InfoStep
                  formData={formData}
                  onChange={handleChange}
                />
              ) : (
                <InlineChatbotStep
                  requestId={bookingId}
                  tableName="booking_chat_messages"
                />
              )}
            </>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onBackService()}
              className="px-4 py-2 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 transition-colors"
            >
              {t("booking.back")}
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="px-4 py-2 bg-darkGold text-white rounded-xl disabled:opacity-50 hover:bg-darkGold/90 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("booking.processing")}
                  </span>
                ) : (
                  step === 3 ? t("booking.complete_booking") : t("booking.next")
                )}
              </button>
            )}
          </div>

          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={step + 1}
            onStepClick={handleStepClick}
            className="pt-6"
          />
        </div>
      </div>
    </section>
  );
}