import React from 'react';
import { Mail, X } from 'lucide-react';

export default function EnterOTP({ 
  userEmail, 
  otpCode, 
  setOtpCode, 
  handleVerifyOTP, 
  isVerifying, 
  handleResendOTP, 
  isResending, 
  setShowOTPForm, 
  setUserId 
}) {
  return (
    <div className="p-6 sm:p-8">
      {/* Close button */}
      <button
        onClick={() => {
          setShowOTPForm(false);
          setOtpCode('');
          setUserId(null);
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <X size={24} />
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-[#502538]/10 rounded-full flex items-center justify-center mb-4">
          <Mail width={40} height={40} className="text-[#502538]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit code to<br />
          <span className="font-semibold text-gray-800">{userEmail}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleVerifyOTP} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enter OTP Code
          </label>
          <input
            type="text"
            maxLength="6"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#250815] focus:ring-2 focus:ring-[#250815]/20 transition-all duration-300 text-center text-2xl tracking-widest font-semibold"
            placeholder="000000"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            Code expires in 10 minutes
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isVerifying || otpCode.length !== 6}
          className="w-full bg-[#502538] text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:bg-[#3a0c23] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isVerifying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-[#502538] font-semibold hover:text-[#3a0c23] hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}
