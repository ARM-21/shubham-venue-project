'use client';
import Image from "next/image";
import { Check } from "lucide-react";
export default function StepIndicator({ currentStep }) {
  const steps = [
    { number: 1, title: 'Event Details', description: 'Basic information' },
    { number: 2, title: 'Menu Selection', description: 'Choose your menu' },
    { number: 3, title: 'Decorations', description: 'Select theme & addons' },
    { number: 4, title: 'Payment', description: 'Review & confirm' }
  ];

  return (
    <div className="mb-10 md:mb-20 mx-20">
         {/* Progress Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 hidden md:block">
          Step <span className="font-bold text-[#66213f]">{currentStep}</span> of {steps.length}
        </p>
      </div>
      {/* Desktop View - Horizontal */}
      <div className="hidden md:block ">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    transition-all duration-300 ease-in-out
                    ${currentStep > step.number
                      ? 'bg-[#66213f] text-white shadow-lg'
                      : currentStep === step.number
                      ? 'bg-[#66213f] text-white shadow-lg ring-4 ring-gray-400 scale-110' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >

                {/* show checkmark or number based on the current step */ }
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                
                {/* Step Title & Description */}
                <div className="absolute top-14 text-center w-32">
                  <p
                    className={`
                      font-semibold text-sm transition-colors duration-300
                      ${currentStep >= step.number ? 'text-gray-800' : 'text-gray-400'}
                    `}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`
                      text-xs mt-1 transition-colors duration-300
                      ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'}
                    `}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 &&  (
                <div className="flex-1 h-1 mx-4 relative">
                  <div className="absolute inset-0 bg-gray-200 rounded"></div>
                  <div
                    className={`
                      absolute inset-0 bg-[#66213f] rounded transition-all duration-500 ease-in-out
                      ${currentStep > step.number ? 'w-full' : 'w-0'}
                    `}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View - Vertical */}
      <div className="md:hidden">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-start">
              {/* Step Circle & Line Container */}
              <div className="flex flex-col items-center mr-4">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    transition-all duration-300 ease-in-out
                    ${currentStep > step.number
                      ? 'bg-[#66213f] text-white shadow-lg'
                      : currentStep === step.number
                      ? 'bg-[#66213f] text-white shadow-lg ring-4 ring-blue-400'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                
                {/* Vertical Connector Line */}
                {index < steps.length - 1 && (
                  <div className="w-1 h-16 relative mt-2">
                    <div className="absolute inset-0 bg-gray-200 rounded"></div>
                    <div
                      className={`
                        absolute inset-0 bg-[#66213f] rounded transition-all duration-500 ease-in-out
                        ${currentStep > step.number ? 'h-full' : 'h-0'}
                      `}
                    ></div>
                  </div>
                )}
              </div>

              {/* Step Title & Description */}
              <div className="flex-1 pt-2">
                <p
                  className={`
                    font-semibold transition-colors duration-300
                    ${currentStep >= step.number ? 'text-gray-800' : 'text-gray-400'}
                  `}
                >
                  {step.title}
                </p>
                <p
                  className={`
                    text-sm mt-1 transition-colors duration-300
                    ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'}
                  `}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
   {/* Progress Text */}
      <div className="mt-6 text-center md:hidden">
        <p className="text-sm text-gray-600 ">
          Step <span className="font-bold text-[#66213f]">{currentStep}</span> of {steps.length}
        </p>
      </div>
 
    </div>
  );
}
