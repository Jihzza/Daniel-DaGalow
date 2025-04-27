// src/components/Pages/ChatbotIncentive.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Import icons and images
import Send from "../../assets/icons/Send.svg";
import Anexar from "../../assets/icons/Anexar.svg";

// Sample testimonials for the page
const testimonials = [
  {
    text: "The chatbot helped me organize my financial priorities in minutes. It was like having Daniel's expertise on demand!",
    author: "Maria S.",
    role: "Small Business Owner"
  },
  {
    text: "I was skeptical at first, but after one conversation about my fitness goals, I was convinced. This isn't just a chatbot, it's a coach.",
    author: "James T.",
    role: "Fitness Enthusiast"
  },
  {
    text: "As someone who struggles with decision-making, having this AI coach available 24/7 has been incredibly valuable for my personal growth.",
    author: "Sarah L.",
    role: "Marketing Director"
  }
];

// Preset sample messages for the chatbot preview
const presetBotMessages = [
  {
    text: "👋 Hi there! I'm Daniel's AI assistant. I can help with mindset coaching, financial strategy, fitness goals, and more. What would you like guidance on today?",
    options: ["Mindset improvement", "Financial advice", "Business strategy", "Fitness goals"]
  },
  {
    text: "Great choice! Let me share a quick insight about mindset improvement: The most successful people focus on building small, consistent habits rather than making dramatic changes. What specific area of your mindset would you like to improve?",
    options: ["Confidence", "Motivation", "Focus", "Resilience"]
  },
  {
    text: "Building confidence comes from a combination of preparation and consistent action. One technique Daniel recommends is the '5-minute courage challenge' where you do one small thing daily that pushes your comfort zone. Would you like more personalized advice on confidence building?",
    options: ["Yes, tell me more", "How does that work?"]
  },
  {
    text: "I'd love to provide you with a personalized confidence-building plan based on your specific situation and goals! To access this premium feature and continue our conversation, you'll need to create a free account. This also lets you save our chat history and access more of Daniel's expert advice.",
    options: []
  }
];

// Benefits to display on the page
const benefits = [
  {
    title: "24/7 Personalized Guidance",
    description: "Get immediate answers to your questions about mindset, finance, fitness, and business anytime you need them.",
    icon: "🧠"
  },
  {
    title: "Expert Knowledge Access",
    description: "Tap into Daniel's decade of experience and proven strategies that have helped thousands transform their lives.",
    icon: "💡"
  },
  {
    title: "Accountability Partner",
    description: "Set goals and get regular check-ins to keep you on track toward achieving your personal and professional targets.",
    icon: "📈"
  },
  {
    title: "Custom Action Plans",
    description: "Receive step-by-step guidance tailored to your specific situation, goals, and challenges.",
    icon: "📋"
  }
];

// Premium features to incentivize signup
const premiumFeatures = [
  "Save conversation history and continue later",
  "Access to advanced financial modeling tools",
  "Personalized action plans based on your goals",
  "Weekly accountability check-ins",
  "Priority booking for 1:1 sessions with Daniel",
  "Exclusive content and strategies not available elsewhere"
];

// Mock analytics data to show social proof
const liveStats = {
  activeUsers: 128,
  messagesExchanged: 1342,
  averageRating: 4.8,
  signupsToday: 37
};

