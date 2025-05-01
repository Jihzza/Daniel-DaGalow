import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
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
} from "date-fns";
import { fetchBookings } from "../../services/bookingService";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Virtual } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Shared StepIndicator
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
  return (
    <div className="flex items-center justify-center py-4 gap-1 md:gap-2">
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

// Combined Date, Time and Duration Selection Step with Swiper Carousels
function DateTimeStep({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
  selectedTime,
  selectedDuration,
  onSelectTime,
  availability,
  minDate,
}) {
  // Calendar setup
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

  // Time slots and available times
  const timeSlots = availability.filter((slot) => slot.allowed.length > 0);

  // All available times for the selected date (to show in vertical carousel)
  const availableTimes = timeSlots.map((slot) => slot.slot).sort();

  // All durations (these are fixed)
  const availableDurations = [45, 60, 75, 90, 105, 120];

  // References for Swipers
  const durationSwiperRef = useRef(null);
  const timeSwiperRef = useRef(null);

  // Convert duration minutes to readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes % 60 === 0) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 60)}h${minutes % 60}min`;
  };
  // Calculate end time for a given start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return "";
    const [h, m] = startTime.split(":").map(Number);
    const endMinutes = m + durationMinutes;
    const endHours = h + Math.floor(endMinutes / 60);
    const endMinutesRemainder = endMinutes % 60;
    return `${endHours}:${endMinutesRemainder.toString().padStart(2, "0")}`;
  };

  // Handle duration selection
  const handleDurationSelect = (duration) => {
    if (selectedTime) {
      onSelectTime({ slot: selectedTime, dur: duration });
    } else if (availableTimes.length > 0) {
      // If time not selected but times are available, select the first available time
      onSelectTime({ slot: availableTimes[0], dur: duration });
    }
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    if (selectedDuration) {
      onSelectTime({ slot: time, dur: selectedDuration });
    } else if (availableDurations.length > 0) {
      // If duration not selected, select the first available duration
      const firstAvailableDuration =
        timeSlots.find((slot) => slot.slot === time)?.allowed[0] ||
        availableDurations[0];
      onSelectTime({ slot: time, dur: firstAvailableDuration });
    }
  };

  // Check if a specific duration is available for the selected time
  const isDurationAvailable = (duration) => {
    if (!selectedTime) return true; // If no time selected, all durations are visually available
    const timeSlot = timeSlots.find((slot) => slot.slot === selectedTime);
    return timeSlot && timeSlot.allowed.includes(duration);
  };

  // Check if a specific time has any available durations
  const isTimeAvailable = (time) => {
    const timeSlot = timeSlots.find((slot) => slot.slot === time);
    return timeSlot && timeSlot.allowed.length > 0;
  };

  return (
    <div className="flex flex-col md:flex-row md:gap-6 md:items-start">
      {/* Calendar Section - Takes more horizontal space on tablet/desktop */}
      <div className="md:w-2/3 lg:w-3/5">
        {/* Calendar Header - Keeping original mobile styling, adding responsive classes */}
        <div className="flex items-center justify-between bg-oxfordBlue/30 rounded-xl p-3 shadow-sm">
          <button
            onClick={() => onChangeMonth(-1)}
            className="text-white hover:text-darkGold p-2 rounded-full hover:bg-white/10 transition-all duration-200"
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
            className="text-white hover:text-darkGold p-2 rounded-full hover:bg-white/10 transition-all duration-200"
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

        {/* Calendar Grid - Enhanced for larger screens */}
        <div className="bg-white/5 rounded-xl p-3 md:p-4 lg:p-5 shadow-md">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="text-center py-2 text-darkGold font-semibold text-xs sm:text-sm md:text-base"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days - Keeping original structure but enhancing for larger screens */}
          <div className="grid grid-cols-7 gap-2 justify-center items-center">
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
                    relative h-8 md:h-10 lg:h-12 aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200
                    ${
                      selected
                        ? "bg-darkGold text-white font-bold shadow-lg scale-105 z-10"
                        : inMonth && !disabled
                        ? "bg-white/10 text-white hover:bg-darkGold/40 hover:scale-105"
                        : "bg-white/5 text-white/40"
                    }
                    ${
                      isToday && !selected
                        ? "ring-2 ring-darkGold ring-opacity-70"
                        : ""
                    }
                    ${
                      disabled
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:shadow-md"
                    }
                  `}
                >
                  <span className="text-sm md:text-base font-medium">
                    {format(date, "d")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time & Duration Selection Section */}
      <div className="md:w-1/3 lg:w-2/5 md:pl-4 md:border-l md:border-white/10">
        {/* Duration Carousel (Horizontal) - Keeping original mobile structure */}
        <div className="relative pb-4 pt-8 md:pt-4">
          <h4 className="text-white text-sm md:text-base font-medium mb-2">
            Select Duration:
          </h4>
          {/* The negative margin container as in original, but adjusted for desktop */}
          <div className="mx-[-12px] sm:mx-[-24px] md:mx-0 relative">
            <div className="">
              <Swiper
                modules={[Navigation, Pagination]}
                slidesPerView={3}
                spaceBetween={10}
                centeredSlides={true}
                onSwiper={(swiper) => {
                  durationSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  // Auto-select the centered duration
                  if (
                    availableDurations.length > 0 &&
                    swiper.realIndex < availableDurations.length
                  ) {
                    const centeredDuration = availableDurations[swiper.realIndex];
                    if (
                      isDurationAvailable(centeredDuration) &&
                      centeredDuration !== selectedDuration
                    ) {
                      handleDurationSelect(centeredDuration);
                    }
                  }
                }}
                className="duration-swiper px-4 md:px-0"
              >
                {availableDurations.map((duration) => (
                  <SwiperSlide key={duration}>
                    <button
                      onClick={() => handleDurationSelect(duration)}
                      disabled={!isDurationAvailable(duration)}
                      className={`w-full py-2 rounded-lg text-center transition-all duration-150 
                      ${
                        selectedDuration === duration
                          ? "bg-darkGold text-black font-bold"
                          : isDurationAvailable(duration)
                          ? "bg-white/10 text-white hover:bg-darkGold/40"
                          : "bg-white/5 text-white/40 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {formatDuration(duration)}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>

        {/* Time Carousel (Vertical) - Keeping original structure but enhancing height for larger screens */}
        <div className="py-4 h-44 md:h-56 lg:h-64">
          <h4 className="text-white text-sm md:text-base font-medium mb-2">
            Select Time:
          </h4>
          {selectedDate && availableTimes.length > 0 ? (
            <div className="relative bg-white/5 rounded-xl py-2 h-full border border-white/10 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-8 w-full bg-darkGold/20 opacity-70 rounded"></div>
              </div>
              <Swiper
                modules={[Virtual]}
                direction="vertical"
                slidesPerView={5}
                centeredSlides={true}
                spaceBetween={1}
                virtual
                onSwiper={(swiper) => {
                  timeSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  // Get the time from the centered slide and select it
                  if (
                    availableTimes.length > 0 &&
                    swiper.realIndex < availableTimes.length
                  ) {
                    const centeredTime = availableTimes[swiper.realIndex];
                    if (
                      isTimeAvailable(centeredTime) &&
                      centeredTime !== selectedTime
                    ) {
                      handleTimeSelect(centeredTime);
                    }
                  }
                }}
                className="h-full"
              >
                {availableTimes.map((time, index) => (
                  <SwiperSlide key={time} virtualIndex={index}>
                    <button
                      onClick={() => handleTimeSelect(time)}
                      disabled={!isTimeAvailable(time)}
                      className={`w-full py-1 md:py-2 text-center transition-all duration-150
                        ${
                          selectedTime === time
                            ? "text-white font-bold"
                            : isTimeAvailable(time)
                            ? "text-white/80 hover:text-white"
                            : "text-white/40 cursor-not-allowed"
                        }`}
                    >
                      {time}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/50">
                {selectedDate
                  ? "No available times for selected date"
                  : "Please select a date first"}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Booking Summary for tablet/desktop - This is new and only shows on larger screens */}
        <div className="hidden md:block mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-white text-base font-medium mb-3 text-center">
            Booking Summary
          </h4>
          
          <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
            <span className="text-white/80">Date:</span>
            <span className="text-white font-medium">
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Not selected"}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
            <span className="text-white/80">Time:</span>
            <span className="text-white font-medium">
              {selectedTime || "Not selected"}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
            <span className="text-white/80">Duration:</span>
            <span className="text-white font-medium">
              {selectedDuration ? formatDuration(selectedDuration) : "Not selected"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">End Time:</span>
            <span className="text-white font-medium">
              {selectedTime && selectedDuration
                ? calculateEndTime(selectedTime, selectedDuration)
                : "Not selected"}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Summary - Original mobile view, preserved exactly as it was */}
      <div className="py-4 mt-4 md:mt-6 flex flex-col items-center md:hidden">
        {/* Date display in center */}
        <div className="mb-2">
          <div className="bg-white/10 rounded-lg px-4 py-1 text-white text-center">
            {selectedDate ? format(selectedDate, "EEE, MMM d") : "Tue, Apr 29"}
          </div>
        </div>

        {/* From/To Labels - centered */}
        <div className="flex w-auto justify-center gap-6">
          <div className="flex flex-col items-center justify-between w-full">
            <div className="text-white/80 text-sm">from</div>
            <div className="bg-white/10 rounded-lg px-2 py-1 text-white w-14 text-center">
              {selectedTime || "10:00"}
            </div>
          </div>

          {/* Time boxes - centered */}
          <div className="flex flex-col items-center justify-between w-full">
            <div className="text-white/80 text-sm">to</div>
            <div className="bg-white/10 rounded-lg px-2 py-1 text-white w-14 text-center">
              {selectedTime && selectedDuration
                ? calculateEndTime(selectedTime, selectedDuration)
                : "10:00"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Contact info
function InfoStep({ formData, onChange }) {
  const { t } = useTranslation();

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
    </div>
  );
}

function PaymentStep({
  selectedDuration,
  bookingId,
  onPaymentConfirmed,
  formData,
}) {
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isTestBooking, setIsTestBooking] = useState(false);

  const handleStripeRedirect = async () => {
    try {
      const { data } = await axios.post(
        "/.netlify/functions/createStripeSession",
        {
          bookingId,
          duration: selectedDuration,
          email: formData.email,
          isTestBooking,
        }
      );

      // Store the session ID in localStorage before opening Stripe
      localStorage.setItem("pendingPaymentId", bookingId);

      // Open Stripe checkout in a new tab
      window.open(data.url, "_blank");

      // Start polling immediately (don't wait for user to return)
      setPaymentStarted(true);
    } catch (error) {
      console.error("Error creating Stripe session:", error);
    }
  };

  useEffect(() => {
    if (!paymentStarted || !bookingId) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `/.netlify/functions/getBookingStatus?id=${bookingId}`
        );
        if (response.data.paymentStatus === "paid") {
          setPaymentConfirmed(true);
          onPaymentConfirmed(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentStarted, bookingId, onPaymentConfirmed]);

  return (
    <div className="text-white text-center space-y-4 max-w-lg mx-auto">
      {/* Show test toggle only in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 flex items-center justify-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isTestBooking}
              onChange={() => setIsTestBooking(!isTestBooking)}
              className="form-checkbox h-5 w-5 text-darkGold"
            />
            <span>Test Booking (0€)</span>
          </label>
        </div>
      )}

      <p className="text-lg sm:text-xl">
        Please click the button below to pay. Once Stripe confirms your payment,
        the "Next" button will be unlocked.
      </p>

      <button
        onClick={handleStripeRedirect}
        className="px-4 py-2 bg-darkGold text-black rounded-xl shadow-md hover:bg-yellow-400 transition"
      >
        {isTestBooking
          ? "Proceed with Test Checkout (0€)"
          : "Open Payment Checkout"}
      </button>

      {paymentStarted && !paymentConfirmed && (
        <p className="text-white/80 text-sm pt-2">
          Waiting for Stripe confirmation...
        </p>
      )}

      {paymentConfirmed && (
        <p className="text-green-500 font-semibold pt-2">
          Payment confirmed ✅ — you can now proceed.
        </p>
      )}
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
    email: user?.email || "",
  });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const handlePaymentConfirmed = (confirmed) => {
    setPaymentDone(confirmed);
  };

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

  // Define durations and hours
  const DURS = [45, 60, 75, 90, 105, 120]; // Duration options in minutes

  // Create time options that include 15-minute intervals (10:00, 10:15, 10:30, 10:45, 11:00, etc.)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 10; hour <= 21; hour++) {
      // 10am to 9pm
      ["00", "15", "30", "45"].forEach((minute) => {
        // Skip 9:45pm as any booking at this time would go past 10pm
        if (
          !(
            hour === 21 &&
            (minute === "45" || minute === "30" || minute === "15")
          )
        ) {
          times.push(`${hour}:${minute}`);
        }
      });
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Compute availability per time slot based on the selected date
  const availability = timeOptions.map((slot) => ({
    slot,
    allowed: DURS.filter((dur) => isSlotFree(selectedDate, slot, dur)),
  }));

  // Booking steps - now with merged date/time step
  const STEPS = [
    { title: t("booking.step_1"), component: DateTimeStep },
    { title: t("booking.step_3"), component: InfoStep },
    { title: t("booking.step_4"), component: PaymentStep },
    { title: t("booking.step_5"), component: InlineChatbotStep },
  ];
  const Current = STEPS[step - 1].component;
  const UI_STEPS = STEPS.length + 1;

  // Navigation logic
  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime && selectedDuration;
    if (step === 2) return formData.name && formData.email;
    if (step === 3) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Build the ISO timestamp for the consultation start time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointment_date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        minutes
      ).toISOString();

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("bookings")
          .insert({
            user_id: user?.id,
            appointment_date,
            duration_minutes: selectedDuration,
            name: formData.name,
            email: formData.email,
            payment_status: "pending",
          })
          .select("id")
          .single();

        if (error || !data) {
          throw error || new Error("Booking creation failed: No data returned");
        }

        setBookingId(data.id);
        setStep(3); // Go to payment step
      } catch (error) {
        console.error("Error creating booking:", error.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      setStep(4); // Go to chatbot step
    }
  };

  const handleSelectTime = ({ slot, dur }) => {
    setSelectedTime(slot);
    setSelectedDuration(dur);
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStepClick = (dot) => {
    if (dot === 1) onBackService();
    else setStep(dot - 1);
  };

  // Add Swiper CSS styles
  useEffect(() => {
    // Add custom styling for Swiper
    const style = document.createElement("style");
    style.textContent = `
      .swiper-slide {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .time-swiper .swiper-slide-active {
        font-weight: bold;
        color: white;
      }
      
      .time-swiper {
        height: 120px;
      }
      
      .duration-swiper .swiper-slide-active button {
        transform: scale(1.05);
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-4" id="bookingForm">
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("booking.title")}
        </h2>
        <div className="bg-oxfordBlue rounded-xl p-3 sm:p-6 shadow-xl">
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>

          {loading && step === 1 ? (
            <div className="flex justify-center py-6 sm:py-10">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-darkGold"></div>
            </div>
          ) : (
            <>
              {step === 1 ? (
                <DateTimeStep
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  currentMonth={currentMonth}
                  onChangeMonth={(inc) =>
                    setCurrentMonth((prev) => addMonths(prev, inc))
                  }
                  minDate={minDate}
                  availability={availability}
                  selectedTime={selectedTime}
                  selectedDuration={selectedDuration}
                  onSelectTime={handleSelectTime}
                />
              ) : step === 2 ? (
                <InfoStep formData={formData} onChange={handleChange} />
              ) : step === 3 ? (
                <PaymentStep
                  selectedDuration={selectedDuration}
                  bookingId={bookingId}
                  formData={formData}
                  onPaymentConfirmed={handlePaymentConfirmed}
                />
              ) : (
                <InlineChatbotStep
                  requestId={bookingId}
                  tableName="booking_chat_messages"
                />
              )}
            </>
          )}

          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={step + 1}
            onStepClick={handleStepClick}
          />

          <div className="flex justify-between mt-4 sm:mt-6">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : onBackService())}
              className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl"
            >
              {t("booking.back")}
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
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
                ) : step === 2 ? (
                  t("booking.complete_booking")
                ) : (
                  t("booking.next")
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
