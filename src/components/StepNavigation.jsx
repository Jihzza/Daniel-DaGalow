// src/components/StepNavigation.js
import React from 'react';

const StepNavigation = ({ steps, currentStep, onChange }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step) => (
          <div key={step.id} className="flex-1 relative">
            {/* Connecting line */}
            {step.id < steps.length && (
              <div 
                className={`absolute top-1/2 w-full h-1 -translate-y-1/2 ${
                  step.id < currentStep ? 'bg-darkGold' : 'bg-gentleGray'
                }`}
              />
            )}
            
            {/* Step circle */}
            <div className="relative flex flex-col items-center">
              <button
                onClick={() => onChange(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.id < currentStep 
                    ? 'bg-darkGold text-white' 
                    : step.id === currentStep 
                      ? 'bg-oxfordBlue text-white' 
                      : 'bg-gentleGray text-charcoalGray'
                } z-10`}
              >
                {step.id < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </button>
              <span className="mt-2 text-sm text-center">
                {step.title}
              </span>
              <span className="text-xs text-gray-500 text-center hidden md:block">
                {step.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepNavigation;