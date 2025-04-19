// src/components/AnalysisRequest.jsx
import React, { useState } from 'react'
import { supabase } from '../../utils/supabaseClient'

// Progress Indicator
function StepIndicator({ stepCount, currentStep, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {Array.from({ length: stepCount }).map((_, idx) => (
        <React.Fragment key={idx}>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-300 ${
              currentStep === idx + 1
                ? 'bg-darkGold border-darkGold text-white'
                : 'bg-white/20 border-white/50 text-white/50'
            }`}
          >
            {idx + 1}
          </div>
          {idx < stepCount - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                currentStep > idx + 1 ? 'bg-darkGold' : 'bg-white/20'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Step 1: Select Analysis Type
function TypeSelectionStep({ formData, onChange }) {
  const options = [
    { label: 'Stock', value: 'stock' },
    { label: 'Portfolio', value: 'portfolio' },
    { label: 'Social Media', value: 'socialmedia' },
    { label: 'Business', value: 'business' },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      {options.map(opt => (
        <div
          key={opt.value}
          className={`p-4 rounded-xl cursor-pointer transition-shadow duration-300 border ${
            formData.type === opt.value
              ? 'border-darkGold shadow-lg'
              : 'border-white/20'
          } bg-oxfordBlue`}
          onClick={() => onChange({ target: { name: 'type', value: opt.value } })}
        >
          <p className="text-white font-medium text-center">{opt.label}</p>
        </div>
      ))}
    </div>
  )
}

// Step 2: Contact Info
function ContactInfoStep({ formData, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block text-white mb-2">Your Name</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder="John Doe"
          required
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Email Address</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="john@example.com"
          required
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
    </div>
  )
}

// Step 3: Chat Interface
function ChatbotStep({ formData, requestId }) {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const sendMessage = async () => {
    if (!message.trim()) return
    // 1) Persist to Supabase
    const { error } = await supabase
      .from('analysis_chat_messages')
      .insert({
        request_id: requestId,
        sender: 'user',
        message,
      })
    if (error) console.error(error)

    // 2) Append locally
    setChatHistory(h => [...h, { sender: 'user', message }])
    setMessage('')
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 mb-6 space-y-4">
      {chatHistory.map((msg, i) => (
        <div key={i} className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-oxfordBlue text-white self-end' : 'bg-white/20 text-black'}`}>
          {msg.message}
        </div>
      ))}
      <div className="relative">
        <textarea
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold resize-none"
        />
        <button
          onClick={sendMessage}
          className="absolute right-3 bottom-3 p-2 bg-darkGold text-white rounded-xl hover:bg-yellow-500 transition-colors duration-300"
        >
          <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function AnalysisRequest({ onBackService }) {  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ type: '', name: '', email: '' })
  const [requestId, setRequestId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // auto-advance on type select
    if (name === 'type' && value) setStep(2)
  }

  const STEPS = [
    { title: 'Select Type', component: TypeSelectionStep },
    { title: 'Contact Info', component: ContactInfoStep },
    { title: 'Chat', component: ChatbotStep },
  ]
  const Current = STEPS[step - 1].component

  const canProceed = () => {
    if (step === 2) return formData.name && formData.email
    return true
  }

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true)
      const { data, error } = await supabase
        .from('analysis_requests')
        .insert({
          name: formData.name,
          email: formData.email,
          service_type: formData.type,
        })
        .select('id')
        .single()
      if (error) {
        console.error(error)
        alert('Failed to create request.')
        setIsSubmitting(false)
        return
      }
      setRequestId(data.id)
      setIsSubmitting(false)
      setStep(3)
    } else {
      setStep(s => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  return (
    <section id="analysis-request" className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">Get Expert Analysis</h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          {onBackService && (
            <button
              onClick={onBackService}
              className="mb-4 text-sm font-medium text-darkGold"
            >
              ← Change Service
            </button>
          )}
          <Current formData={formData} onChange={handleChange} requestId={requestId} />

          {step > 1 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-1 border-2 border-darkGold text-darkGold font-bold rounded-xl"
              >
                Back
              </button>
              {step < STEPS.length ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className="px-4 py-1 bg-darkGold text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => {}}
                  disabled
                  className="px-6 py-3 bg-darkGold text-white font-bold rounded-xl"
                >
                  {/* Chat UI handles messages */}
                  In Chat…
                </button>
              )}
            </div>
          )}

          <StepIndicator
            stepCount={STEPS.length}
            currentStep={step}
            className={step === 1 ? 'pt-0' : 'pt-6'}
          />
        </div>
      </div>
    </section>
  )
}