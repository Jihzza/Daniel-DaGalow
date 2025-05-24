// supabase/functions/process-booking-reminders/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Booking {
  id: string;
  user_id: string;
  appointment_date: string;
  name?: string;
}

async function createReminderNotification(supabaseClient: SupabaseClient, booking: Booking) {
  const appointmentDate = new Date(booking.appointment_date);
  const notifyAt = new Date(appointmentDate.getTime() - (24 * 60 * 60 * 1000));
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const message = `Reminder: Your consultation${booking.name ? ` for "${booking.name}"` : ''} is tomorrow at ${formattedTime}.`;

  const { error: insertError } = await supabaseClient
    .from("notifications")
    .insert({
      user_id: booking.user_id,
      message: message,
      link: "/calendar",
      type: "reminder",
      related_booking_id: booking.id,
      notify_at: notifyAt.toISOString(),
      is_read: false,
    });

  if (insertError) {
    console.error(`Error inserting notification for booking ${booking.id}: ${insertError.message}`);
    return false;
  }
  console.log(`Reminder notification created for booking ${booking.id} to notify at ${notifyAt.toISOString()}.`);
  return true;
}

serve(async (req: Request) => { // The 'Request' type here should be fine
  const cronSecret = req.headers.get("X-Cron-Secret");
  // Use non-null assertion '!' if you are sure these will be set in the deployed env.
  // The runtime checks below will handle if they are actually missing.
  const expectedCronSecret = Deno.env.get("CRON_SECRET_TOKEN")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Your existing runtime checks are good:
  if (!expectedCronSecret || cronSecret !== expectedCronSecret) {
    console.warn("Unauthorized attempt to call process-booking-reminders. Missing or incorrect CRON_SECRET_TOKEN.");
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing secret token." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not defined.");
    return new Response(JSON.stringify({ error: "Server configuration error: Supabase credentials missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // At this point, supabaseUrl and supabaseServiceRoleKey are known to be strings by TypeScript
  // because of the checks above, so createClient will be happy.
  const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const now = new Date();
    // Modified for 48-hour testing window as per your last file
    const lookAheadHours = 48;
    const windowMinutes = 60;

    const reminderTargetPeriodStart = new Date(now.getTime() + lookAheadHours * 60 * 60 * 1000);
    const reminderTargetPeriodEnd = new Date(reminderTargetPeriodStart.getTime() + windowMinutes * 60 * 1000);

    console.log(`[${new Date().toISOString()}] Function invoked. (TESTING ${lookAheadHours}h) Checking for appointments between ${reminderTargetPeriodStart.toISOString()} and ${reminderTargetPeriodEnd.toISOString()}`);

    const { data: bookings, error: bookingsError } = await supabaseClient
      .from("bookings")
      .select("id, user_id, appointment_date, name")
      .gte("appointment_date", reminderTargetPeriodStart.toISOString())
      .lt("appointment_date", reminderTargetPeriodEnd.toISOString());

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError.message);
      throw bookingsError;
    }

    if (!bookings || bookings.length === 0) {
      console.log("No upcoming bookings for reminders in the current window.");
      return new Response(JSON.stringify({ message: "No upcoming bookings for reminders in this window." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Found ${bookings.length} booking(s) in the target window.`);
    let remindersCreatedCount = 0;
    let remindersSkippedCount = 0;

    for (const booking of bookings) {
      console.log(`Processing booking ID: ${booking.id} for user ${booking.user_id} scheduled at ${booking.appointment_date}`);
      const { data: existingNotifications, error: checkError } = await supabaseClient
        .from("notifications")
        .select("id")
        .eq("related_booking_id", booking.id)
        .eq("type", "reminder")
        .limit(1);

      if (checkError) {
        console.error(`Error checking for existing notification for booking ${booking.id}: ${checkError.message}`);
        continue;
      }

      if (existingNotifications && existingNotifications.length > 0) {
        console.log(`Reminder already exists for booking ${booking.id}. Skipping.`);
        remindersSkippedCount++;
        continue;
      }

      if (await createReminderNotification(supabaseClient, booking)) {
        remindersCreatedCount++;
      }
    }

    const summaryMessage = `${remindersCreatedCount} reminder(s) created. ${remindersSkippedCount} reminder(s) skipped (already existed). Total bookings processed: ${bookings.length}.`;
    console.log(summaryMessage);
    return new Response(JSON.stringify({ success: true, message: summaryMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Critical error in process-booking-reminders function:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown server error processing reminders." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});