import React, { useState, useEffect, useRef, useContext } from "react";
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
  startOfDay,
  isEqual, // Added isEqual
  isAfter, // Added isAfter
} from "date-fns";
import { fetchBookings, fetchAllBookingsForConflictCheck, isSlotFree as checkSlotIsFree, getAvailableTimesForDateAndDuration } from "../../services/bookingService"; // Assuming bookingService is updated
import InlineChatbotStep from "../chat/InlineChatbotStep";
import axios from "axios";
import { useTranslation } from 'react-i18next';

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { AuthModalContext } from "../../App";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
// Removed autoCreateAccount
import ssl from "../../assets/icons/ssl-lock.svg";
import stripe from "../../assets/icons/stripe.svg";
import PhoneInput from "react-phone-input-2"; // Added for InfoStep
import "react-phone-input-2/lib/style.css"; // Added for InfoStep
import { validatePhoneNumber } from "../../utils/phoneValidation"; // Added for InfoStep

// Shared StepIndicator
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
  return (
    <div className={`flex items-center justify-center py-2 gap-1 md:gap-2 ${className}`}>
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
  onSelectTime,
  availability, // This will be pre-calculated and passed in
  minDate,
}) {
  const { t } = useTranslation();
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

  const timeSlots = availability.filter((slot) => slot.allowed.length > 0);
  const availableTimes = timeSlots.map((slot) => slot.slot).sort();
  const availableDurations = [45, 60, 75, 90, 105, 120]; // Standard durations

  const durationSwiperRef = useRef(null);
  const timeSwiperRef = useRef(null);

  const firstDurationDisplayHandled = useRef(false);
  const firstTimeDisplayHandled = useRef(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const calendarGridRef = useRef(null); 

  const handleTouchStart = (e) => {
    const startX = e.targetTouches[0].clientX;
    touchStartX.current = startX;
    // FIX: Initialize end position to prevent misinterpretation of taps as swipes.
    touchEndX.current = startX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) { 
      onChangeMonth(1);
    }

    if (touchStartX.current - touchEndX.current < -75) { 
      onChangeMonth(-1);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };


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

  const getInitialIndex = (items, targetValue, fallbackIndex = 0) => {
    const index = items.indexOf(targetValue);
    return index > -1 ? index : fallbackIndex;
  };

  useEffect(() => {
    if (
      durationSwiperRef.current &&
      availableDurations.length > 0 &&
      !selectedDuration && // Only if no duration is selected
      !firstDurationDisplayHandled.current // And first display not handled
    ) {
      const initialTargetDuration = 45; // Default to 45 min
      const targetIndex = getInitialIndex(
        availableDurations,
        initialTargetDuration,
        0 // Fallback to the first available duration if 45 is not an option
      );

      // Select the duration if it's available in the list
      if (availableDurations.length > targetIndex) {
        onSelectTime({
          slot: selectedTime, // Keep current time or let it be set by time swiper
          dur: availableDurations[targetIndex],
        });
      }
      
      durationSwiperRef.current.slideTo(targetIndex, 0); // Move swiper to target
      firstDurationDisplayHandled.current = true; // Mark as handled
    }
  }, [
    durationSwiperRef,
    availableDurations,
    selectedDuration,
    onSelectTime,
    selectedTime, // Added selectedTime dependency
  ]);

  useEffect(() => {
    // Reset time display handler when date changes
    firstTimeDisplayHandled.current = false;
  }, [selectedDate]);


  useEffect(() => {
    if (
      timeSwiperRef.current &&
      selectedDate && // Ensure a date is selected
      availableTimes.length > 0 &&
      !selectedTime && // Only if no time is selected yet
      !firstTimeDisplayHandled.current // And first display not handled
    ) {
      const initialTargetTime = "10:00"; // Default to 10:00 AM
      let targetIndex = availableTimes.indexOf(initialTargetTime);
      let timeToSelect = initialTargetTime;

      if (targetIndex === -1) { // If 10:00 AM is not available
        if (availableTimes.length > 0) {
          targetIndex = 0; // Default to the first available time
          timeToSelect = availableTimes[0];
        } else {
          targetIndex = -1; // No times available
        }
      }

      if (targetIndex > -1 && timeToSelect) {
        const durationToEnsure = selectedDuration || 45; // Default to 45 min if none selected
        const timeSlotData = timeSlots.find(
          (slot) => slot.slot === timeToSelect
        );

        if (timeSlotData && timeSlotData.allowed.includes(durationToEnsure)) {
          onSelectTime({ slot: timeToSelect, dur: durationToEnsure });
        } else if (timeSlotData && timeSlotData.allowed.length > 0) {
          // If preferred duration not allowed for this time, pick first allowed duration
          onSelectTime({ slot: timeToSelect, dur: timeSlotData.allowed[0] });
        }
        timeSwiperRef.current.slideTo(targetIndex, 0); // Move swiper
      }
      firstTimeDisplayHandled.current = true; // Mark as handled
    }
  }, [
    timeSwiperRef,
    selectedDate,
    availableTimes,
    selectedTime,
    onSelectTime,
    selectedDuration,
    timeSlots, // timeSlots is now a dependency
  ]);

  const isDurationAvailable = (duration) => {
    if (!selectedTime) return true; // If no time selected, assume all durations are potentially available
    const timeSlot = timeSlots.find((slot) => slot.slot === selectedTime);
    return timeSlot && timeSlot.allowed.includes(duration);
  };

  const isTimeAvailable = (time) => {
    const timeSlot = timeSlots.find((slot) => slot.slot === time);
    return timeSlot && timeSlot.allowed.length > 0;
  };

  const handleDurationButtonClick = (duration) => {
    const currentTime =
      selectedTime ||
      (availableTimes.indexOf("10:00") > -1
        ? "10:00"
        : availableTimes.length > 0
        ? availableTimes[0]
        : null);
    onSelectTime({ slot: currentTime, dur: duration });

    const clickedItemIndex = availableDurations.indexOf(duration);
    if (durationSwiperRef.current && clickedItemIndex > -1) {
      const swiper = durationSwiperRef.current;
      const slidesPerView = 3; 
      const middleOffset = Math.floor(slidesPerView / 2);
      let targetLeftmostIndex = clickedItemIndex - middleOffset;
      const maxPossibleLeftmostIndex = Math.max(
        0,
        availableDurations.length - slidesPerView
      );
      targetLeftmostIndex = Math.max(
        0,
        Math.min(targetLeftmostIndex, maxPossibleLeftmostIndex)
      );
      if (swiper.realIndex !== targetLeftmostIndex) {
        swiper.slideTo(targetLeftmostIndex);
      }
    }
  };

  const handleTimeButtonClick = (time) => {
    const currentDuration = selectedDuration || 45; // Default duration
    const timeSlotData = timeSlots.find((slot) => slot.slot === time);
    let newDurationForSelectedTime = currentDuration;

    if (timeSlotData) {
      if (!timeSlotData.allowed.includes(newDurationForSelectedTime)) {
        if (timeSlotData.allowed.length > 0) {
          newDurationForSelectedTime = timeSlotData.allowed[0];
        } else {
          newDurationForSelectedTime = null; 
        }
      }
    } else {
      newDurationForSelectedTime = null; 
    }
    onSelectTime({ slot: time, dur: newDurationForSelectedTime });

    const clickedItemIndex = availableTimes.indexOf(time);
    if (timeSwiperRef.current && clickedItemIndex > -1) {
      const swiper = timeSwiperRef.current;
      const slidesPerView = 3;
      const middleOffset = Math.floor(slidesPerView / 2);
      let targetLeftmostIndex = clickedItemIndex - middleOffset;
      const maxPossibleLeftmostIndex = Math.max(
        0,
        availableTimes.length - slidesPerView
      );
      targetLeftmostIndex = Math.max(
        0,
        Math.min(targetLeftmostIndex, maxPossibleLeftmostIndex)
      );
      if (swiper.realIndex !== targetLeftmostIndex) {
        swiper.slideTo(targetLeftmostIndex);
      }
    }
  };


  return (
    <div className="flex flex-col space-y-4">
      <div
        ref={calendarGridRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white/5 rounded-xl shadow-md overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between bg-oxfordBlue/30 p-3">
          <button
            onClick={() => onChangeMonth(-1)}
            className="text-white hover:text-darkGold p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div className="p-2 md:p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center py-1 text-darkGold font-semibold text-xs">
                {day.charAt(0)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((date, i) => {
              const isSelectedDate = selectedDate && isSameDay(date, selectedDate);
              const isCurrentCalendarPageMonth = isSameMonth(date, currentMonth);
              const isPastDay = isBefore(date, startOfDay(minDate)); 
              const isTodayDay = isSameDay(date, new Date());
              const isWeekendDay = isWeekend(date);

              // MODIFICATION START
              // Define if the day is a padding day from the *previous* month
              const isPreviousMonthPadding = !isCurrentCalendarPageMonth && date < startOfMonth(currentMonth);

              // isDisabledForSelection now allows selection of next month's visible days
              // It disables weekends, past days, and padding days from the PREVIOUS month.
              const isDisabledForSelection = isWeekendDay || isPastDay || isPreviousMonthPadding;
              // MODIFICATION END

              let dayButtonClasses = "relative h-8 aspect-square rounded-md flex items-center justify-center transition-all duration-200 text-xs font-medium ";

              if (isSelectedDate) {
                dayButtonClasses += "bg-darkGold text-black font-bold shadow-md";
              } else if (isDisabledForSelection) {
                dayButtonClasses += "bg-white/5 text-white/40 cursor-not-allowed";
              } else {
                dayButtonClasses += "bg-white/10 text-white hover:bg-darkGold/20 cursor-pointer";
                if (isTodayDay) {
                  dayButtonClasses += " ring-1 ring-darkGold ring-opacity-70";
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => !isDisabledForSelection && onSelectDate(date)}
                  disabled={isDisabledForSelection}
                  className={dayButtonClasses}
                >
                  <span className="text-xs font-medium">
                    {format(date, "d")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time & Duration Selection (No changes here) */}
      <div className="space-y-4">
        <div>
          <h4 className="text-white text-sm font-medium mb-2">Duration</h4>
          {selectedDate ? (
            <div className="carousel-container">
              <Swiper
                modules={[Navigation, Pagination]}
                slidesPerView={3}
                spaceBetween={8}
                onSwiper={(swiper) => { durationSwiperRef.current = swiper; }}
                onTransitionEnd={(swiper) => { /* ... */ }}
                className="carousel-swiper"
              >
                {availableDurations.map((duration) => (
                  <SwiperSlide key={duration}>
                    <button
                      onClick={() => handleDurationButtonClick(duration)}
                      disabled={!isDurationAvailable(duration)}
                      className={`carousel-item ${selectedDuration === duration ? "bg-darkGold text-black font-bold" : isDurationAvailable(duration) ? "bg-white/10 text-white" : "bg-white/5 text-white/40 cursor-not-allowed opacity-50"}`}
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

        <div>
          <h4 className="text-white text-sm font-medium mb-2">Time</h4>
          {selectedDate && availableTimes.length > 0 ? (
            <div className="carousel-container">
              <Swiper
                modules={[Navigation, Pagination]}
                slidesPerView={3}
                spaceBetween={8}
                onSwiper={(swiper) => { timeSwiperRef.current = swiper; }}
                onTransitionEnd={(swiper) => { /* ... */ }}
                className="carousel-swiper"
              >
                {availableTimes.map((time) => (
                  <SwiperSlide key={time}>
                    <button
                      onClick={() => handleTimeButtonClick(time)}
                      disabled={!isTimeAvailable(time)}
                      className={`carousel-item ${selectedTime === time ? "bg-darkGold text-black font-bold" : isTimeAvailable(time) ? "bg-white/10 text-white" : "bg-white/5 text-white/40 cursor-not-allowed opacity-50"}`}
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

      {/* Compact Booking Summary (No changes here) */}
      <div className="flex flex-col items-center !mb-2">
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
              {selectedTime && selectedDuration ? calculateEndTime(selectedTime, selectedDuration) : "--:--"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Contact Info / Signup
function InfoStep({ formData, onFormChange, onPhoneChange, user, isPhoneValid, onPhoneValidation }) {
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const phoneValidationTimeout = useRef(null);

  const EyeIcon = ({ color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = ({ color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  const handleLocalPhoneChange = (newPhone) => {
    onPhoneChange(newPhone); // Update parent state
    onPhoneValidation(false); // Reset validation status in parent
    setPhoneError("");

    if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current);

    if (newPhone.replace(/\D/g, "").length < 8) return;

    phoneValidationTimeout.current = setTimeout(async () => {
      setValidatingPhone(true);
      const result = await validatePhoneNumber(newPhone);
      setValidatingPhone(false);
      onPhoneValidation(result.isValid);
      if (!result.isValid) {
        setPhoneError(t("coaching_request.form.phone_validation_error"));
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current);
    };
  }, []);

  return (
    <div className="space-y-6 mb-4 max-w-md mx-auto w-full">
      <div className="space-y-4 text-left">
        <div>
          <label htmlFor="booking-name" className="block text-white text-sm font-medium mb-1.5">
            {t("booking.name_label", "Full Name")}
          </label>
          <input id="booking-name" name="name" placeholder={t("booking.name_placeholder", "Enter your full name")} value={formData.name} onChange={onFormChange} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm" required/>
        </div>
        <div>
          <label htmlFor="booking-email" className="block text-white text-sm font-medium mb-1.5">
            {t("booking.email_label", "Email Address")}
          </label>
          <input id="booking-email" name="email" type="email" placeholder={t("booking.email_placeholder", "Enter your email")} value={formData.email} onChange={onFormChange} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm" required readOnly={!!user}/>
          {!!user && <p className="text-xs text-white/60 mt-1">{t("edit_profile.form.email.cannot_change", "Email cannot be changed")}</p>}
        </div>

        {!user && (
          <>
            <div>
              <label htmlFor="booking-phone" className="block text-white text-sm font-medium mb-1.5">
                {t("coaching_request.form.phone_label", "Phone Number")}
              </label>
              <div className="relative">
                <PhoneInput
                    inputProps={{ name: 'phone', required: true, id: 'booking-phone' }}
                    containerClass="!w-full"
                    inputClass={`!w-full !px-3 !py-2.5 !text-sm !bg-white/5 !border !border-white/10 !rounded-xl !text-white !placeholder-white/50 focus:!ring-2 focus:!ring-darkGold`}
                    buttonClass="!bg-white/5 !border-y !border-l !border-white/10 !rounded-l-xl"
                    dropdownClass="!bg-oxfordBlue"
                    searchClass="!bg-white !text-black !placeholder-gray-500 !rounded-md !my-2"
                    country={'es'}
                    value={formData.phone}
                    onChange={handleLocalPhoneChange}
                    enableSearch={true}
                />
                {formData.phone && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    {validatingPhone ? (
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : isPhoneValid ? (
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    )}
                  </div>
                )}
              </div>
              {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
            </div>
            <div>
              <label htmlFor="booking-password" className="block text-white text-sm font-medium mb-1.5">{t('auth.signup.password.label')}</label>
              <div className="relative">
                <input id="booking-password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={onFormChange} placeholder={t('auth.signup.password.placeholder')} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="booking-confirmPassword" className="block text-white text-sm font-medium mb-1.5">{t('auth.signup.confirm_password.label')}</label>
              <div className="relative">
                <input id="booking-confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={onFormChange} placeholder={t('auth.signup.confirm_password.placeholder')} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {!user && (
        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 mt-6">
          <div className="pt-2">
            <p className="text-white/80 text-sm mb-2">{t("booking.login_prompt_simple", "Already have an account?")}</p>
            <button type="button" onClick={openAuthModal} className="inline-flex items-center justify-center bg-darkGold text-black font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90 transition-colors text-sm">
              {t("booking.login_button", "Log In Here")}
            </button>
          </div>
        </div>
      )}
       {user && ( 
         <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10 mt-4">
            <p className="text-white/70 text-sm">Logged in as {formData.email}</p>
         </div>
       )}
    </div>
  );
}

// Step 3: Payment
function PaymentStep({
  selectedDuration,
  bookingId,
  onPaymentConfirmed,
  formData, // formData now includes email
}) {
  const { t } = useTranslation();
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isTestBooking, setIsTestBooking] = useState(false); // Kept for potential testing
  const [pollingError, setPollingError] = useState(null);

  useEffect(() => {
    const pendingId = localStorage.getItem("pendingPaymentId");
    if (pendingId && pendingId === bookingId?.toString()) {
      setPaymentStarted(true); // If returning from Stripe and ID matches
      localStorage.removeItem("pendingPaymentId"); // Clean up
    }
  }, [bookingId]);


  const handleStripeRedirect = async () => {
    try {
      if (!bookingId) {
         console.error("Booking ID is not available for Stripe redirect.");
         setPollingError(t('booking.payment.error_missing_id'));
         return;
      }
      // Store bookingId to check on return (helps if user closes tab)
      localStorage.setItem("pendingPaymentId", bookingId.toString());

      const { data } = await axios.post(
        "/.netlify/functions/createStripeSession", // Ensure this is your correct Netlify function URL
        {
          bookingId,
          duration: selectedDuration,
          email: formData.email, // Use email from formData
          isTestBooking, // This can be a toggle in UI or hardcoded for testing
        }
      );

      window.open(data.url, "_blank"); // Open Stripe checkout in a new tab
      setPaymentStarted(true); // Indicate that Stripe process has started
    } catch (error) {
      console.error("Error creating Stripe session:", error);
      setPollingError(t('booking.payment.error_start_process'));
    }
  };

  useEffect(() => {
    if (!paymentStarted || !bookingId) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `/.netlify/functions/getBookingStatus?id=${bookingId}` // Your Netlify function
        );
        if (response.data.paymentStatus === "paid") {
          setPaymentConfirmed(true);
          onPaymentConfirmed(true); // Notify parent component
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPollingError(t('booking.payment.error_check_status'));
        clearInterval(interval); // Stop polling on error
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [paymentStarted, bookingId, onPaymentConfirmed, t]);

  const sessionPrice = isTestBooking ? "0.00" : (selectedDuration * 1.5).toFixed(2);

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="bg-white/5 p-3 border-b border-white/10">
            <h3 className="text-white font-medium">{t('booking.payment.title')}</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('booking.payment.duration')}</span>
              <span className="text-white">{t('booking.payment.duration_value', { duration: selectedDuration })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('booking.payment.price')}</span>
              <span className="text-white font-medium">€{sessionPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('booking.payment.email')}</span>
              <span className="text-white break-all">{formData.email}</span>
            </div>
          </div>
        </div>

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
              <div className="flex items-center text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                <span>{t('booking.payment.status_confirmed')}</span>
              </div>
            ) : paymentStarted ? (
              <div className="flex items-center text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></div>
                <span>{t('booking.payment.status_awaiting')}</span>
              </div>
            ) : (
              <div className="flex items-center text-white/60">
                <div className="w-2 h-2 rounded-full bg-white/60 mr-2"></div>
                <span>{t('booking.payment.status_ready')}</span>
              </div>
            )}
          </div>
        </div>

        {!paymentConfirmed && (
          <button
            onClick={handleStripeRedirect}
            className="mt-2 py-3 px-4 bg-gradient-to-r from-darkGold to-yellow-500 text-black font-medium rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isTestBooking ? t('booking.payment.button_process_test') : t('booking.payment.button_complete_payment', { price: sessionPrice })}
          </button>
        )}
         {pollingError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm text-center">
            {pollingError}
          </div>
        )}

        <div className="mb-4 flex justify-center items-center gap-4">
          <img src={stripe} alt={t('booking.payment.alt_stripe')} className="h-8 opacity-90"/>
          <img src={ssl} alt={t('booking.payment.alt_ssl')} className="h-8 opacity-90" />
        </div>

        {paymentStarted && !paymentConfirmed && !pollingError && (
          <p className="text-center text-white/70 text-sm mt-2">
            {t('booking.payment.prompt_window_opened')}
          </p>
        )}

        {paymentConfirmed && (
          <p className="text-center text-green-400 text-sm mt-2">
            {t('booking.payment.prompt_success')}
          </p>
        )}
      </div>
    </div>
  );
}

// Main Booking Component
export default function Booking({ onBackService }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { user, signUp: contextSignUp } = useAuth(); // Renamed signUp
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allBookings, setAllBookings] = useState([]); // Store all bookings for conflict checking
  const [dailyAvailability, setDailyAvailability] = useState([]); // Store available slots for selectedDate
  const [isPhoneValidInParent, setIsPhoneValidInParent] = useState(false); // For InfoStep

  const [formData, setFormData] = useState({
    name: "", 
    email: "",
    password: "",   
    confirmPassword: "" 
  });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(true); // Combined loading state
  const [bookingId, setBookingId] = useState(null);
  const formRef = useScrollToTopOnChange([step]);

  const minDate = addDays(new Date(), 1); // Min booking date is tomorrow

  const handlePhoneValidationInParent = (isValid) => {
    setIsPhoneValidInParent(isValid);
  };
  
  // Fetch all bookings once on mount or when user changes (if user-specific bookings are needed for general conflict)
  useEffect(() => {
    async function loadAllBookings() {
      setLoading(true);
      try {
        const { data, error } = await fetchAllBookingsForConflictCheck(); // Use the service
        if (error) throw error;
        setAllBookings(data || []);
      } catch (error) {
        console.error("Error loading all bookings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllBookings();
  }, []);

  // Update daily availability when selectedDate or allBookings change
  useEffect(() => {
    if (selectedDate && allBookings.length > 0) {
      setLoading(true); // Indicate loading for availability calculation
      const DURS = [45, 60, 75, 90, 105, 120]; // Standard durations
      const timeOpts = [];
      for (let hour = 10; hour <= 21; hour++) {
        ["00", "15", "30", "45"].forEach((minute) => {
          if (!(hour === 21 && (minute === "45" || minute === "30" || minute === "15"))) {
            timeOpts.push(`${String(hour).padStart(2, '0')}:${minute}`);
          }
        });
      }

      const availabilityForDate = timeOpts.map((slot) => ({
        slot,
        allowed: DURS.filter((dur) => checkSlotIsFree(selectedDate, slot, dur, allBookings)),
      }));
      setDailyAvailability(availabilityForDate);
      setLoading(false);
    } else if (selectedDate && allBookings.length === 0 && !loading) {
        // If no bookings yet, all slots are theoretically free based on business hours
        const DURS = [45, 60, 75, 90, 105, 120];
        const timeOpts = [];
         for (let hour = 10; hour <= 21; hour++) {
            ["00", "15", "30", "45"].forEach((minute) => {
             if (!(hour === 21 && (minute === "45" || minute === "30" || minute === "15"))) {
                timeOpts.push(`${String(hour).padStart(2, '0')}:${minute}`);
            }
            });
        }
        const allSlotsFree = timeOpts.map(slot => ({slot, allowed: DURS }));
        setDailyAvailability(allSlotsFree);
        setLoading(false);
    } else {
      setDailyAvailability([]); // Clear if no date selected or bookings still loading
    }
  }, [selectedDate, allBookings, loading]);


  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.warn("Error fetching profile for autofill (Booking):", profileError.message);
          }

          setFormData(prevFormData => ({
            ...prevFormData,
            name: user.user_metadata?.full_name || profileData?.full_name || "",
            email: user.email || "",
            password: '', 
            confirmPassword: '',
          }));

        } catch (error) {
          console.error("Error in fetchUserProfile (Booking):", error);
          setFormData(prev => ({ ...prev, password: '', confirmPassword: ''}));
        }
      };
      fetchUserProfile();
    } else {
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    }
  }, [user]);


  const STEPS = [
    { title: t("booking.step_datetime"), component: DateTimeStep },
    { title: t("booking.step_2"), component: InfoStep },
    { title: t("booking.step_3"), component: PaymentStep },
    { title: t("booking.step_4"), component: InlineChatbotStep },
  ];
  const UI_STEPS = STEPS.length + 1;

  const handlePaymentConfirmed = (confirmed) => {
    setPaymentDone(confirmed);
  };

  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime && selectedDuration;
    if (step === 2) { // Info / Signup Step
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      let passwordChecks = true;
      if (!user) { // Only check passwords if user is not logged in (signing up)
        passwordChecks = formData.password && formData.password.length >= 6 && formData.password === formData.confirmPassword;
      }
      return isNameValid && isEmailValid && passwordChecks;
    }
    if (step === 3) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    
    if (step === 1) {
      setStep(2);
    } else if (step === 2) { // Info / Signup Step
      setLoading(true); // Use main loading state
      try {
        let currentUserId = user?.id;
        let currentEmail = user?.email || formData.email;

        if (!user) { // If user is not logged in, sign them up
          if (formData.password !== formData.confirmPassword) {
            alert(t('auth.signup.errors.password_mismatch'));
            setLoading(false); return;
          }
          if (formData.password.length < 6) {
            alert(t('auth.signup.errors.password_length'));
            setLoading(false); return;
          }

          const { data: signUpData, error: signUpError } = await contextSignUp(
            formData.email,
            formData.password,
            { data: { full_name: formData.name } }
          );

          if (signUpError) {
            alert(signUpError.message || t('auth.signup.errors.default'));
            setLoading(false); return;
          }
          
          currentUserId = signUpData.user.id;
          currentEmail = signUpData.user.email;

          alert("Account created! Please check your email for confirmation. Your booking request is being processed.");
        } else { // User is logged in
            let profileUpdates = {};
            const {data: currentProfileData} = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
            if (formData.name !== (currentProfileData?.full_name || user.user_metadata?.full_name)) profileUpdates.full_name = formData.name;

            if (Object.keys(profileUpdates).length > 0) {
                const { error: profileUpdateError } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
                if (profileUpdateError) console.warn('Failed to update profile for existing user (Booking):', profileUpdateError.message);
            }
        }

        const [hours, minutes] = selectedTime.split(":").map(Number);
        const appointment_date = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          hours,
          minutes
        ).toISOString();

        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            user_id: currentUserId,
            appointment_date,
            duration_minutes: selectedDuration,
            name: formData.name,
            email: currentEmail,
            payment_status: "pending",
          })
          .select("id")
          .single();

        if (bookingError) throw bookingError;
        setBookingId(bookingData.id);
        setStep(3); // Go to payment step
      } catch (error) {
        console.error("Error in booking info/signup step:", error.message);
        alert("An error occurred: " + error.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 3 && paymentDone) {
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
    const targetInternalStep = dot - 1;
    if (targetInternalStep < step && !loading) { // Check main loading state
      if (targetInternalStep === 0) { 
        onBackService();
      } else {
        setStep(targetInternalStep);
      }
    }
  };
  

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = ` /* ... Swiper styles from before ... */ `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const loadingSpinner = (
    <span className="flex items-center">
      <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" ></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" ></path>
      </svg>
      {t("booking.processing")}
    </span>
  );

  return (
    <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-4" id="bookingForm" ref={formRef} >
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("booking.title")}
        </h2>
        <div className="bg-oxfordBlue rounded-xl p-4 sm:p-6 md:p-8 shadow-xl"> {/* Adjusted padding */}
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>

          {loading && step === 1 && !selectedDate ? ( 
            <div className="flex justify-center py-6 sm:py-10">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-darkGold"></div>
            </div>
          ) : (
            <div className="flex flex-col">
              {step === 1 && (
                <DateTimeStep
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  currentMonth={currentMonth}
                  onChangeMonth={(inc) => setCurrentMonth((prev) => addMonths(prev, inc))}
                  minDate={minDate}
                  availability={dailyAvailability} // Pass calculated availability
                  selectedTime={selectedTime}
                  selectedDuration={selectedDuration}
                  onSelectTime={handleSelectTime}
                />
              )}
              {step === 2 && (
                <InfoStep 
                  formData={formData} 
                  onChange={handleChange} 
                  onPhoneValidation={handlePhoneValidationInParent}
                  user={user} // Pass user to InfoStep
                />
              )}
              {step === 3 && (
                <PaymentStep
                  selectedDuration={selectedDuration}
                  bookingId={bookingId}
                  formData={formData}
                  onPaymentConfirmed={handlePaymentConfirmed}
                />
              )}
              {step === 4 && bookingId && ( // Ensure bookingId is available for Chat step
                <InlineChatbotStep
                  requestId={bookingId}
                  tableName="booking_chat_messages"
                  onFinish={async () => {
                     if (!bookingId) {
                        console.error("No booking ID available to complete booking chat.");
                        return;
                      }
                      try {
                        await axios.post(
                            // Make sure this environment variable is set in your Netlify/Vercel config
                            `${process.env.REACT_APP_N8N_BOOKING_COMPLETE_WEBHOOK || 'https://rafaello.app.n8n.cloud/webhook/booking-complete'}`, 
                            { session_id: bookingId }
                        );
                      } catch (err) {
                        console.error("Error triggering booking completion webhook:", err);
                      }
                  }}
                />
              )}
               {step === 4 && !bookingId && (
                   <div className="text-center text-red-400 p-4">
                    Preparing chat... If this persists, please go back and try again.
                  </div>
              )}
              <StepIndicator
                stepCount={UI_STEPS}
                currentStep={step + 1} 
                onStepClick={handleStepClick} 
              />
              <div className="flex justify-between mt-4 sm:mt-6"> {/* Increased margin-top */}
                <button
                  onClick={() => step === 1 ? onBackService() : setStep(step - 1)}
                  disabled={loading && step === 2} 
                  className="px-4 py-2 sm:px-6 sm:py-2.5 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {t("booking.back")}
                </button>
                {step < STEPS.length ? ( 
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-darkGold text-black font-semibold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading && (step === 2 || step ===3) // Show spinner only on step 2 (info/signup) or step 3 (payment submission) if needed
                      ? loadingSpinner
                      : STEPS[step] ? STEPS[step].title : t("booking.next") // Show next step's title
                    }
                  </button>
                ) : (
                  <button
                    onClick={() => { onBackService(); }}
                    disabled={loading} 
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-darkGold text-black font-semibold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm sm:text-base"
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