const ChatbotIncentive = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const messagesEndRef = useRef(null);
  
  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/profile");
    }
  }, [user, loading, navigate]);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  
  // Start with first bot message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{ 
        from: "bot", 
        text: presetBotMessages[0].text,
        options: presetBotMessages[0].options 
      }]);
    }
  }, [chatMessages]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Send user message and get response
  const handleSendMessage = (text) => {
    // Don't allow empty messages
    if (!text.trim()) return;
    
    // Add user message to chat
    setChatMessages((prev) => [...prev, { from: "user", text }]);
    setUserMessage("");
    
    // Increment interaction counter
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    
    // Check if we've reached the limit
    if (newCount >= 3) {
      // Show limit reached message after a short delay
      setTimeout(() => {
        setShowLimitMessage(true);
      }, 1000);
      return;
    }
    
    // Get next preset bot message
    const nextStep = currentStep + 1;
    
    // Add bot "thinking" effect
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev, 
        { 
          from: "bot", 
          text: presetBotMessages[nextStep].text,
          options: presetBotMessages[nextStep].options 
        }
      ]);
      setCurrentStep(nextStep);
    }, 1000);
  };

  // Handle option button clicks
  const handleOptionClick = (option) => {
    handleSendMessage(option);
  };

  // Handle sign up button click
  const handleSignUp = () => {
    navigate("/signup");
  };

  // Format a number with commas for thousands
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience Personal Coaching with <span className="text-darkGold">AI Precision</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Get instant access to Daniel's expertise on mindset, finance, health, and business through our AI assistant—available 24/7.
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Chatbot Preview Section */}
          <div className="bg-gentleGray/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
            <div className="bg-oxfordBlue px-4 py-3 border-b border-darkGold flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-darkGold mr-2"></div>
                <h3 className="text-white font-semibold">Chat with Daniel's Assistant</h3>
              </div>
              <div className="text-sm text-white/60">Preview Mode</div>
            </div>
            
            {/* Chat Messages Container */}
            <div className="h-[400px] overflow-y-auto p-4 flex flex-col gap-4">
              {chatMessages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.from === "user" 
                        ? "bg-darkGold/20 text-white" 
                        : "bg-gentleGray text-oxfordBlue"
                    }`}
                  >
                    <p>{message.text}</p>
                    
                    {/* Option buttons for bot messages */}
                    {message.from === "bot" && message.options && message.options.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => handleOptionClick(option)}
                            className="text-sm bg-oxfordBlue/20 hover:bg-oxfordBlue/40 text-white px-3 py-1 rounded-full transition-colors"
                            disabled={showLimitMessage}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Limit reached message */}
              <AnimatePresence>
                {showLimitMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-darkGold/10 border border-darkGold text-white rounded-xl p-4 mt-4"
                  >
                    <p className="font-medium mb-2">You've reached the preview limit!</p>
                    <p className="text-sm mb-4">Create a free account to continue this conversation and unlock all features.</p>
                    <div className="flex justify-center">
                      <button
                        onClick={handleSignUp}
                        className="bg-darkGold text-black font-bold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                      >
                        Sign Up - It's Free
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input Box */}
            <div className="p-4 border-t border-darkGold/30">
              <div className="relative">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !showLimitMessage && handleSendMessage(userMessage)}
                  placeholder={showLimitMessage ? "Sign up to continue..." : "Type your message..."}
                  disabled={showLimitMessage}
                  className="w-full bg-oxfordBlue/30 text-white border-2 border-darkGold/50 rounded-full px-4 py-2 pl-10 pr-10 focus:outline-none focus:border-darkGold"
                />
                <button className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <img src={Anexar} alt="attach" className="w-5 h-5 opacity-50" />
                </button>
                <button
                  onClick={() => handleSendMessage(userMessage)}
                  disabled={showLimitMessage || !userMessage.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <img
                    src={Send}
                    alt="send"
                    className={`w-5 h-5 ${showLimitMessage || !userMessage.trim() ? "opacity-30" : "opacity-80 hover:opacity-100"}`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Why Create an Account?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-gentleGray/10 backdrop-blur-md rounded-xl p-4 border-l-4 border-darkGold">
                    <div className="text-3xl mb-2">{benefit.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                    <p className="text-white/70 text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Premium Features List */}
            <div className="bg-gentleGray/10 backdrop-blur-md rounded-xl p-6 border border-darkGold/30">
              <h3 className="text-xl font-semibold text-white mb-4">Premium Features for Free Accounts</h3>
              <ul className="space-y-2">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-white">
                    <span className="text-darkGold mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleSignUp}
                className="w-full bg-darkGold text-black font-bold px-6 py-3 rounded-lg mt-6 hover:bg-opacity-90 transition-colors"
              >
                Create Your Free Account
              </button>
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">What Others Are Saying</h2>
          
          <div className="bg-gentleGray/10 backdrop-blur-md rounded-xl p-6 shadow-xl">
            <div className="relative h-[150px]">
              {testimonials.map((testimonial, idx) => (
                <div 
                  key={idx}
                  className={`absolute w-full transition-opacity duration-500 ${
                    idx === activeTestimonial ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <p className="text-lg text-white italic mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-darkGold flex items-center justify-center text-black font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">{testimonial.author}</p>
                      <p className="text-white/60 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Testimonial Navigation Dots */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === activeTestimonial ? "bg-darkGold" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Active Users", value: liveStats.activeUsers },
            { label: "Messages Today", value: liveStats.messagesExchanged },
            { label: "Average Rating", value: liveStats.averageRating + "/5" },
            { label: "Signups Today", value: liveStats.signupsToday }
          ].map((stat, index) => (
            <div key={index} className="bg-gentleGray/10 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-darkGold">{stat.value}</div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Final CTA */}
        <div className="bg-darkGold/20 backdrop-blur-md rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Life?</h2>
          <p className="text-white/80 max-w-3xl mx-auto mb-6">
            Join thousands of others who are leveraging Daniel's expertise to improve their mindset, finances, health, and business success.
          </p>
          <button
            onClick={handleSignUp}
            className="bg-darkGold text-black font-bold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Get Started Now - It's Free!
          </button>
          <p className="text-white/60 text-sm mt-4">No credit card required. Takes less than 60 seconds.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotIncentive;