'use client';
import { Check } from "lucide-react";

export default function StepIndicator({ currentStep, steps }) {
  const stepList = Array.isArray(steps) && steps.length
    ? steps
    : [
        { key: 'details', title: 'Event Details', description: 'Basic information' },
        { key: 'menu', title: 'Menu Selection', description: 'Choose your menu' },
        { key: 'decor', title: 'Decorations', description: 'Select theme & addons' },
        { key: 'payment', title: 'Payment', description: 'Review & confirm' }
      ];

  return (
    <div className="mb-16 px-4 sm:px-0">
      {/* Desktop View - Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between gap-4">
          {stepList.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            
            return (
              <div key={stepNumber} className={`flex items-center flex-1 ${index < stepList.length - 1 ? '' : ''}`}>
                {/* Step Circle */}
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${
                      isCompleted
                        ? 'bg-[#3a1224] text-white shadow-lg'
                        : isCurrent
                        ? 'bg-[#C0A04C] text-[#3a1224] shadow-lg ring-4 ring-[#C0A04C]/30 scale-110'
                        : 'bg-gray-100 text-[#3a1224]/30'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-7 h-7" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  
                  {/* Step Details */}
                  <div className="absolute top-16 text-center whitespace-nowrap">
                    <p
                      className={`font-black text-xs uppercase tracking-widest transition-colors duration-300 ${
                        isCurrent ? 'text-[#3a1224]' : isCompleted ? 'text-[#3a1224]' : 'text-[#3a1224]/40'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-[10px] mt-1 transition-colors duration-300 ${
                        isCurrent ? 'text-[#3a1224]/70' : isCompleted ? 'text-[#3a1224]/60' : 'text-[#3a1224]/30'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < stepList.length - 1 && (
                  <div className="flex-1 h-1 mx-3 relative">
                    <div className="absolute inset-0 bg-[#3a1224]/10 rounded-full"></div>
                    <div
                      className={`absolute inset-0 bg-[#3a1224] rounded-full transition-all duration-700 ${
                        currentStep > stepNumber ? 'w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Vertical */}
      <div className="md:hidden">
        <div className="space-y-6">
          {stepList.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            
            return (
              <div key={stepNumber} className="flex items-start gap-4">
                {/* Step Circle & Line Container */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-500 ${
                      isCompleted
                        ? 'bg-[#3a1224] text-white shadow-lg'
                        : isCurrent
                        ? 'bg-[#C0A04C] text-[#3a1224] shadow-lg ring-4 ring-[#C0A04C]/30'
                        : 'bg-gray-100 text-[#3a1224]/30'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  
                  {/* Vertical Connector Line */}
                  {index < stepList.length - 1 && (
                    <div className="w-1 h-20 relative mt-3 mb-1">
                      <div className="absolute inset-0 bg-[#3a1224]/10 rounded-full"></div>
                      <div
                        className={`absolute inset-0 bg-[#3a1224] rounded-full transition-all duration-700 ${
                          currentStep > stepNumber ? 'h-full' : 'h-0'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1.5">
                  <p
                    className={`font-black text-sm uppercase tracking-widest transition-colors duration-300 ${
                      isCurrent ? 'text-[#3a1224]' : isCompleted ? 'text-[#3a1224]' : 'text-[#3a1224]/40'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-xs mt-1 transition-colors duration-300 ${
                      isCurrent ? 'text-[#3a1224]/70' : isCompleted ? 'text-[#3a1224]/60' : 'text-[#3a1224]/30'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Text */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">
            Step <span className="text-[#C0A04C]">{currentStep}</span> of {stepList.length}
          </p>
        </div>
      </div>
    </div>
  );
}
