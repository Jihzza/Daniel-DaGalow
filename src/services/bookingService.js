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
    
    // Transform the data to create three visual events for each booking
    // This is for UI display purposes only
    const formattedEvents = [];
    
    data.forEach(booking => {
      // Main consultation event
      formattedEvents.push({
        id: booking.id,
        title: 'Booked',
        start: new Date(booking.main_start_time),
        end: new Date(booking.main_end_time),
        backgroundColor: '#B8860B', // darkGold
        type: 'main',
        bookingId: booking.id
      });
      
      // Preparation buffer event
      formattedEvents.push({
        id: `prep-${booking.id}`,
        title: 'Preparation',
        start: new Date(booking.prep_start_time),
        end: new Date(booking.main_start_time),
        backgroundColor: '#D3D3D3',
        type: 'prep',
        bookingId: booking.id
      });
      
      // Review buffer event
      formattedEvents.push({
        id: `review-${booking.id}`,
        title: 'Review',
        start: new Date(booking.main_end_time),
        end: new Date(booking.review_end_time),
        backgroundColor: '#D3D3D3',
        type: 'review',
        bookingId: booking.id
      });
    });
    
    return { data: formattedEvents, error: null };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { data: null, error };
  }
};

/**
 * Create a new booking record with prep and review buffers
 * @param {Object} booking - Booking information including name, email, and time
 * @returns {Promise} Promise containing the created booking data
 */
export const createBooking = async (booking) => {
  try {
    const { name, email, date, time } = booking;
    
    // Parse the selected time
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create date objects for all time periods
    const mainStartTime = new Date(date);
    mainStartTime.setHours(hours, minutes, 0, 0);
    
    const mainEndTime = addMinutes(mainStartTime, 60);
    const prepStartTime = addMinutes(mainStartTime, -30);
    const reviewEndTime = addMinutes(mainEndTime, 30);
    
    // Create a single booking record with all time periods
    const bookingRecord = {
      name,
      email,
      prep_start_time: prepStartTime.toISOString(),
      main_start_time: mainStartTime.toISOString(),
      main_end_time: mainEndTime.toISOString(),
      review_end_time: reviewEndTime.toISOString()
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
 * @param {String} time - The time to check (format: "HH:MM")
 * @returns {Promise<boolean>} True if the slot is available, false otherwise
 */
export const checkTimeSlotAvailability = async (date, time) => {
  try {
    // Parse the selected time
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create date objects for the full booking period (including buffers)
    const mainStartTime = new Date(date);
    mainStartTime.setHours(hours, minutes, 0, 0);
    
    const prepStartTime = addMinutes(mainStartTime, -30);
    const reviewEndTime = addMinutes(mainStartTime, 90); // 60 min consultation + 30 min review
    
    // Check for any overlapping bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .or(`prep_start_time,lt.${reviewEndTime.toISOString()},review_end_time,gt.${prepStartTime.toISOString()}`);
    
    if (error) throw error;
    
    // If we found any overlapping bookings, the slot is not available
    return { isAvailable: data.length === 0, error: null };
  } catch (error) {
    console.error('Error checking time slot availability:', error);
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