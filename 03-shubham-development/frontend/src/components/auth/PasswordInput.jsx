"use client";
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import PasswordStrength from './PasswordStrength';

/**
 * PasswordInput Component
 * Reusable password input with visibility toggle and strength indicator
 */
export default function PasswordInput({
  label = 'Password',
  error = null,
  showStrength = true,
  register = null,
  validation = null,
  placeholder = '••••••••',
  value = '',
  onChange = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputProps = register
    ? register('password', validation)
    : {
        value,
        onChange,
      };

  return (
    <div className="group">
      <label className="block text-[11px] font-bold text-[#3a1224]/70 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#C0A04C] transition-colors">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          {...inputProps}
          {...props}
          placeholder={placeholder}
          className={`w-full bg-[#3a1224]/3 border text-[#3a1224] px-5 py-4 pr-12 rounded-xl focus:outline-none focus:bg-[#3a1224]/5 transition-all duration-300 placeholder-[#3a1224]/30 text-sm font-medium ${
            error
              ? 'border-red-400 focus:border-red-400 bg-red-50 focus:bg-red-50'
              : 'border-[#3a1224]/10 focus:border-[#C0A04C]/50'
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#3a1224]/40 hover:text-[#3a1224]/60 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-[10px] mt-2 ml-1 font-bold uppercase tracking-wider">
          {error}
        </p>
      )}

      {/* Strength Indicator */}
      {showStrength && inputProps.value && (
        <PasswordStrength password={inputProps.value} />
      )}
    </div>
  );
}
