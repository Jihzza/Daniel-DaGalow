import React, { useState } from 'react';

const CoachingRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    coachingType: 'personal', // 'personal' or 'business'
    experience: 'beginner', // 'beginner', 'intermediate', or 'advanced'
    goals: '',
    preferredTime: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setFormData({
        name: '',
        email: '',
        coachingType: 'personal',
        experience: 'beginner',
        goals: '',
        preferredTime: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section id="coaching-request" className="py-8 px-4 text-white">
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-black mb-8">
            Start Your Coaching Journey
          </h2>
        </div>

        <div className="rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="">
                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-oxfordBlue border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold focus:border-transparent transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
              <div className="">
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-oxfordBlue border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold focus:border-transparent transition-all duration-300"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-black mb-4">
                Coaching Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="coachingType"
                    value="personal"
                    checked={formData.coachingType === 'personal'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="p-4 bg-oxfordBlue border border-white/20 rounded-xl text-white cursor-pointer transition-all duration-300 peer-checked:bg-darkGold/20 peer-checked:border-darkGold">
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/40 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-3 h-3 bg-darkGold rounded-full hidden peer-checked:block" />
                      </div>
                      <span>Personal Development</span>
                    </div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    type="radio"
                    name="coachingType"
                    value="business"
                    checked={formData.coachingType === 'business'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="p-4 bg-oxfordBlue border border-white/20 rounded-xl text-white cursor-pointer transition-all duration-300 peer-checked:bg-darkGold/20 peer-checked:border-darkGold">
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/40 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-3 h-3 bg-darkGold rounded-full hidden peer-checked:block" />
                      </div>
                      <span>Business Growth</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-black mb-4">
                Experience Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="experience"
                    value="beginner"
                    checked={formData.experience === 'beginner'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="p-4 bg-oxfordBlue border border-white/20 rounded-xl text-white cursor-pointer transition-all duration-300 peer-checked:bg-darkGold/20 peer-checked:border-darkGold">
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/40 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-3 h-3 bg-darkGold rounded-full hidden peer-checked:block" />
                      </div>
                      <span>Beginner</span>
                    </div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    type="radio"
                    name="experience"
                    value="intermediate"
                    checked={formData.experience === 'intermediate'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="p-4 bg-oxfordBlue border border-white/20 rounded-xl text-white cursor-pointer transition-all duration-300 peer-checked:bg-darkGold/20 peer-checked:border-darkGold">
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/40 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-3 h-3 bg-darkGold rounded-full hidden peer-checked:block" />
                      </div>
                      <span>Intermediate</span>
                    </div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    type="radio"
                    name="experience"
                    value="advanced"
                    checked={formData.experience === 'advanced'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="p-4 bg-oxfordBlue border border-white/20 rounded-xl text-white cursor-pointer transition-all duration-300 peer-checked:bg-darkGold/20 peer-checked:border-darkGold">
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/40 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-3 h-3 bg-darkGold rounded-full hidden peer-checked:block" />
                      </div>
                      <span>Advanced</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="">
              <label htmlFor="goals" className="block text-sm font-medium text-black mb-2">
                Your Goals
              </label>
              <textarea
                id="goals"
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-oxfordBlue border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Describe your goals and what you hope to achieve through coaching..."
              />
            </div>

            <div className="">
                <label htmlFor="preferredTime" className="block text-sm font-medium text-black mb-2">
                Preferred Time for Sessions
              </label>
              <input
                type="text"
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-oxfordBlue border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold focus:border-transparent transition-all duration-300"
                placeholder="e.g., Weekday evenings, Weekend mornings"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-darkGold w-60 text-white font-bold px-6 py-3 rounded-lg shadow-lg ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Request Coaching'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CoachingRequest; 