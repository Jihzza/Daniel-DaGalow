// src/services/bookingService.js
import { supabase } from '../utils/supabaseClient';
import { addMinutes, format, startOfDay, endOfDay, eachMinuteOfInterval, isWithinInterval, parseISO, isBefore, isWeekend, isEqual, addDays, isAfter } from 'date-fns';

// This constant should match the one in Booking.jsx if you have specific available durations
const DURS = [45, 60, 75, 90, 105, 120];
const MIN_DATE_OFFSET_DAYS = 1; // Bookings can be made from tomorrow onwards. Set to 0 to allow today.

// Function to generate potential time slots for a day
const generateDailyTimeSlots = (dateForSlots) => {
    const slots = [];
    const businessOpenHour = 10; // 10 AM
    const businessCloseHour = 22; // 10 PM (slot should not END after this)

    for (let hour = businessOpenHour; hour < businessCloseHour; hour++) {
        ["00", "15", "30", "45"].forEach((minuteStr) => {
            const currentSlotTime = new Date(dateForSlots);
            currentSlotTime.setHours(hour, parseInt(minuteStr, 10), 0, 0);

            // Ensure the slot itself STARTS before the business close hour
            const slotStartBoundary = new Date(dateForSlots);
            slotStartBoundary.setHours(businessCloseHour, 0, 0, 0);

            if (isBefore(currentSlotTime, slotStartBoundary)) {
                 slots.push(format(currentSlotTime, "HH:mm"));
            }
        });
    }
    return slots;
};

// Fetch ALL bookings - used for conflict checking.
// This version returns raw data needed for isSlotFree.
export const fetchAllBookingsForConflictCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('appointment_date, duration_minutes'); // Only select necessary fields

    if (error) throw error;

    return { data: data.map(b => ({
        appointment_date: parseISO(b.appointment_date), // Ensure Date objects
        duration_minutes: b.duration_minutes
    })), error: null };
  } catch (error) {
    console.error('Error fetching all bookings for conflict check:', error);
    return { data: [], error };
  }
};


// Your existing fetchBookings might be for displaying on the calendar,
// keep it if it's different. This one is specifically for conflict checking.
export const fetchBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*'); // Selects all columns

    if (error) throw error;

    // Transform data for calendar display if needed (like in your original CalendarPage)
    const formattedEvents = data.map(booking => ({
      id: booking.id,
      date: parseISO(booking.appointment_date),
      title: booking.name || `Appointment for ${booking.email}`,
      duration: booking.duration_minutes || 60,
      time: format(parseISO(booking.appointment_date), "h:mm a"),
      // Add other fields your calendar might need
      appointment_date: booking.appointment_date, // keep original for other uses
      duration_minutes: booking.duration_minutes, // keep original
    }));

    return { data: formattedEvents, error: null };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { data: [], error };
  }
};


export const isSlotFree = (date, hourString, durationMinutes, allBookings) => {
    if (!date || !hourString || !durationMinutes || !allBookings) {
        console.error("isSlotFree: Missing arguments", { date, hourString, durationMinutes, allBookings_count: allBookings?.length });
        return false;
    }

    const targetDateOnly = startOfDay(date);
    let minBookingDate;
    if (MIN_DATE_OFFSET_DAYS > 0) {
        minBookingDate = startOfDay(addDays(new Date(), MIN_DATE_OFFSET_DAYS));
         if (isBefore(targetDateOnly, minBookingDate)) {
            return false;
        }
    } else { // Allow booking for today
        minBookingDate = startOfDay(new Date());
        if (isBefore(targetDateOnly, minBookingDate)) {
             return false;
        }
    }


    if (isWeekend(targetDateOnly)) return false;

    const [hour, minute] = hourString.split(':').map(Number);
    const consultationStart = new Date(targetDateOnly);
    consultationStart.setHours(hour, minute, 0, 0);

    // If allowing today, check if the slot is in the past for today
    if (isEqual(targetDateOnly, startOfDay(new Date())) && isBefore(consultationStart, new Date())) {
        return false;
    }

    const prepStart = addMinutes(consultationStart, -30);
    const consultationEnd = addMinutes(consultationStart, durationMinutes);

    const businessOpen = new Date(targetDateOnly);
    businessOpen.setHours(10, 0, 0, 0);
    const businessClose = new Date(targetDateOnly);
    businessClose.setHours(22, 0, 0, 0);

    if (isBefore(consultationStart, businessOpen) || isAfter(consultationEnd, businessClose)) {
        return false;
    }
     if (consultationEnd.getHours() === 22 && consultationEnd.getMinutes() > 0) { // Ensure it doesn't exactly end at 22:00 then go over with minutes
        return false;
    }


    for (const booking of allBookings) {
        const existingStart = booking.appointment_date; // Should be a Date object
        const existingPrepStart = addMinutes(existingStart, -30);
        const existingEnd = addMinutes(existingStart, booking.duration_minutes);

        if (prepStart < existingEnd && consultationEnd > existingPrepStart) {
            return false; // Conflict
        }
    }
    return true;
};

