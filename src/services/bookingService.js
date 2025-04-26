// src/services/bookingService.js
import { supabase } from '../utils/supabaseClient';
import { addMinutes } from 'date-fns';

/**
 * Fetch all bookings from the database
 * @returns {Promise} Promise containing the booking data
 */
export const fetchBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*');
    
    if (error) throw error;
    
    // Transform data for our booking system
    // Every booking has two key periods:
    // 1. Preparation time (30min before start)
    // 2. Consultation time (actual appointment)
    const formattedEvents = [];
    
    data.forEach(booking => {
      // Get the consultation start and end times
      const startTime = new Date(booking.appointment_date);
      const endTime = addMinutes(startTime, booking.duration_minutes);
      
      // Get the preparation time (30min before)
      const prepStartTime = addMinutes(startTime, -30);
      
      // Add the main consultation event
      formattedEvents.push({
        id: booking.id,
        title: 'Consultation',
        start: startTime,
        end: endTime,
        duration: booking.duration_minutes,
        bookingId: booking.id
      });
      
      // Add the preparation event
      formattedEvents.push({
        id: `prep-${booking.id}`,
        title: 'Preparation',
        start: prepStartTime,
        end: startTime,
        type: 'prep',
        bookingId: booking.id
      });
    });
    
    return { data: formattedEvents, error: null };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { data: [], error };
  }
};

/**
 * Create a new booking record
 * @param {Object} booking - Booking information
 * @returns {Promise} Promise containing the created booking data
 */
export const createBooking = async (booking) => {
  try {
    const { user_id, appointment_date, duration_minutes, name, email } = booking;
    
    // Create the booking record
    const bookingRecord = {
      user_id,
      appointment_date,
      duration_minutes,
      name,
      email
    };
    
    // Insert the booking record
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingRecord)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { data: null, error };
  }
};

/**
 * Check if a time slot is available by checking for overlaps
 * @param {Date} date - The date to check
 * @param {String} hourString - The hour to check (format: "HH:00")
 * @param {Number} durationMinutes - The duration in minutes
 * @returns {Promise<boolean>} True if the slot is available, false otherwise
 */
export const checkTimeSlotAvailability = async (date, hourString, durationMinutes) => {
  try {
    // We need to get all bookings first to check conflicts
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*');
    
    if (error) throw error;
    
    // Convert the proposed booking to date objects
    const [hours, minutes] = hourString.split(':').map(Number);
    
    const proposedDate = new Date(date);
    proposedDate.setHours(hours, minutes, 0, 0);
    
    const consultationStart = proposedDate;
    const consultationEnd = addMinutes(consultationStart, durationMinutes);
    const prepStart = addMinutes(consultationStart, -30);
    
    // Check for conflicts with any existing booking
    for (const booking of bookings) {
      const existingStart = new Date(booking.appointment_date);
      const existingEnd = addMinutes(existingStart, booking.duration_minutes);
      const existingPrepStart = addMinutes(existingStart, -30);
      
      // Check if there's any overlap between:
      // 1. The proposed booking period (including prep time)
      // 2. Any existing booking period (including prep time)
      if (
        (prepStart < existingEnd && consultationEnd > existingPrepStart)
      ) {
        return { isAvailable: false, error: null };
      }
    }
    
    // No conflicts found
    return { isAvailable: true, error: null };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { isAvailable: false, error };
  }
};

/**
 * Delete a booking
 * @param {string} bookingId - The ID of the booking to delete
 * @returns {Promise} Promise indicating success or failure
 */
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