// src/components/chat/ChatbotWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Send from "../../assets/icons/Send.svg";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import TypingMessage from "../common/TypingMessage";
import { useTranslation } from "react-i18next";
import { format, parseISO, isValid, addDays, startOfDay, isBefore } from 'date-fns';

// Assuming these functions are adapted/created in bookingService.js
import {
  getAvailableTimesForDateAndDuration,
  createBooking,
  getQuickAvailableDates,
  fetchAllBookingsForConflictCheck, // Use the conflict check specific fetch
} from '../../services/bookingService';

// Fallback function to generate UUID
function generateUUID() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ChatbotWindow({ onClose, sessionId: propSessionId }) {
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false); // General loading for bot thinking/processing
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(false); // Specifically for text typing animation
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const headerRef = useRef(null);
  const DEFAULT_HEIGHT = window.innerHeight - 56; // Adjusted for typical nav bar height (14 * 4 = 56)
  const initialHeight = useRef(DEFAULT_HEIGHT);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [resizing, setResizing] = useState(false);
  const lastTap = useRef(0);
  const dragging = useRef(false);
  const [sessionId, setSessionId] = useState(() => propSessionId || generateUUID());
  const { user } = useAuth();
  const userId = user?.id;
  const { t } = useTranslation();
  const initialWelcomeSent = useRef(false);
  const isMounted = useRef(false);

  // ---- NEW STATES FOR SCHEDULING ----
  const [schedulingStep, setSchedulingStep] = useState(null);
  const [consultationDetails, setConsultationDetails] = useState({
    date: null,
    duration: null,
    time: null,
    name: '',
    email: '',
    bookingId: null,
  });
  const [tempAvailableSlots, setTempAvailableSlots] = useState([]);
  const [allBookingsForAvailability, setAllBookingsForAvailability] = useState([]);


  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (user && isMounted.current) {
      setConsultationDetails(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || prev.name || '',
        email: user.email || prev.email || ''
      }));
    }
  }, [user]);

  const checkTypingAnimations = () => {
    if (!isMounted.current) return;
    const anyStillTyping = messages.some(msg => msg.from === "bot" && msg.isTyping);
    setIsTypingAnimationActive(anyStillTyping);
  };

  useEffect(() => {
    checkTypingAnimations();
  }, [messages]);

  useEffect(() => {
    if (!sessionId || !isMounted.current) return;
    const loadOrCreateSession = async () => {
      try {
        const { data: existingMessages, error: messagesError } = await supabase
          .from("messages")
          .select("role, content, created_at, options")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (!isMounted.current) return;
        if (messagesError) console.error("Error fetching messages:", messagesError);

        if (existingMessages && existingMessages.length > 0) {
          setMessages(
            existingMessages.map((row) => ({
              from: row.role === "user" ? "user" : "bot",
              text: row.content,
              isTyping: false,
              options: row.options || null,
              id: generateUUID(),
            }))
          );
          initialWelcomeSent.current = true;
        } else if (!initialWelcomeSent.current) {
          const welcomeText = t("window_chatbot.welcome_message");
          addMessageToUINow(welcomeText, 'bot', true);
          initialWelcomeSent.current = true;
          if (userId || !propSessionId) { // Save if user is logged in OR it's a new session for anon
            const { error: welcomeSaveError } = await supabase.from("messages").insert({
              session_id: sessionId, role: "assistant", content: welcomeText, user_id: userId,
            });
            if (welcomeSaveError) console.error("Error saving welcome message:", welcomeSaveError);
          }
          if (!propSessionId) {
            const { error: sessionCreateError } = await supabase.from("chat_sessions").insert({
              id: sessionId, user_id: userId, title: "New Chat " + format(new Date(), "MMM d, HH:mm"),
            });
            if (sessionCreateError) console.error("Error creating chat session entry:", sessionCreateError);
          }
        }
      } catch (error) {
        console.error("Error in loadOrCreateSession: ", error);
      }
    };
    loadOrCreateSession();
  }, [sessionId, userId, t, propSessionId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const onPointerDown = (e) => {
    if (!headerRef.current) return;
    e.preventDefault();
    setResizing(true);
    dragging.current = false;
    headerRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!resizing || !isMounted.current) return;
    dragging.current = true;
    const newHeight = window.innerHeight - e.clientY - 56;
    setHeight(Math.max(100, Math.min(newHeight, window.innerHeight - 100)));
  };

  const onPointerUp = (e) => {
    if (!headerRef.current || !isMounted.current) return;
    try {
      headerRef.current.releasePointerCapture(e.pointerId);
    } catch (captureError) { /* Can ignore */ }
    setResizing(false);
    if (!dragging.current) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        onClose();
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
    dragging.current = false;
    const threshold = initialHeight.current * 0.3;
    if (height <= threshold && isMounted.current) {
      onClose();
    }
  };

  const addMessageToUINow = (text, from = 'bot', isTyping = false, options = null, isError = false) => {
    if (!isMounted.current) return;
    const actualIsTyping = (from === 'bot') ? isTyping : false;
    setMessages(prev => [...prev, { from, text, isTyping: actualIsTyping, options, isError, id: generateUUID() }]);
  };

  const resetSchedulingState = () => {
    if (!isMounted.current) return;
    setSchedulingStep(null);
    setConsultationDetails({
      date: null, duration: null, time: null,
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      bookingId: null,
    });
    setTempAvailableSlots([]);
    setAllBookingsForAvailability([]);
  };

  const startBookingProcess = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    addMessageToUINow(t('chatbot.scheduling.fetching_availability_dots'), 'bot', true);
    try {
      const { data: bookingsData, error: bookingsError } = await fetchAllBookingsForConflictCheck();
      if (!isMounted.current) { setLoading(false); return; }
      if (bookingsError) {
        console.error("Error fetching bookings for availability:", bookingsError);
        setMessages(prev => prev.filter(msg => !msg.isTyping));
        addMessageToUINow(t('chatbot.scheduling.error_fetching_availability'), 'bot', false, null, true);
        resetSchedulingState();
        return;
      }
      setAllBookingsForAvailability(bookingsData);
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      setSchedulingStep('awaitingDate');
      const quickDates = await getQuickAvailableDates(3, 60, bookingsData);
      if (!isMounted.current) { setLoading(false); return; }
      const dateOptions = quickDates.map(qd => ({ label: format(parseISO(qd), "EEE, MMM d"), value: qd }));
      dateOptions.push({ label: t('common.pick_custom_date'), value: 'custom_date_input' });
      addMessageToUINow(t('chatbot.scheduling.ask_date'), 'bot', false, { type: 'buttons', items: dateOptions, action: 'select_date' });
    } catch (error) {
      if (!isMounted.current) { return; }
      console.error("Error in startBookingProcess:", error);
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      addMessageToUINow(t('chatbot.scheduling.error_generic'), 'bot', false, null, true);
      resetSchedulingState();
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleDateSelected = async (dateString) => {
    if (!isMounted.current) return;
    if (dateString === 'custom_date_input') {
      addMessageToUINow(t('chatbot.scheduling.ask_date_manual'), 'bot');
      setSchedulingStep('awaitingDate');
      return;
    }
    const parsedDate = parseISO(dateString);
    const today = startOfDay(new Date());
    const minOffsetDays = 1;
    const minBookableDate = addDays(today, minOffsetDays);
    if (!isValid(parsedDate) || isBefore(parsedDate, minOffsetDays === 0 ? today : minBookableDate)) {
      addMessageToUINow(t('chatbot.scheduling.invalid_date'), 'bot', false, null, true);
      await startBookingProcess();
      return;
    }
    setConsultationDetails(prev => ({ ...prev, date: parsedDate }));
    setSchedulingStep('awaitingDuration');
    const durations = [45, 60, 75, 90, 105, 120];
    const durationOptions = durations.map(d => ({ label: `${d} min`, value: d }));
    setTempAvailableSlots(durationOptions);
    addMessageToUINow(t('chatbot.scheduling.ask_duration'), 'bot', false, { type: 'buttons', items: durationOptions, action: 'select_duration' });
  };

  const handleDurationSelected = async (durationValue) => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const duration = parseInt(durationValue);
      setConsultationDetails(prev => ({ ...prev, duration }));
      setSchedulingStep('awaitingTime');
      const dateForCheck = consultationDetails.date;
      addMessageToUINow(t('chatbot.scheduling.checking_times_for_duration', { duration, date: format(dateForCheck, "MMMM d") }), 'bot', true);
      const times = await getAvailableTimesForDateAndDuration(dateForCheck, duration, allBookingsForAvailability);
      if (!isMounted.current) { return; }
      setMessages(prev => prev.filter(msg => !(msg.isTyping && msg.text.startsWith(t('chatbot.scheduling.checking_times_for_duration', {duration: '', date: ''}).substring(0,10)) )) );
      if (times && times.length > 0) {
        const timeOptions = times.map(t => ({ label: t, value: t }));
        setTempAvailableSlots(timeOptions);
        addMessageToUINow(t('chatbot.scheduling.ask_time'), 'bot', false, { type: 'buttons', items: timeOptions, action: 'select_time' });
      } else {
        addMessageToUINow(t('chatbot.scheduling.no_times_available', {duration, date: format(dateForCheck, "MMMM d") }), 'bot');
        addMessageToUINow(t('chatbot.scheduling.try_again_or_cancel'), 'bot', false, {
          type: 'buttons', items: [
            { label: t('chatbot.scheduling.change_date'), value: 'change_date' },
            { label: t('chatbot.scheduling.change_duration'), value: 'change_duration' },
            { label: t('common.cancel'), value: 'cancel_booking' }
          ], action: 'no_slots_available_action'
        });
      }
    } catch (err) {
      if(isMounted.current) addMessageToUINow(t('chatbot.scheduling.error_generic'), 'bot', false, null, true);
      console.error("Error handling duration:", err);
    } finally {
      if(isMounted.current) setLoading(false);
    }
  };

  const handleTimeSelected = (timeValue) => {
    if (!isMounted.current) return;
    setConsultationDetails(prev => ({ ...prev, time: timeValue }));
    const currentName = consultationDetails.name;
    const currentEmail = consultationDetails.email;
    if (!currentName) {
      setSchedulingStep('awaitingName');
      addMessageToUINow(t('chatbot.scheduling.ask_name'));
    } else if (!currentEmail) {
      setSchedulingStep('awaitingEmail');
      addMessageToUINow(t('chatbot.scheduling.ask_email'));
    } else {
      setSchedulingStep('confirmingBooking');
      promptForBookingConfirmation();
    }
  };

  const handleNameEntered = (name) => {
    if (!isMounted.current) return;
    setConsultationDetails(prev => ({ ...prev, name }));
    const currentEmail = consultationDetails.email;
    if (!currentEmail) {
      setSchedulingStep('awaitingEmail');
      addMessageToUINow(t('chatbot.scheduling.ask_email'));
    } else {
      setSchedulingStep('confirmingBooking');
      promptForBookingConfirmation();
    }
  };

  const handleEmailEntered = (email) => {
    if (!isMounted.current) return;
    if (!email.includes('@') || !email.includes('.')) {
      addMessageToUINow(t('chatbot.scheduling.invalid_email'), 'bot', false, null, true);
      addMessageToUINow(t('chatbot.scheduling.ask_email_again'), 'bot');
      return;
    }
    setConsultationDetails(prev => ({ ...prev, email }));
    setSchedulingStep('confirmingBooking');
    promptForBookingConfirmation();
  };

  const promptForBookingConfirmation = () => {
    if (!isMounted.current) return;
    const { date, duration, time, name, email } = consultationDetails;
    const formattedDate = date ? format(date, "EEEE, MMMM d, yy") : 'N/A';
    const confirmationMessage = t('chatbot.scheduling.confirm_details', {
      duration, date: formattedDate, time, name, email
    });
    const confirmOptions = [{ label: t('common.yes'), value: 'yes' }, { label: t('common.no'), value: 'no' }];
    addMessageToUINow(confirmationMessage, 'bot', false, { type: 'buttons', items: confirmOptions, action: 'confirm_booking_action' });
  };

  const processFinalBooking = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    addMessageToUINow(t('chatbot.scheduling.processing_booking'), 'bot', true);
    try {
      const { date, duration, time, name, email } = consultationDetails;
      const [hours, minutesValue] = time.split(':').map(Number);
      const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutesValue);
      const bookingPayload = {
        user_id: user?.id, appointment_date: appointmentDate.toISOString(), duration_minutes: duration,
        name, email, payment_status: 'pending', booked_via: 'chatbot', chatbot_session_id: sessionId,
      };
      const { data: newBooking, error: bookingError } = await createBooking(bookingPayload);
      if (!isMounted.current) { return; }
      setMessages(prev => prev.filter(msg => !(msg.isTyping && msg.text.startsWith(t('chatbot.scheduling.processing_booking').substring(0,10)))));
      if (bookingError) {
        addMessageToUINow(t('chatbot.scheduling.booking_failed', { error: bookingError.message || "Unknown error" }), 'bot', false, null, true);
      } else {
        setConsultationDetails(prev => ({ ...prev, bookingId: newBooking.id }));
        addMessageToUINow(t('chatbot.scheduling.booking_successful_pending_payment', { bookingId: newBooking.id }), 'bot');
        addMessageToUINow(t('chatbot.scheduling.payment_instructions_placeholder'), 'bot');
      }
      resetSchedulingState();
    } catch (err) {
      if(isMounted.current) addMessageToUINow(t('chatbot.scheduling.error_generic'), 'bot', false, null, true);
      console.error("Error processing final booking: ", err);
    } finally {
      if(isMounted.current) setLoading(false);
    }
  };

  const handleUserRawInput = async (text) => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      if (schedulingStep === 'awaitingDate' && text !== 'custom_date_input') {
        await handleDateSelected(text);
      } else if (schedulingStep === 'awaitingName') {
        handleNameEntered(text);
      } else if (schedulingStep === 'awaitingEmail') {
        handleEmailEntered(text);
      } else if (schedulingStep) {
        addMessageToUINow(t('chatbot.scheduling.use_buttons_prompt'), 'bot');
      } else {
        const res = await fetch("https://rafaello.app.n8n.cloud/webhook/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, chatInput: text, user_id: userId }),
        });
        if (!isMounted.current) { return; }
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        const botResponse = data.output || t('chatbot.error_message');
        addMessageToUINow(botResponse, 'bot', true);
        if (userId || !propSessionId) {
          const { error: botSaveError } = await supabase.from("messages").insert({
            session_id: sessionId, role: "assistant", content: botResponse, user_id: userId,
          });
          if (botSaveError) console.error("Error saving bot response in handleUserRawInput:", botSaveError);
        }
      }
    } catch (error) {
      if(isMounted.current) {
        console.error("Error in handleUserRawInput:", error);
        addMessageToUINow(t('chatbot.error_message'), 'bot', true, null, true);
      }
    } finally {
      if(isMounted.current) setLoading(false);
    }
  };

  const handleOptionClick = async (action, value) => {
    if (!isMounted.current) return;
    const selectedOptionObject = tempAvailableSlots.find(opt => opt.value.toString() === value.toString());
    const userClickedMessage = selectedOptionObject ? selectedOptionObject.label : value.toString();
    addMessageToUINow(userClickedMessage, 'user');

    if (userId || !propSessionId) {
      const { error: optionClickError } = await supabase.from("messages").insert({
        session_id: sessionId, role: "user", content: userClickedMessage, user_id: userId,
        options_clicked_action: action, options_clicked_value: value
      });
      if (optionClickError) console.error("Error saving option click message:", optionClickError);
    }
    setLoading(true);
    try {
      if (action === 'select_date') {
        if (value === 'custom_date_input') {
            addMessageToUINow(t('chatbot.scheduling.ask_date_manual'), 'bot');
            setSchedulingStep('awaitingDate');
        } else {
            await handleDateSelected(value);
        }
      } else if (action === 'select_duration') {
        await handleDurationSelected(value);
      } else if (action === 'select_time') {
        handleTimeSelected(value);
      } else if (action === 'confirm_booking_action') {
        if (value === 'yes') await processFinalBooking();
        else { addMessageToUINow(t('chatbot.scheduling.booking_cancelled'), 'bot'); resetSchedulingState(); }
      } else if (action === 'no_slots_available_action') {
        if (value === 'change_date') await startBookingProcess();
        else if (value === 'change_duration') {
          setSchedulingStep('awaitingDuration');
          const durations = [45, 60, 75, 90, 105, 120];
          const durOptions = durations.map(d => ({ label: `${d} min`, value: d }));
          setTempAvailableSlots(durOptions);
          addMessageToUINow(t('chatbot.scheduling.ask_duration_again', { date: format(consultationDetails.date, "MMMM d") }), 'bot', false, { type: 'buttons', items: durOptions, action: 'select_duration' });
        } else if (value === 'cancel_booking') {
          addMessageToUINow(t('chatbot.scheduling.booking_cancelled'), 'bot');
          resetSchedulingState();
        }
      }
    } catch (err) {
      if(isMounted.current) {
        console.error("Error in handleOptionClick:", err);
        addMessageToUINow(t('chatbot.scheduling.error_generic'), 'bot', false, null, true);
        resetSchedulingState();
      }
    } finally {
      if(isMounted.current) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userText.trim() || isTypingAnimationActive || loading || !isMounted.current) return;
    const textToSend = userText;
    setUserText("");
    addMessageToUINow(textToSend, 'user');

    if (userId || !propSessionId) {
      const { error: userMessageError } = await supabase.from("messages").insert({
        session_id: sessionId, role: "user", content: textToSend, user_id: userId,
      });
      if (userMessageError) console.error("Error saving user message:", userMessageError);
    }

    const lowerText = textToSend.toLowerCase();
    const bookKeywords = ["book", "schedule", "appointment", "consultation", "reservar", "agendar", "consulta", "marcar"];
    if (!schedulingStep && bookKeywords.some(kw => lowerText.includes(kw))) {
      await startBookingProcess();
    } else {
      await handleUserRawInput(textToSend);
    }
  };

  // Use your original styling for messages if preferred.
  // These are just examples based on common chat UIs.
  const userMessageBubbleStyle = "bg-darkGold text-black rounded-br-md";
  const botMessageBubbleStyle = "bg-opacity-10 bg-white text-white rounded-bl-md";
  const errorBotMessageBubbleStyle = "bg-red-600/80 text-white rounded-bl-md";


  return (
    <motion.div
      ref={panelRef}
      className="fixed bottom-14 w-full bg-oxfordBlue shadow-2xl rounded-t-2xl overflow-visible border-t-2 border-darkGold flex flex-col z-40 touch-none overscroll-contain"
      style={{ height: `${height}px` }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
    >
      <div
        ref={headerRef}
        className="relative w-full flex items-center justify-center py-6 md:pt-10 px-4 cursor-grab touch-none bg-black/20"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="w-10 h-1 bg-darkGold rounded-full"></div>
        <button
          onClick={onClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-darkGold text-2xl md:text-3xl leading-none focus:outline-none p-2"
          aria-label="Close chat"
        >
          &times;
        </button>
      </div>

      <div ref={listRef} className="flex-1 w-full text-white overflow-auto space-y-1 p-3 md:p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} mb-1.5 last:mb-0`}
          >
            <div
              className={`max-w-[75%] md:max-w-[70%] px-4 py-2 rounded-lg whitespace-pre-wrap text-sm md:text-base leading-snug shadow-sm ${
                m.from === 'user'
                  ? userMessageBubbleStyle
                  : m.isError ? errorBotMessageBubbleStyle : botMessageBubbleStyle
              }`}
            >
              {m.isTyping && m.from === 'bot' ? (
                <TypingMessage
                  text={m.text}
                  isComplete={!m.isTyping}
                  typingSpeed={2}
                  startDelay={10}
                  onComplete={() => {
                      if (isMounted.current) {
                          setMessages(prevMsgs =>
                              prevMsgs.map(msg =>
                                  msg.id === m.id ? { ...msg, isTyping: false } : msg
                              )
                          );
                      }
                  }}
                />
              ) : (
                m.text
              )}
              {m.options && m.options.type === 'buttons' && !loading && (
                <div className={`mt-2.5 flex flex-wrap gap-1.5 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.options.items.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(m.options.action, option.value)}
                      disabled={loading}
                      className="bg-oxfordBlue hover:bg-opacity-70 text-white text-[0.7rem] md:text-xs px-2.5 py-1 rounded-full transition-colors focus:outline-none ring-1 ring-transparent hover:ring-darkGold"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
         {loading && !isTypingAnimationActive && (
             <div className="flex justify-start mb-1.5">
                 <div className={`max-w-[75%] px-4 py-2 rounded-lg whitespace-pre-wrap text-sm md:text-base leading-snug shadow-sm ${botMessageBubbleStyle}`}>
                    <TypingMessage text={t("chatbot.scheduling.processing_step_dots") || "..."} isComplete={false} typingSpeed={100} startDelay={10}/>
                 </div>
             </div>
        )}
      </div>

      <div className="pb-2 md:pb-10 px-2 border-t border-darkGold/50"> {/* Original: pb-2 md:pb-10 px-2 */}
        <div className="relative w-full flex items-center">
           {/* Input field from your original component */}
          <input
            className="flex-grow w-full h-12 md:h-16 border-2 border-darkGold bg-oxfordBlue text-white placeholder-gray-400/80 md:text-xl rounded-full p-4 pl-6 pr-12 md:px-16 focus:outline-none focus:ring-1 focus:ring-darkGold/50"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              isTypingAnimationActive ? t("window_chatbot.wait_for_message")
              : loading ? t("chatbot.scheduling.processing_step")
              : schedulingStep ? t(`chatbot.scheduling.placeholder_${schedulingStep.toLowerCase()}`, { defaultValue: t("window_chatbot.type_message") })
              : t("window_chatbot.type_message")
            }
            disabled={loading || isTypingAnimationActive}
            aria-label="Chat input"
          />
          {/* Send button from your original component */}
          <button
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 z-10" // Kept right-4 for md
            onClick={sendMessage}
            disabled={loading || isTypingAnimationActive || !userText.trim()}
            aria-label="Send message"
          >
            <img
              src={Send}
              alt="Send"
              className={`w-6 h-6 md:w-10 md:h-10 transition-opacity ${ // Kept md:w-10 md:h-10
                (loading || isTypingAnimationActive || !userText.trim()) ? "opacity-50" : "opacity-100"
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}