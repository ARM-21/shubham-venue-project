"use client";
import React, { useMemo } from 'react';
import {
  checkPasswordRequirements,
  getPasswordStrengthLevel,
  calculatePasswordStrength,
} from 'utils/passwordValidation';
import { Check, X } from 'lucide-react';

/**
 * PasswordStrength Component
 * Displays password strength meter and requirements checklist
 */
export default function PasswordStrength({ password, showRequirements = true }) {
  const requirements = useMemo(() => checkPasswordRequirements(password), [password]);
  const strengthLevel = useMemo(() => getPasswordStrengthLevel(password), [password]);
  const strengthScore = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  const requirementsList = [
    { key: 'minLength', label: 'At least 8 characters', met: requirements.minLength },
    { key: 'uppercase', label: 'One uppercase letter (A-Z)', met: requirements.uppercase },
    { key: 'lowercase', label: 'One lowercase letter (a-z)', met: requirements.lowercase },
    { key: 'number', label: 'One number (0-9)', met: requirements.number },
    { key: 'specialChar', label: 'One special character (!@#$%^&*)', met: requirements.specialChar },
    { key: 'notCommon', label: 'Not a common password', met: requirements.notCommon },
  ];

  return (
    <div className="space-y-3 mt-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold text-[#3a1224]/60 uppercase tracking-widest">
            Strength
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${strengthLevel.textColor}`}>
            {strengthLevel.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#3a1224]/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthLevel.color}`}
            style={{ width: `${strengthScore}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5 pt-2 pb-1">
          {requirementsList.map((req) => (
            <div
              key={req.key}
              className="flex items-center gap-2 text-[9px] transition-colors duration-200"
            >
              {req.met ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-green-600 font-medium">{req.label}</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-[#3a1224]/50 font-medium">{req.label}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warning for common passwords */}
      {!requirements.notCommon && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-2.5">
          <p className="text-[9px] text-red-600 font-bold uppercase">
            ⚠️ This password is too common. Choose something unique.
          </p>
        </div>
      )}
    </div>
  );
}
