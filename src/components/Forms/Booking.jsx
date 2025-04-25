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
function TimeStep({
  selectedTime,
  onSelectTime,
  date,
  availableTimes,
  isTimeAvailable,
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white">{format(date, "EEEE, MMMM d")}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-center items-center">
        {availableTimes.map((time) => {
          const ok = isTimeAvailable(date, time);
          const sel = time === selectedTime;
          return (
            <button
              key={time}
              onClick={() => ok && onSelectTime(time)}
              disabled={!ok}
              className={
                `px-3 py-2 justify-center items-center rounded-xl text-center text-base ` +
                (sel ? "bg-darkGold text-white" : "bg-white/10 text-white") +
                (ok
                  ? " hover:bg-darkGold hover:text-white cursor-pointer"
                  : " opacity-50 cursor-not-allowed")
              }
            >
              {time}
            </button>
          );
        })}
      </div>
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

// Step 4: Payment Selection
function PaymentStep({ onPaid }) {
  const options = [
    { label: "45 min", link: "https://buy.stripe.com/9AQ4h1gy6fG90Te7sw" },
    { label: "1h", link: "https://buy.stripe.com/5kA4h12HgalPbxSeUZ" },
    { label: "1h15", link: "https://buy.stripe.com/8wM4h1fu265z9pK8wE" },
    { label: "1h30", link: "https://buy.stripe.com/fZe6p9a9I79D7hC6ov" },
    { label: "1h45", link: "https://buy.stripe.com/9AQ4h195Edy11Xi28h" },
    { label: "2h", link: "https://buy.stripe.com/28o7tdfu2eC50Te4gm" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {options.map((opt) => (
        <a
          key={opt.label}
          href={opt.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onPaid(opt.link)}
          className="block"
        >
          <button className="w-full px-3 py-2 text-base bg-white/10 text-white rounded-xl hover:bg-darkGold transition">
            {opt.label}
          </button>
        </a>
      ))}
    </div>
  );
}



export default function Booking({ onBackService }) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // two-day buffer: only allow bookings from tomorrow onward
  const minDate = addDays(new Date(), 1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await fetchBookings();
      setBookedEvents(data || []);
      setLoading(false);
    })();
  }, []);

  const availableTimes = Array.from({ length: 13 }, (_, i) => `${i + 10}:00`);
  const isTimeAvailable = (date, time) => {
    const dt = new Date(date);
    const [h, m] = time.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    const start = addMinutes(dt, -30);
    const end = addMinutes(dt, 90);
    return !bookedEvents.some((e) => {
      const s = new Date(e.start),
        en = new Date(e.end);
      return start < en && end > s;
    });
  };

  const STEPS = [
    { title: "Choose a date", component: DateStep },
    { title: "Select a time", component: TimeStep },
    { title: "Your information", component: InfoStep },
    { title: "Choose payment option", component: PaymentStep },
    { title: "Chat with our assistant", component: InlineChatbotStep },
  ];
  const Current = STEPS[step - 1].component;
  const UI_STEPS = STEPS.length + 1;
  const handlePaid = () => {
    setPaymentDone(true);
  };

  const canProceed = () => {
    if (step === 2) return !!selectedTime;
    if (step === 3) return formData.name && formData.email;
    if (step === 4) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          appointment_date: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            ...selectedTime.split(":").map(Number)
          ).toISOString(),
        })
        .select("id")
        .single();
      if (error) console.error("Booking failed:", error);
      else setBookingId(data.id);
      setLoading(false);
      setStep(5);
    } else if (step === 5) {
      setStep(6);
    }
  };

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleStepClick = (dot) => {
      if (dot === 1) onBackService();
      else setStep(dot - 1);
    };
  return (
    <section className="py-8 px-4" id="bookingForm">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Schedule Your Consultation
        </h2>
        <div className="bg-oxfordBlue justify-center items-center rounded-2xl p-8 shadow-xl">
          <div className="min-h-[200px] flex flex-col justify-center items-center">
            <h3 className="text-xl text-white mb-4">{STEPS[step - 1].title}</h3>
            {step < STEPS.length ? (
              <Current
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setStep(2);
                }}
                currentMonth={currentMonth}
                onChangeMonth={(inc) =>
                  setCurrentMonth(
                    (m) => new Date(m.setMonth(m.getMonth() + inc))
                  )
                }
                bookedEvents={bookedEvents}
                date={selectedDate}
                availableTimes={availableTimes}
                isTimeAvailable={isTimeAvailable}
                selectedTime={selectedTime}
                onSelectTime={(t) => {
                  setSelectedTime(t);
                  setStep(3);
                }}
                minDate={minDate}
                formData={formData}
                onChange={handleChange}
                onPaid={handlePaid}
              />
            ) : (
              <InlineChatbotStep
                requestId={bookingId}
                tableName="booking_chat_messages"
              />
            )}
          </div>
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() =>
                step > 1 ? setStep((s) => s - 1) : onBackService()
              }
              className="px-4 py-1 border-2 border-darkGold text-darkGold font-bold rounded-xl"
            >
              Back
            </button>

            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="px-4 py-1 bg-darkGold text-white font-bold rounded-xl disabled:opacity-50"
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
