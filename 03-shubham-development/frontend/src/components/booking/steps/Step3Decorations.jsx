// components/booking/steps/Step3Decorations.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function Step3Decorations({ data, onUpdate, onNext, onPrev }) {
  const [decorationSchemes, setDecorationSchemes] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(data.decorationScheme || null);
  const [selectedAddons, setSelectedAddons] = useState(data.addons || []);
  const [loading, setLoading] = useState(true);
  const [noDecoration, setNoDecoration] = useState(data.noDecoration || false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      colorPreference: data.colorPreference || '',
      themeNotes: data.themeNotes || '',
      uploadedInspirations: data.uploadedInspirations || []
    }
  });

  // Fetch decoration data
  useEffect(() => {
    fetchDecorationData();
  }, []);

  const fetchDecorationData = async () => {
    try {
      setLoading(true);
      const [schemesRes, addonsRes] = await Promise.all([
        axiosInstance.get('/api/v1/decorations/schemes'),
        axiosInstance.get('/api/v1/decorations/addons')
      ]);
      
      setDecorationSchemes(schemesRes.data.schemes || []);
      setAvailableAddons(addonsRes.data.addons || []);
    } catch (error) {
      toast.error('Failed to load decoration options');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const getSchemeTotal = () => {
    if (noDecoration || !selectedScheme) return 0;
    return selectedScheme.price;
  };

  const getAddonsTotal = () => {
    return selectedAddons.reduce((total, addon) => total + addon.price, 0);
  };

  const getDecorationTotal = () => {
    return getSchemeTotal() + getAddonsTotal();
  };

  // Handle scheme selection
  const handleSchemeSelect = (scheme) => {
    setSelectedScheme(scheme);
    setNoDecoration(false);
  };

  // Handle "No Decoration" option
  const handleNoDecoration = () => {
    setNoDecoration(true);
    setSelectedScheme(null);
    setSelectedAddons([]);
  };

  // Handle addon toggle
  const handleAddonToggle = (addon) => {
    const existingIndex = selectedAddons.findIndex(a => a.addonId === addon._id);
    
    if (existingIndex >= 0) {
      // Remove addon
      setSelectedAddons(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add addon
      setSelectedAddons(prev => [...prev, {
        addonId: addon._id,
        name: addon.name,
        description: addon.description,
        price: addon.price
      }]);
    }
  };

  const onSubmit = (formData) => {
    // Validate that either a scheme is selected or no decoration is chosen
    if (!noDecoration && !selectedScheme) {
      toast.error('Please select a decoration scheme or choose "No Decoration"');
      return;
    }

    // Prepare data
    const decorationData = {
      noDecoration,
      decorationScheme: noDecoration ? null : selectedScheme,
      addons: selectedAddons,
      decorationTotal: getDecorationTotal(),
      colorPreference: formData.colorPreference,
      themeNotes: formData.themeNotes,
      uploadedInspirations: formData.uploadedInspirations
    };

    onUpdate(decorationData);
    onNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[#66213f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-[#C0A04C]"></div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Step 3</p>
          <h2 className="text-2xl font-display font-black text-[#3a1224]">Select Decorations & Add-ons</h2>
          <p className="text-sm text-[#3a1224]/60 mt-1">Enhance your event with our decoration options</p>
        </div>
      </div>

      {/* No Decoration Option */}
      <div
        onClick={handleNoDecoration}
        className={`
          border rounded-3xl p-6 cursor-pointer transition-all duration-300 shadow-lg
          ${noDecoration
            ? 'border-[#C0A04C]/30 bg-white ring-2 ring-[#C0A04C]/20'
            : 'border-[#3a1224]/5 bg-white/95 hover:border-[#3a1224]/10'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${noDecoration ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-[#3a1224]/10'}
            `}>
              {noDecoration && (
                <svg className="w-4 h-4 text-[#3a1224]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-black text-[#3a1224]">No Decoration Needed</h4>
              <p className="text-sm text-[#3a1224]/60">I'll handle decorations myself</p>
            </div>
          </div>
          <span className="text-xl font-black text-[#C0A04C]">NPR 0</span>
        </div>
      </div>

      {/* Decoration Schemes */}
      {!noDecoration && (
        <>
          <div className="space-y-4 pt-6 border-t border-[#3a1224]/10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#C0A04C]"></div>
              <h3 className="text-lg font-display font-black text-[#3a1224]">Choose a Decoration Theme</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decorationSchemes.map((scheme) => (
                <div
                  key={scheme._id}
                  onClick={() => handleSchemeSelect(scheme)}
                  className={`
                    border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg
                    ${selectedScheme?._id === scheme._id
                      ? 'border-[#C0A04C]/30 ring-2 ring-[#C0A04C]/20'
                      : 'border-[#3a1224]/5 hover:border-[#3a1224]/10'
                    }
                  `}
                >
                  {/* Scheme Image */}
                  {scheme.imageUrl && (
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={scheme.imageUrl}
                        alt={scheme.name}
                        fill
                        className="object-cover"
                      />
                      {selectedScheme?._id === scheme._id && (
                        <div className="absolute top-4 right-4 bg-[#C0A04C] text-[#3a1224] rounded-full p-2 shadow-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scheme Details */}
                  <div className="p-5">
                    <h4 className="font-black text-[#3a1224] mb-2">{scheme.name}</h4>
                    <p className="text-sm text-[#3a1224]/60 mb-3">{scheme.description}</p>

                    {/* Features */}
                    {scheme.features && scheme.features.length > 0 && (
                      <ul className="space-y-1 mb-4">
                        {scheme.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-xs text-[#3a1224]/60 flex items-start">
                            <span className="text-[#C0A04C] mr-2 font-black">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Price */}
                    <div className="pt-4 border-t border-[#3a1224]/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Package Price</span>
                        <span className="text-xl font-black text-[#C0A04C]">
                          NPR {scheme.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="space-y-4 pt-6 border-t border-[#3a1224]/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-6 bg-[#C0A04C]"></div>
              <div>
                <h3 className="text-lg font-display font-black text-[#3a1224]">Additional Add-ons</h3>
                <p className="text-sm text-[#3a1224]/60 mt-1">Enhance your decoration with these optional extras</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAddons.map((addon) => {
                const isSelected = selectedAddons.some(a => a.addonId === addon._id);

                return (
                  <div
                    key={addon._id}
                    onClick={() => handleAddonToggle(addon)}
                    className={`
                      border rounded-xl p-5 cursor-pointer transition-all duration-300
                      ${isSelected
                        ? 'border-[#C0A04C]/30 bg-[#C0A04C]/5 ring-2 ring-[#C0A04C]/20'
                        : 'border-[#3a1224]/5 bg-white/95 hover:border-[#3a1224]/10'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 text-[#C0A04C] bg-white border-[#3a1224]/10 rounded focus:ring-[#C0A04C]/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h5 className="font-black text-[#3a1224]">{addon.name}</h5>
                            <p className="text-sm text-[#3a1224]/60 mt-1">{addon.description}</p>
                          </div>
                          <span className="text-lg font-black text-[#C0A04C] flex-shrink-0">
                            NPR {addon.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Preferences */}
          <div className="space-y-4 pt-6 border-t border-[#3a1224]/10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#C0A04C]"></div>
              <h3 className="text-lg font-display font-black text-[#3a1224]">Customization Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
                  Color Preference (Optional)
                </label>
                <input
                  type="text"
                  {...register('colorPreference')}
                  placeholder="e.g., Gold and White, Pink and Purple"
                  className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 placeholder-[#3a1224]/20 font-black text-[#3a1224] text-sm"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
                  Upload Inspiration Images (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 text-sm"
                />
                <p className="text-xs text-[#3a1224]/40 mt-2">Upload up to 5 images</p>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
                Additional Theme Notes (Optional)
              </label>
              <textarea
                {...register('themeNotes')}
                rows={3}
                placeholder="Any specific decoration requests, special requirements, or ideas..."
                className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 placeholder-[#3a1224]/20 font-black text-[#3a1224] text-sm"
              />
            </div>
          </div>
        </>
      )}

      {/* Total Summary */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#4a172d] rounded-3xl p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Decoration Scheme</span>
            <span className="font-black text-[#C0A04C]">
              NPR {getSchemeTotal().toLocaleString()}
            </span>
          </div>
          {selectedAddons.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Add-ons ({selectedAddons.length})</span>
              <span className="font-black text-[#C0A04C]">
                NPR {getAddonsTotal().toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-[#C0A04C]/20 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Decoration Total</p>
              {!noDecoration && (
                <p className="text-xs text-[#C0A04C]/70 mt-2">
                  {selectedScheme ? selectedScheme.name : 'No scheme selected'}
                  {selectedAddons.length > 0 && ` + ${selectedAddons.length} addon${selectedAddons.length > 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            <p className="text-4xl font-black text-[#C0A04C]">
              NPR {getDecorationTotal().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          ← Back to Menu
        </button>
        <button
          type="submit"
          className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer"
        >
          Continue to Payment →
        </button>
      </div>
    </form>
  );
}