export const getAvailableTimesForDateAndDuration = async (selectedDate, durationMinutes, allBookingsForCheck) => {
    if (!selectedDate || !durationMinutes) return [];

    const targetDay = startOfDay(selectedDate);

    // If allBookingsForCheck is not provided, fetch them. This is less efficient if called repeatedly.
    let bookingsToUse = allBookingsForCheck;
    if (!bookingsToUse || bookingsToUse.length === 0) {
        console.warn("getAvailableTimesForDateAndDuration: allBookingsForCheck was empty or not provided, re-fetching. This might be inefficient.");
        const { data: freshBookingsData, error: fetchErr } = await fetchAllBookingsForConflictCheck();
        if (fetchErr) {
            console.error("Error fetching bookings within getAvailableTimes:", fetchErr);
            return [];
        }
        bookingsToUse = freshBookingsData;
    }

    const potentialSlots = generateDailyTimeSlots(targetDay);
    const availableTimes = [];

    for (const slot of potentialSlots) {
        // Check if the slot END time is within business hours
        const [h, m] = slot.split(':').map(Number);
        const slotStartTime = new Date(targetDay);
        slotStartTime.setHours(h,m,0,0);
        const slotEndTime = addMinutes(slotStartTime, durationMinutes);

        const businessCloseTime = new Date(targetDay);
        businessCloseTime.setHours(22,0,0,0);

        if(isAfter(slotEndTime, businessCloseTime)) {
            continue; // Skip if slot ends after business close
        }

        if (isSlotFree(targetDay, slot, durationMinutes, bookingsToUse)) {
            availableTimes.push(slot);
        }
    }
    return availableTimes;
};

export const createBooking = async (bookingDetails) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingDetails)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking in service:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (e) {
    console.error('Exception in createBooking service:', e);
    return { data: null, error: e };
  }
};

export const getQuickAvailableDates = async (numberOfSuggestions = 3, typicalDuration = 60, allBookingsForCheck) => {
    let startDate = new Date();
    if (MIN_DATE_OFFSET_DAYS > 0) {
         startDate = addDays(new Date(), MIN_DATE_OFFSET_DAYS);
    }
    startDate = startOfDay(startDate); // Normalize to start of day

    const availableDateStrings = [];
    let checkedDaysCount = 0; // How many calendar days we've checked
    let daysToCheckLimit = 30; // Check up to 30 days in the future to find suggestions

    let bookingsToUse = allBookingsForCheck;
    if (!bookingsToUse || bookingsToUse.length === 0) {
        const { data: freshBookingsData, error: fetchErr } = await fetchAllBookingsForConflictCheck();
        if (fetchErr) {
            console.error("Error fetching bookings for quick dates:", fetchErr);
            return [];
        }
        bookingsToUse = freshBookingsData;
    }

    let currentDate = startDate;
    while (availableDateStrings.length < numberOfSuggestions && checkedDaysCount < daysToCheckLimit) {
        if (!isWeekend(currentDate)) {
            const times = await getAvailableTimesForDateAndDuration(currentDate, typicalDuration, bookingsToUse);
            if (times.length > 0) {
                availableDateStrings.push(format(currentDate, "yyyy-MM-dd"));
            }
        }
        currentDate = addDays(currentDate, 1);
        checkedDaysCount++;
    }
    return availableDateStrings;
};


// You might have other functions like deleteBooking, checkTimeSlotAvailability (original)
// Make sure they are also exported if used elsewhere.
// The original checkTimeSlotAvailability might be redundant if isSlotFree is comprehensive.
export const checkTimeSlotAvailability = async (date, hourString, durationMinutes) => {
    try {
        const { data: bookingsData, error: fetchError } = await fetchAllBookingsForConflictCheck();
        if (fetchError) throw fetchError;

        return { isAvailable: isSlotFree(date, hourString, durationMinutes, bookingsData), error: null };
    } catch (error) {
        console.error('Error in checkTimeSlotAvailability wrapper:', error);
        return { isAvailable: false, error };
    }
};

export const deleteBooking = async (bookingId) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return { success: false, error };
  }
};