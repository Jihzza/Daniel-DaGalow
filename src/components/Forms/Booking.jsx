import React, { useState, useEffect } from "react";
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
} from "date-fns";
import { fetchBookings, createBooking } from "../../services/bookingService";

// Shared StepIndicator
function StepIndicator({ stepCount, currentStep, onStepClick, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>      
      {Array.from({ length: stepCount }).map((_, idx) => {
        const n = idx + 1;
        const active = currentStep === n;
        return (
          <React.Fragment key={n}>
            <button
              type="button"
              onClick={() => onStepClick(n)}
              disabled={n > currentStep}
              className={
                `w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-300 focus:outline-none ` +
                (active
                  ? "bg-darkGold border-darkGold text-white"
                  : "bg-white/20 border-white/50 text-white/50 hover:border-darkGold hover:text-white cursor-pointer") +
                (n > currentStep ? " opacity-50 cursor-not-allowed" : "")
              }
            >
              {n}
            </button>
            {idx < stepCount - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  currentStep > n ? "bg-darkGold" : "bg-white/20"
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
}) {
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const prevMonthDays = [];
  const nextMonthDays = [];
  const firstDayOfWeek = days[0].getDay();
  const daysFromPrev = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = daysFromPrev; i > 0; i--) prevMonthDays.push(addDays(days[0], -i));
  const totalCells = 42;
  const daysFromNext = totalCells - (days.length + prevMonthDays.length);
  for (let i = 1; i <= daysFromNext; i++) nextMonthDays.push(addDays(days[days.length - 1], i));
  const calendar = [...prevMonthDays, ...days, ...nextMonthDays];

  return (
    <div id="booking" className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onChangeMonth(-1)} className="text-white p-2">
          ←
        </button>
        <h3 className="text-xl text-white">{format(currentMonth, "MMMM yyyy")}</h3>
        <button onClick={() => onChangeMonth(1)} className="text-white p-2">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-white/60 text-sm">
            {d}
          </div>
        ))}
        {calendar.map((date, i) => {
          const inMonth = isSameMonth(date, currentMonth);
          const weekend = isWeekend(date);
          const selected = selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              key={i}
              onClick={() => inMonth && !weekend && onSelectDate(date)}
              disabled={!inMonth || weekend}
              className={
                `aspect-square rounded-full p-2 flex flex-col items-center justify-center text-sm relative ` +
                (selected
                  ? "bg-darkGold text-white"
                  : "bg-white/10 text-white") +
                (!inMonth || weekend
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
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {availableTimes.map((time) => {
          const ok = isTimeAvailable(date, time);
          const sel = time === selectedTime;
          return (
            <button
              key={time}
              onClick={() => ok && onSelectTime(time)}
              disabled={!ok}
              className={
                `p-3 rounded-xl text-center ` +
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
    <div className="space-y-4 max-w-md mx-auto">
      <input
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={onChange}
        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50"
      />
      <input
        name="email"
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={onChange}
        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50"
      />
    </div>
  );
}

// Step 4: Payment Selection
function PaymentStep({ onPaid }) {
  const options = [
    { label: '45 min', link: 'https://checkout.revolut.com/pay/3dfccfda-5511-40bf-936c-b6d7141f34e1' },
    { label: '1h', link: 'https://checkout.revolut.com/pay/66c2a4ff-5041-4548-a595-361d7b42c84a' },
    { label: '1h15', link: 'https://checkout.revolut.com/pay/ceb92e96-066e-45ec-a5c2-0e83bead7ca2' },
    { label: '1h30', link: 'https://checkout.revolut.com/pay/dd9ae643-d183-4a0b-adb5-7ec9ec30fbd3' },
    { label: '1h45', link: 'https://checkout.revolut.com/pay/743b0fae-a826-4c76-8bb6-b3aa103b9073' },
    { label: '2h', link: 'https://checkout.revolut.com/pay/57b12021-009c-4f5a-9d78-c1e58cc6e36e' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onPaid(opt.link)}
          className="p-4 bg-white/10 text-white rounded-xl hover:bg-darkGold transition"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Step 5: Confirmation
function ConfirmStep({ formData, selectedDate, selectedTime }) {
  return (
    <div className="text-center text-white">
      <p>Thanks {formData.name}!</p>
      <p>
        Your consultation is set for {format(selectedDate, 'EEEE, MMMM d')} at {selectedTime}.
      </p>
    </div>
  );
}

export default function Booking({ onBackService }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const [h, m] = time.split(':').map(Number);
    dt.setHours(h, m, 0, 0);
    const start = addMinutes(dt, -30);
    const end = addMinutes(dt, 90);
    return !bookedEvents.some((e) => {
      const s = new Date(e.start), en = new Date(e.end);
      return start < en && end > s;
    });
  };

  const STEPS = [
    DateStep,
    TimeStep,
    InfoStep,
    PaymentStep,
    ConfirmStep,
  ];
  const Current = STEPS[step - 1];

  const handlePaid = (link) => {
    setPaymentDone(true);
    window.location.href = link;
  };

  const canProceed = () => {
    if (step === 2) return !!selectedTime;
    if (step === 3) return formData.name && formData.email;
    if (step === 4) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      // move from time to contact info
      setStep(3);
    } else if (step === 3) {
      // move to payment
      setStep(4);
    } else if (step === 4) {
      // create booking, then confirm
      setLoading(true);
      await createBooking({
        ...formData,
        date: selectedDate,
        time: selectedTime,
      });
      setLoading(false);
      setStep(5);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Schedule Your Consultation
        </h2>
        <div className="bg-oxfordBlue rounded-2xl p-8 shadow-xl">
          <div className="min-h-[200px]">          
            <Current
              selectedDate={selectedDate}
              onSelectDate={(d) => { setSelectedDate(d); setStep(2); }}
              currentMonth={currentMonth}
              onChangeMonth={(inc) =>
                setCurrentMonth((m) => new Date(m.setMonth(m.getMonth() + inc)))
              }
              bookedEvents={bookedEvents}
              date={selectedDate}
              availableTimes={availableTimes}
              isTimeAvailable={isTimeAvailable}
              selectedTime={selectedTime}
              onSelectTime={(t) => { setSelectedTime(t); setStep(3); }}
              formData={formData}
              onChange={handleChange}
              time={selectedTime}
              onPaid={handlePaid}
            />
          </div>
          <div className="flex justify-between mt-6">
            {step === 1 ? (
              onBackService && (
                <button
                  onClick={onBackService}
                  className="px-4 py-1 border-2 border-darkGold text-darkGold font-bold rounded-xl"
                >
                  Change Service
                </button>
              )
            ) : (
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="px-4 py-1 border-2 border-darkGold text-darkGold font-bold rounded-xl"
              >
                Back
              </button>
            )}
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
            stepCount={STEPS.length}
            currentStep={step}
            onStepClick={(newStep) => setStep(newStep)}
            className="pt-6"
          />
        </div>
      </div>
    </section>
  );
}
