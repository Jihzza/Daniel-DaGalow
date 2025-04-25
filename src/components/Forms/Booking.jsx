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

const STRIPE_LINKS = {
  45: "https://buy.stripe.com/9AQ4h1gy6fG90Te7sw",
  60: "https://buy.stripe.com/5kA4h12HgalPbxSeUZ",
  75: "https://buy.stripe.com/8wM4h1fu265z9pK8wE",
  90: "https://buy.stripe.com/fZe6p9a9I79D7hC6ov",
  105: "https://buy.stripe.com/9AQ4h195Edy11Xi28h",
  120: "https://buy.stripe.com/28o7tdfu2eC50Te4gm",
};


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
        <button onClick={() => onChangeMonth(-1)} className="text-white p-2">
          ←
        </button>
        <h3 className="text-xl text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button onClick={() => onChangeMonth(1)} className="text-white p-2">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-white/60 text-sm">
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
                `aspect-square rounded-full p-2 flex flex-col items-center justify-center text-sm relative ` +
                (selected
                  ? "bg-darkGold text-white"
                  : "bg-white/10 text-white") +
                (!inMonth || weekend || tooSoon
                  ? " opacity-50 cursor-not-allowed"
                  : " hover:bg-darkGold hover:text-white cursor-pointer")
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

// Step 2: Time selection
function TimeStep({ availability, selectedTime, onSelectTime }) {
  return (
    <div className="grid…">
      {availability.map(({ slot, allowed }) => (
        <div key={slot} className="flex flex-col items-center">
          <p className="text-white">{slot}</p>
          {allowed.map(dur => (
            <button
              key={dur}
              onClick={() => onSelectTime({ slot, dur })}
              className="…"
            >
              {dur === 60 ? "1 h" : `${Math.floor(dur/60)} h ${dur%60} m`}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}


// Step 3: Contact info
function InfoStep({ formData, onChange }) {
  return (
    <div className="space-y-4 max-w-md mx-auto w-full">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white">Your Name</label>
        <input
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={onChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white">Your Email</label>
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={onChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
        />
      </div>
    </div>
  );
}

export default function Booking({ onBackService }) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Business hours buffer
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
    (async () => {
      setLoading(true);
      const { data } = await fetchBookings();
      setBookedEvents(data || []);
      setLoading(false);
    })();
  }, []);

  // Build blocked intervals (visible end + 30min buffer)
  const blocked = bookedEvents.map(({ start, end }) => {
    const s = new Date(start);
    const e = new Date(end);
    return {
      from: addMinutes(s, -30),
      to: addMinutes(e, 30),
    };
  });

  // Check if a slot is free given date + hourString + duration
  function isSlotFree(date, hourString, dur) {
    const [h, m] = hourString.split(":").map(Number);
    const visibleStart = new Date(date);
    visibleStart.setHours(h, m, 0, 0);

    const blockFrom = addMinutes(visibleStart, -30);
    const blockTo = addMinutes(visibleStart, dur + 30);

    // Must finish post-buffer by 22:00
    if (blockTo.getHours() > 22 || (blockTo.getHours() === 22 && blockTo.getMinutes() > 0)) {
      return false;
    }

    // Ensure no overlap with existing blocks
    return !blocked.some(({ from, to }) =>
      blockFrom < to && blockTo > from
    );
  }

  // Define durations and hours
  const DURS = [45, 60, 75, 90, 105, 120];
  const timeOptions = Array.from({ length: 12 }, (_, i) => `${10 + i}:00`);

  // Compute availability per hour
  const availability = timeOptions.map(slot => ({
    slot,
    allowed: DURS.filter(dur => isSlotFree(selectedDate, slot, dur)),
  }));

  // Booking steps
  const STEPS = [
    { title: "Choose a date", component: DateStep },
    { title: "Select a time", component: TimeStep },
    { title: "Your information", component: InfoStep },
    { title: "Chat with our assistant", component: InlineChatbotStep },
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
  
      // Build the ISO timestamp for the visible start
      const appointment_date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        ...selectedTime.split(":").map(Number)
      ).toISOString();
  
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          appointment_date,
          duration_minutes: selectedDuration,    // 45, 60, 75, etc.
          name: formData.name,
          email: formData.email,
        })
        .select("id")
        .single();
  
      setLoading(false);
  
      if (error) {
        console.error("Booking failed:", error);
        // optionally show a toast/alert
      } else {
        setBookingId(data.id);
        setStep(4);   // move into the payment/Stripe redirect step
      }
    } else {
      setStep(step + 1);
    }
  };
  

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleStepClick = dot => {
    if (dot === 1) onBackService(); else setStep(dot - 1);
  };

  return (
    <section className="py-8 px-4" id="bookingForm">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Schedule Your Consultation
        </h2>
        <div className="bg-oxfordBlue rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl text-white mb-4">{STEPS[step - 1].title}</h3>
          {step === 2 ? (
            <TimeStep
              availability={availability}
              selectedTime={{ slot: selectedTime, dur: selectedDuration }}
              onSelectTime={({ slot, dur }) => {
                setSelectedTime(slot);
                setSelectedDuration(dur);
                setStep(3);
              }}
            />
          ) : step < 2 ? (
            <DateStep
              selectedDate={selectedDate}
              onSelectDate={d => { setSelectedDate(d); setStep(2); }}
              currentMonth={currentMonth}
              onChangeMonth={inc => setCurrentMonth(m => new Date(m.setMonth(m.getMonth() + inc)))}
              minDate={minDate}
            />
          ) : step === 3 ? (
            React.createElement(Current, {
              formData,
              onChange: handleChange,
              onPaid: () => setPaymentDone(true),
              requestId: bookingId,
              tableName: 'booking_chat_messages'
            })
          ) : (
            <InlineChatbotStep
              requestId={bookingId}
              tableName="booking_chat_messages"
            />
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onBackService()}
              className="px-4 py-1 border-2 border-darkGold text-darkGold rounded-xl"
            >
              Back
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="px-4 py-1 bg-darkGold text-white rounded-xl disabled:opacity-50"
              >
                Next
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