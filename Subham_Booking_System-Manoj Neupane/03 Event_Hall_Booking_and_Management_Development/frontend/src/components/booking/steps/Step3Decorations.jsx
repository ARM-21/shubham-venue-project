// components/booking/steps/Step3Decorations.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Decorations & Add-ons</h2>

      {/* No Decoration Option */}
      <div
        onClick={handleNoDecoration}
        className={`
          border-2 rounded-lg p-4 cursor-pointer transition-all duration-300
          ${noDecoration
            ? 'border-[#66213f] bg-[#f9f0f4] shadow-lg'
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3
              ${noDecoration ? 'border-[#66213f] bg-[#66213f]' : 'border-gray-300'}
            `}>
              {noDecoration && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">No Decoration Needed</h4>
              <p className="text-sm text-gray-600">I'll handle decorations myself</p>
            </div>
          </div>
          <span className="text-lg font-bold text-[#66213f]">NPR 0</span>
        </div>
      </div>

      {/* Decoration Schemes */}
      {!noDecoration && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Choose a Decoration Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decorationSchemes.map((scheme) => (
                <div
                  key={scheme._id}
                  onClick={() => handleSchemeSelect(scheme)}
                  className={`
                    border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-300
                    ${selectedScheme?._id === scheme._id
                      ? 'border-[#66213f] shadow-xl ring-2 ring-[#66213f]/30'
                      : 'border-gray-200 hover:border-[#66213f] hover:shadow-lg'
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
                        <div className="absolute top-2 right-2 bg-[#66213f] text-white rounded-full p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scheme Details */}
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 mb-2">{scheme.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>

                    {/* Features */}
                    {scheme.features && scheme.features.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {scheme.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start">
                            <span className="text-[#66213f] mr-1">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Price */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Package Price</span>
                        <span className="text-xl font-bold text-[#66213f]">
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
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700">Additional Add-ons</h3>
            <p className="text-sm text-gray-600">Enhance your decoration with these optional extras</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAddons.map((addon) => {
                const isSelected = selectedAddons.some(a => a.addonId === addon._id);

                return (
                  <div
                    key={addon._id}
                    onClick={() => handleAddonToggle(addon)}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all duration-300
                      ${isSelected
                        ? 'border-[#66213f] bg-[#f9f0f4]'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 mr-3 w-5 h-5 text-[#66213f] border-gray-300 rounded focus:ring-[#66213f]"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-800">{addon.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                          </div>
                          <span className="text-lg font-bold text-[#66213f] ml-4">
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
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700">Customization Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color Preference (Optional)
                </label>
                <input
                  type="text"
                  {...register('colorPreference')}
                  placeholder="e.g., Gold and White, Pink and Purple"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#66213f] focus:ring-2 focus:ring-[#66213f]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Inspiration Images (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#66213f] focus:ring-2 focus:ring-[#66213f]/20 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Upload up to 5 images</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Theme Notes (Optional)
              </label>
              <textarea
                {...register('themeNotes')}
                rows={3}
                placeholder="Any specific decoration requests, special requirements, or ideas..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#66213f] focus:ring-2 focus:ring-[#66213f]/20"
              />
            </div>
          </div>
        </>
      )}

      {/* Total Summary */}
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Decoration Scheme</span>
            <span className="font-semibold text-gray-800">
              NPR {getSchemeTotal().toLocaleString()}
            </span>
          </div>
          {selectedAddons.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Add-ons ({selectedAddons.length})</span>
              <span className="font-semibold text-gray-800">
                NPR {getAddonsTotal().toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Decoration Total</p>
              {!noDecoration && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedScheme ? selectedScheme.name : 'No scheme selected'}
                  {selectedAddons.length > 0 && ` + ${selectedAddons.length} addon${selectedAddons.length > 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            <p className="text-3xl font-bold text-[#66213f]">
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
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to Menu
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-[#66213f] text-white font-semibold rounded-lg hover:bg-[#4f1831] transition-colors shadow-lg"
        >
          Continue to Payment →
        </button>
      </div>
    </form>
  );
}
