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
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { autoCreateAccount } from "../../utils/autoSignup";
import ssl from "../../assets/icons/ssl-lock.svg";
import stripe from "../../assets/icons/stripe.svg";
// Shared StepIndicator
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
  return (
    <div className="flex items-center justify-center py-2 gap-1 md:gap-2">
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

function DateTimeStep({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
  selectedTime,
  selectedDuration,
  onSelectTime, // This callback should update both selectedTime and selectedDuration in parent
  availability, // Expects an array of { slot: "HH:mm", allowed: [durations] }
  minDate,
}) {
  // Calendar setup
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const prevMonthDays = [];
  const nextMonthDays = [];
  const firstDayOfWeek = days[0].getDay(); // Sunday is 0, Monday is 1
  const daysFromPrev = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust for Monday start
  for (let i = daysFromPrev; i > 0; i--)
    prevMonthDays.push(addDays(days[0], -i));
  const totalCells = 42; // 6 weeks * 7 days
  const daysFromNext = totalCells - (days.length + prevMonthDays.length);
  for (let i = 1; i <= daysFromNext; i++)
    nextMonthDays.push(addDays(days[days.length - 1], i));
  const calendar = [...prevMonthDays, ...days, ...nextMonthDays];

  const timeSlots = availability.filter((slot) => slot.allowed.length > 0);
  const availableTimes = timeSlots.map((slot) => slot.slot).sort();
  const availableDurations = [45, 60, 75, 90, 105, 120];

  const durationSwiperRef = useRef(null);
  const timeSwiperRef = useRef(null);

  const firstDurationDisplayHandled = useRef(false);
  const firstTimeDisplayHandled = useRef(false);

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes % 60 === 0) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 60)}h${minutes % 60}min`;
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "";
    const [h, m] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    const endDate = addMinutes(date, durationMinutes);
    return format(endDate, "HH:mm");
  };

  // Helper to get initial index for Swiper
  const getInitialIndex = (items, targetValue, fallbackIndex = 0) => {
    const index = items.indexOf(targetValue);
    return index > -1 ? index : fallbackIndex;
  };

  // Effect to set initial DURATION and select it
  useEffect(() => {
    if (durationSwiperRef.current && availableDurations.length > 0 && !selectedDuration && !firstDurationDisplayHandled.current) {
      const initialTargetDuration = 45; // "1h"
      const targetIndex = getInitialIndex(availableDurations, initialTargetDuration, 1); // Default to index 1 (60min)

      // Set "1h" (60 min) as selected by default
      if (availableDurations.includes(initialTargetDuration)) {
        onSelectTime({ slot: selectedTime, dur: initialTargetDuration });
      } else if (availableDurations.length > targetIndex) {
        // Fallback if 60 is not in the list (should not happen with fixed array)
        onSelectTime({ slot: selectedTime, dur: availableDurations[targetIndex] });
      }
      
      durationSwiperRef.current.slideTo(targetIndex, 0);
      firstDurationDisplayHandled.current = true;
    }
  }, [durationSwiperRef.current, availableDurations, selectedDuration, onSelectTime, selectedTime]);

  // Reset firstTimeDisplayHandled when selectedDate changes
  useEffect(() => {
    firstTimeDisplayHandled.current = false;
  }, [selectedDate]);

  // Effect to set initial TIME and select it
  useEffect(() => {
    if (timeSwiperRef.current && selectedDate && availableTimes.length > 0 && !selectedTime && !firstTimeDisplayHandled.current) {
      const initialTargetTime = "10:0";
      let targetIndex = availableTimes.indexOf(initialTargetTime);
      let timeToSelect = initialTargetTime;

      if (targetIndex === -1) { // "10:15" not found
        if (availableTimes.includes("10:00")) { // Check if "10:00" is available as a close alternative
            targetIndex = availableTimes.indexOf("10:00");
            timeToSelect = "10:15";
        } else if (availableTimes.length > 0) { // Fallback to the first available time
            targetIndex = 0;
            timeToSelect = availableTimes[0];
        } else { // No times available
            targetIndex = -1; // Indicate no valid selection
        }
      }
      
      if (targetIndex > -1 && timeToSelect) {
        const durationToEnsure = selectedDuration || 60; // Use current duration or default to 1h
        const timeSlotData = timeSlots.find(slot => slot.slot === timeToSelect);

        if (timeSlotData && timeSlotData.allowed.includes(durationToEnsure)) {
          onSelectTime({ slot: timeToSelect, dur: durationToEnsure });
        } else if (timeSlotData && timeSlotData.allowed.length > 0) {
          onSelectTime({ slot: timeToSelect, dur: timeSlotData.allowed[0] }); // Pick first allowed duration
        }
        // If no valid duration, onSelectTime might not be called, or you might clear duration
        timeSwiperRef.current.slideTo(targetIndex, 0);
      }
      firstTimeDisplayHandled.current = true;
    }
  }, [timeSwiperRef.current, selectedDate, availableTimes, selectedTime, onSelectTime, selectedDuration, timeSlots]);

  const isDurationAvailable = (duration) => {
    if (!selectedTime) return true;
    const timeSlot = timeSlots.find((slot) => slot.slot === selectedTime);
    return timeSlot && timeSlot.allowed.includes(duration);
  };

  const isTimeAvailable = (time) => {
    const timeSlot = timeSlots.find((slot) => slot.slot === time);
    return timeSlot && timeSlot.allowed.length > 0;
  };

  const handleDurationButtonClick = (duration) => {
    // 1. Update application state immediately to reflect the selection
    const currentTime = selectedTime || (availableTimes.indexOf("10:15") > -1 ? "10:15" : (availableTimes.length > 0 ? availableTimes[0] : null));
    onSelectTime({ slot: currentTime, dur: duration });
  
    // 2. Animate Swiper to center the clicked item
    const clickedItemIndex = availableDurations.indexOf(duration);
    if (durationSwiperRef.current && clickedItemIndex > -1) {
      const swiper = durationSwiperRef.current;
      const slidesPerView = 3; // Your current configuration
      const middleOffset = Math.floor(slidesPerView / 2); // This will be 1
  
      // Calculate the target index for the leftmost slide to center the clickedItemIndex
      let targetLeftmostIndex = clickedItemIndex - middleOffset;
  
      // Clamp the targetLeftmostIndex to ensure it's within valid Swiper bounds
      // The maximum index the leftmost slide can be is (total items - slidesPerView)
      const maxPossibleLeftmostIndex = Math.max(0, availableDurations.length - slidesPerView);
      targetLeftmostIndex = Math.max(0, Math.min(targetLeftmostIndex, maxPossibleLeftmostIndex));
  
      // Only slide if the swiper is not already at the target position
      if (swiper.realIndex !== targetLeftmostIndex) {
        swiper.slideTo(targetLeftmostIndex);
      }
    }
  };

  const handleTimeButtonClick = (time) => {
    // 1. Update application state immediately
    const currentDuration = selectedDuration || 60; // Default or current selected duration
    const timeSlotData = timeSlots.find(slot => slot.slot === time);
    let newDurationForSelectedTime = currentDuration;
  
    if (timeSlotData) {
      if (!timeSlotData.allowed.includes(newDurationForSelectedTime)) {
        if (timeSlotData.allowed.length > 0) {
          newDurationForSelectedTime = timeSlotData.allowed[0]; // Pick first allowed duration
        } else {
          newDurationForSelectedTime = null; // No allowed duration for this new time
        }
      }
    } else {
      // Should not happen if isTimeAvailable(time) was true before click
      newDurationForSelectedTime = null;
    }
    onSelectTime({ slot: time, dur: newDurationForSelectedTime });
  
    // 2. Animate Swiper to center the clicked item
    const clickedItemIndex = availableTimes.indexOf(time);
    if (timeSwiperRef.current && clickedItemIndex > -1) {
      const swiper = timeSwiperRef.current;
      const slidesPerView = 3; // Your current configuration
      const middleOffset = Math.floor(slidesPerView / 2); // This will be 1
  
      let targetLeftmostIndex = clickedItemIndex - middleOffset;
  
      const maxPossibleLeftmostIndex = Math.max(0, availableTimes.length - slidesPerView);
      targetLeftmostIndex = Math.max(0, Math.min(targetLeftmostIndex, maxPossibleLeftmostIndex));
      
      if (swiper.realIndex !== targetLeftmostIndex) {
        swiper.slideTo(targetLeftmostIndex);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Calendar Section */}
      <div className="bg-white/5 rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between bg-oxfordBlue/30 p-3">
          <button
            onClick={() => onChangeMonth(-1)}
            className="text-white hover:text-darkGold p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-xl text-white font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button
            onClick={() => onChangeMonth(1)}
            className="text-white hover:text-darkGold p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="p-2 md:p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center py-1 text-darkGold font-semibold text-xs">{day.charAt(0)}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((date, i) => {
              const inMonth = isSameMonth(date, currentMonth);
              const weekend = isWeekend(date);
              const tooSoon = isBefore(date, minDate);
              const isSelectedDate = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isSameDay(date, new Date()); // Use isSameDay for today's check
              const disabled = !inMonth || weekend || tooSoon;
              return (
                <button
                  key={i}
                  onClick={() => !disabled && onSelectDate(date)}
                  disabled={disabled}
                  className={`
                    relative h-8 aspect-square rounded-md flex items-center justify-center transition-all duration-200
                    ${isSelectedDate ? "bg-darkGold text-black font-bold shadow-md"
                      : inMonth && !disabled ? "bg-white/10 text-white "
                      : "bg-white/5 text-white/40"}
                    ${isCurrentDay && !isSelectedDate ? "ring-1 ring-darkGold ring-opacity-70" : ""}
                    ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <span className="text-xs font-medium">{format(date, "d")}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time & Duration Selection */}
      <div className="space-y-4">
      {/* Duration Carousel */}
      <div>
        <h4 className="text-white text-sm font-medium mb-2">Duration</h4>
        {selectedDate ? (
          <div className="carousel-container">
            <Swiper
              modules={[Navigation, Pagination]} // Keep your existing modules
              slidesPerView={3}
              spaceBetween={8}
              onSwiper={(swiper) => { durationSwiperRef.current = swiper; }}
              // MODIFICATION: Use onTransitionEnd instead of onSlideChange
              onTransitionEnd={(swiper) => {
                const slidesPerView = swiper.params.slidesPerView; // Should be 3
                const middleOffset = Math.floor(slidesPerView / 2); // Should be 1
                // realIndex is the first visible slide in the current view from your data array
                const middleDataIndex = swiper.realIndex + middleOffset;

                if (availableDurations.length > 0 && middleDataIndex >= 0 && middleDataIndex < availableDurations.length) {
                  const newSelectedDuration = availableDurations[middleDataIndex];
                  
                  // Only update if the settled duration is different from the currently selected one
                  // AND if it's an actually available/valid duration choice.
                  if (newSelectedDuration !== selectedDuration && isDurationAvailable(newSelectedDuration)) {
                    // Call the main state updater directly.
                    // This preserves the currently selected time.
                    // selectedTime comes from the component's props.
                    onSelectTime({ slot: selectedTime, dur: newSelectedDuration });
                  }
                }
              }}
              className="carousel-swiper"
            >
              {availableDurations.map((duration) => (
                <SwiperSlide key={duration}>
                  <button
                    onClick={() => handleDurationButtonClick(duration)} // Click handler remains unchanged
                    disabled={!isDurationAvailable(duration)}
                    className={`carousel-item
                      ${selectedDuration === duration ? "bg-darkGold text-black font-bold"
                        : isDurationAvailable(duration) ? "bg-white/10 text-white"
                        : "bg-white/5 text-white/40 cursor-not-allowed opacity-50"
                      }`}
                  >
                    {formatDuration(duration)}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="empty-carousel-container">
            <p className="text-white/50 text-sm">Select a date first</p>
          </div>
        )}
      </div>

      {/* Time Carousel */}
      <div>
        <h4 className="text-white text-sm font-medium mb-2">Time</h4>
        {selectedDate && availableTimes.length > 0 ? (
          <div className="carousel-container">
            <Swiper
              modules={[Navigation, Pagination]} // Keep your existing modules
              slidesPerView={3}
              spaceBetween={8}
              onSwiper={(swiper) => { timeSwiperRef.current = swiper; }}
              // MODIFICATION: Use onTransitionEnd instead of onSlideChange
              onTransitionEnd={(swiper) => {
                const slidesPerView = swiper.params.slidesPerView; // Should be 3
                const middleOffset = Math.floor(slidesPerView / 2); // Should be 1
                const middleDataIndex = swiper.realIndex + middleOffset;

                if (availableTimes.length > 0 && middleDataIndex >= 0 && middleDataIndex < availableTimes.length) {
                  const newSelectedTime = availableTimes[middleDataIndex];

                  // Only update if the settled time is different from the currently selected one
                  // AND if it's an actually available/valid time choice.
                  if (newSelectedTime !== selectedTime && isTimeAvailable(newSelectedTime)) {
                    // Replicate the logic from your original handleTimeButtonClick
                    // to adjust duration if the new time doesn't support the current duration.
                    let newDurationForSelectedTime = selectedDuration || 60; // Default or current
                    const timeSlotData = timeSlots.find(slot => slot.slot === newSelectedTime);

                    // isTimeAvailable(newSelectedTime) already ensures timeSlotData exists and has allowed durations.
                    // So, timeSlotData should be valid here.
                    if (timeSlotData && !timeSlotData.allowed.includes(newDurationForSelectedTime)) {
                      // If current duration is not allowed, pick the first allowed one.
                      // isTimeAvailable ensures timeSlotData.allowed has length > 0.
                      newDurationForSelectedTime = timeSlotData.allowed[0];
                    }
                    
                    // Call the main state updater directly.
                    onSelectTime({ slot: newSelectedTime, dur: newDurationForSelectedTime });
                  }
                }
              }}
              className="carousel-swiper"
            >
              {availableTimes.map((time) => (
                <SwiperSlide key={time}>
                  <button
                    onClick={() => handleTimeButtonClick(time)} // Click handler remains unchanged
                    disabled={!isTimeAvailable(time)}
                    className={`carousel-item
                      ${selectedTime === time ? "bg-darkGold text-black font-bold"
                        : isTimeAvailable(time) ? "bg-white/10 text-white"
                        : "bg-white/5 text-white/40 cursor-not-allowed opacity-50"
                      }`}
                  >
                    {time}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          ) : (
            <div className="empty-carousel-container">
              <p className="text-white/50 text-sm">
                {selectedDate ? "No available times" : "Select a date first"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compact Booking Summary */}
      <div className="flex flex-col items-center">
        <div className="mb-2">
          <div className="px-4 py-1 text-white text-center">
            {selectedDate ? format(selectedDate, "EEE, MMM d") : "-- --- --"}
          </div>
        </div>
        <div className="flex w-full justify-center gap-6">
          <div className="flex flex-col items-center">
            <div className="text-white/80 text-sm">from</div>
            <div className="px-2 py-1 text-white w-16 text-center">
              {selectedTime || "--:--"}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-white/80 text-sm">to</div>
            <div className="px-2 py-1 text-white w-16 text-center">
              {selectedTime && selectedDuration
                ? calculateEndTime(selectedTime, selectedDuration)
                : "--:--"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Contact Info
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

// Step 3: Payment
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

  // Calculate price based on duration
  const sessionPrice = isTestBooking ? 0 : (selectedDuration * 1.5).toFixed(2);

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col gap-5">
        {/* Booking Details Summary */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="bg-white/5 p-3 border-b border-white/10">
            <h3 className="text-white font-medium">Booking Details</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Duration:</span>
              <span className="text-white">{selectedDuration} minutes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Price:</span>
              <span className="text-white font-medium">€{sessionPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Email:</span>
              <span className="text-white">{formData.email}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div
          className={`p-4 rounded-lg border ${
            paymentConfirmed
              ? "border-green-500/30 bg-green-500/10"
              : paymentStarted
              ? "border-yellow-500/30 bg-yellow-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex items-center">
            {paymentConfirmed ? (
              // Confirmed state
              <div className="flex items-center text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                <span>Payment confirmed</span>
              </div>
            ) : paymentStarted ? (
              // Pending state
              <div className="flex items-center text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></div>
                <span>Awaiting payment</span>
              </div>
            ) : (
              // Initial state
              <div className="flex items-center text-white/60">
                <div className="w-2 h-2 rounded-full bg-white/60 mr-2"></div>
                <span>Ready for payment</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Action */}
        {!paymentConfirmed && (
          <button
            onClick={handleStripeRedirect}
            className="mt-2 py-3 px-4 bg-gradient-to-r from-darkGold to-yellow-500 text-black font-medium rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isTestBooking
              ? "Process Test Payment (€0.00)"
              : `Complete Payment (€${sessionPrice})`}
          </button>
        )}

<div className="mt-4 flex justify-center items-center gap-4">
       {/* Stripe badge */}
       <img
         src={stripe}
         alt="Secure payments powered by Stripe"
         className="h-8 opacity-90"
       />
       {/* SSL lock icon */}
       <img
         src={ssl}
         alt="SSL Secured"
         className="h-8 opacity-90"
       />
     </div>

        {/* Help Text */}
        {paymentStarted && !paymentConfirmed && (
          <p className="text-center text-white/70 text-sm mt-2">
            The payment window has opened in a new tab. We're waiting for Stripe
            to confirm your payment.
          </p>
        )}

        {paymentConfirmed && (
          <p className="text-center text-green-400 text-sm mt-2">
            Your payment has been successfully processed. You can now proceed to
            the next step.
          </p>
        )}
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
    email: user?.email || "",
  });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const formRef = useScrollToTopOnChange([step]);

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
    { title: t("booking.step_2"), component: InfoStep },
    { title: t("booking.step_3"), component: PaymentStep },
    { title: t("booking.step_4"), component: InlineChatbotStep },
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
      // Simply move to step 2 when on datetime step
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

        // Auto-create account if user is not logged in
        if (!user && formData.name && formData.email) {
          const accountResult = await autoCreateAccount(
            formData.name,
            formData.email
          );

          // Optional: If you're using notifications
          if (accountResult.success && !accountResult.userExists) {
            console.log("Account created successfully");
          }
        }

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

  const loadingSpinner = (
    <span className="flex items-center">
      <svg
        className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" // Or text-black if on darkGold bg
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
  );

  return (
    <section
      className="py-4 sm:py-6 md:py-8 px-4 sm:px-4"
      id="bookingForm"
      ref={formRef}
    >
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("booking.title")}
        </h2>
        <div className="bg-oxfordBlue rounded-xl p-8 sm:p-6 shadow-xl">
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>

          {/* Initial loading for bookings data, primarily affecting step 1 */}
          {loading && step === 1 && !selectedDate ? ( // More specific condition for initial load
            <div className="flex justify-center py-6 sm:py-10">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-darkGold"></div>
            </div>
          ) : (
            <div className="flex flex-col"> {/* Common wrapper for step content and navigation */}
              {/* Step Content */}
              {step === 1 && (
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
              )}
              {step === 2 && (
                <InfoStep formData={formData} onChange={handleChange} />
              )}
              {step === 3 && (
                <PaymentStep
                  selectedDuration={selectedDuration}
                  bookingId={bookingId}
                  formData={formData}
                  onPaymentConfirmed={handlePaymentConfirmed}
                />
              )}
              {step === 4 && (
                <InlineChatbotStep
                  requestId={bookingId}
                  tableName="booking_chat_messages"
                  workflowKey="booking_confirmation"
                  initialMessage={`Welcome, ${formData.name}! Your booking has been confirmed. I'm here to answer any questions about your upcoming session.`}
                  placeholderText="Ask any questions about your booking..."
                  onFinish={() => {
                    axios.post(
                      `${process.env.REACT_APP_N8N_BOOKING_COMPLETE_WEBHOOK}`,
                      { session_id: bookingId }
                    )
                    .catch(err => console.error("Webhook error:", err));
                  }}
                />
              )}

              {/* Step Indicator - common to all steps */}
              <StepIndicator
                stepCount={UI_STEPS}
                currentStep={step + 1} // e.g. internal step 1 is UI step 2
                onStepClick={handleStepClick} // Ensure handleStepClick is robust for all steps
              />

              {/* Navigation Buttons - common structure, text/action varies */}
              <div className="flex justify-between mt-2"> {/* Added mt-2 for spacing */}
                <button
                  onClick={() => (step === 1 ? onBackService() : setStep(step - 1))}
                  disabled={loading && step === 2} // Example: disable back if a crucial forward step is processing
                  className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl disabled:opacity-50"
                >
                  {t("booking.back")}
                </button>

                {step < STEPS.length ? ( // Show "Next" button if not the last step
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50"
                  >
                    {loading ? loadingSpinner : (
                      step === 1 ? t("booking.step_2") :
                      step === 2 ? t("booking.step_3") :
                      step === 3 ? t("booking.step_4") : // Default/fallback if needed
                      "Next" // Should not be reached if step < STEPS.length
                    )}
                  </button>
                ) : ( // Last step (step === STEPS.length, which is step 4)
                  <button
                    onClick={() => {
                        // The InlineChatbotStep's onFinish prop already handles the webhook.
                        // This button can navigate away or close the form.
                        onBackService(); // Example: Close form or go back to service selection
                    }}
                    disabled={loading} // If any final processing might be indicated by 'loading'
                    className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50"
                  >
                    {t("booking.finish", "Finish")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}