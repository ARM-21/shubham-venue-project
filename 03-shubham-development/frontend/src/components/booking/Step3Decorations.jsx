// components/booking/Step3Decorations.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FormTextField, FormTextarea, PrimaryButton, SecondaryButton, ActionButtonGroup } from './FormInputs';

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
      {/* No Decoration Option */}
      <div
        onClick={handleNoDecoration}
        className={`border rounded-lg p-6 cursor-pointer transition-all ${
          noDecoration
            ? 'border-[#C0A04C] bg-[#C0A04C]/5'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              noDecoration ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-slate-300'
            }`}>
              {noDecoration && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">No Decoration Needed</h4>
              <p className="text-sm text-slate-600">I'll handle decorations myself</p>
            </div>
          </div>
          <span className="text-lg font-bold text-[#C0A04C]">NPR 0</span>
        </div>
      </div>

      {/* Decoration Schemes */}
      {!noDecoration && (
        <>
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Choose a Decoration Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decorationSchemes.map((scheme) => (
                <div
                  key={scheme._id}
                  onClick={() => handleSchemeSelect(scheme)}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedScheme?._id === scheme._id
                      ? 'border-[#C0A04C] ring-2 ring-[#C0A04C]/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Scheme Image */}
                  {scheme.imageUrl && (
                    <div className="relative h-48 bg-slate-100">
                      <Image
                        src={scheme.imageUrl}
                        alt={scheme.name}
                        fill
                        className="object-cover"
                      />
                      {selectedScheme?._id === scheme._id && (
                        <div className="absolute top-4 right-4 bg-[#C0A04C] text-white rounded-full p-2 shadow-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scheme Details */}
                  <div className="p-5">
                    <h4 className="font-semibold text-slate-900 mb-2">{scheme.name}</h4>
                    <p className="text-sm text-slate-600 mb-3">{scheme.description}</p>

                    {/* Features */}
                    {scheme.features && scheme.features.length > 0 && (
                      <ul className="space-y-1 mb-4">
                        {scheme.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-xs text-slate-600 flex items-start">
                            <span className="text-[#C0A04C] mr-2 font-semibold">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Price */}
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Package Price</span>
                        <span className="text-lg font-bold text-[#C0A04C]">
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
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Additional Add-ons</h3>
              <p className="text-sm text-slate-600 mt-1">Enhance your decoration with these optional extras</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAddons.map((addon) => {
                const isSelected = selectedAddons.some(a => a.addonId === addon._id);

                return (
                  <div
                    key={addon._id}
                    onClick={() => handleAddonToggle(addon)}
                    className={`border rounded-lg p-5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#C0A04C] bg-[#C0A04C]/5'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 text-[#C0A04C] border-slate-300 rounded focus:ring-[#C0A04C]/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h5 className="font-semibold text-slate-900">{addon.name}</h5>
                            <p className="text-sm text-slate-600 mt-1">{addon.description}</p>
                          </div>
                          <span className="text-lg font-bold text-[#C0A04C] flex-shrink-0">
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
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Customization Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormTextField
                label="Color Preference"
                placeholder="e.g., Gold and White, Pink and Purple"
                {...register('colorPreference')}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Upload Inspiration Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
                />
                <p className="text-xs text-slate-500 mt-2">Upload up to 5 images</p>
              </div>
            </div>

            <FormTextarea
              label="Additional Theme Notes"
              placeholder="Any specific decoration requests, special requirements, or ideas..."
              rows={3}
              {...register('themeNotes')}
            />
          </div>
        </>
      )}

      {/* Total Summary */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#4a172d] rounded-lg p-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-xs font-semibold text-[#C0A04C] uppercase tracking-widest">Decoration Scheme</span>
            <span className="font-bold text-[#C0A04C]">
              NPR {getSchemeTotal().toLocaleString()}
            </span>
          </div>
          {selectedAddons.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs font-semibold text-[#C0A04C] uppercase tracking-widest">Add-ons ({selectedAddons.length})</span>
              <span className="font-bold text-[#C0A04C]">
                NPR {getAddonsTotal().toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-[#C0A04C]/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#C0A04C] uppercase tracking-widest">Decoration Total</p>
              {!noDecoration && (
                <p className="text-xs text-[#C0A04C]/70 mt-2">
                  {selectedScheme ? selectedScheme.name : 'No scheme selected'}
                  {selectedAddons.length > 0 && ` + ${selectedAddons.length} addon${selectedAddons.length > 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            <p className="text-4xl font-bold text-[#C0A04C]">
              NPR {getDecorationTotal().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <ActionButtonGroup>
        <SecondaryButton onClick={onPrev}>← Back to Menu</SecondaryButton>
        <PrimaryButton type="submit">
          Continue to Payment →
        </PrimaryButton>
      </ActionButtonGroup>
    </form>
  );
}
