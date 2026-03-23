// components/booking/steps/Step2MenuSelection.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { ROUTES } from 'config/routes';

export default function Step2MenuSelection({ data, onUpdate, onNext, onPrev }) {
  const [menuPackages, setMenuPackages] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(data.selectedPackage || null);
  const [selectedCustomItems, setSelectedCustomItems] = useState(data.selectedMenu || []);
  const [menuMode, setMenuMode] = useState(data.menuMode || 'package'); // 'package' or 'custom'
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      dietaryRestrictions: data.dietaryRestrictions || '',
      servingStyle: data.servingStyle || 'buffet'
    }
  });

  // Fetch menu data
  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [packagesRes, itemsRes] = await Promise.all([
        axiosInstance.get(ROUTES.API.MENUS.ROOT),
        axiosInstance.get(ROUTES.API.DISHES.ROOT)
      ]);

      setMenuPackages(packagesRes.data || []);
      setCustomItems(itemsRes.data || []);
    } catch (error) {
      toast.error('Failed to load menu options');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for selected package
  const calculatePackageTotal = () => {
    if (!selectedPackage) return 0;
    return selectedPackage.pricePerPerson * data.guests;
  };

  // Calculate total for custom items
  const calculateCustomTotal = () => {
    return selectedCustomItems.reduce((total, item) => {
      return total + (item.pricePerUnit * item.quantity);
    }, 0);
  };

  const getTotal = () => {
    return menuMode === 'package' ? calculatePackageTotal() : calculateCustomTotal();
  };

  // Handle package selection
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  // Handle custom item quantity change
  const handleCustomItemToggle = (item) => {
    const existingIndex = selectedCustomItems.findIndex(i => i.itemId === item._id);

    if (existingIndex >= 0) {
      // Remove item
      setSelectedCustomItems(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add item with default quantity
      setSelectedCustomItems(prev => [...prev, {
        itemId: item._id,
        name: item.name,
        category: item.category,
        pricePerUnit: item.pricePerPerson,
        quantity: data.guests, // Default to guest count
        total: item.pricePerPerson * data.guests
      }]);
    }
  };

  // Update quantity for custom item
  const handleQuantityChange = (itemId, newQuantity) => {
    setSelectedCustomItems(prev => prev.map(item => {
      if (item.itemId === itemId) {
        return {
          ...item,
          quantity: parseInt(newQuantity) || 0,
          total: item.pricePerUnit * (parseInt(newQuantity) || 0)
        };
      }
      return item;
    }));
  };

  const onSubmit = (formData) => {
    // Validate selection
    if (menuMode === 'package' && !selectedPackage) {
      toast.error('Please select a menu package');
      return;
    }

    if (menuMode === 'custom' && selectedCustomItems.length === 0) {
      toast.error('Please select at least one menu item');
      return;
    }

    // Prepare data
    const menuData = {
      
      menuMode,
      selectedPackage: menuMode === 'package' ? selectedPackage : null,
      selectedMenu: menuMode === 'custom' ? selectedCustomItems : [],
      menuTotal: getTotal(),
      dietaryRestrictions: formData.dietaryRestrictions,
      servingStyle: formData.servingStyle
    };

    onUpdate(menuData);
    onNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-#66213f-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-[#C0A04C]"></div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Step 2</p>
          <h2 className="text-2xl font-display font-black text-[#3a1224]">Select Your Menu</h2>
          <p className="text-sm text-[#3a1224]/60 mt-1">Choose from our curated packages or build your own</p>
        </div>
      </div>

      {/* Menu Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMenuMode('package')}
          className={`
            flex-1 h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 cursor-pointer
            ${menuMode === 'package'
              ? 'bg-[#3a1224] text-[#C0A04C]'
              : 'bg-gray-50 text-[#3a1224]/60 border border-[#3a1224]/10 hover:border-[#3a1224]/20'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Menu Packages
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMenuMode('custom')}
          className={`
            flex-1 h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 cursor-pointer
            ${menuMode === 'custom'
              ? 'bg-[#3a1224] text-[#C0A04C]'
              : 'bg-gray-50 text-[#3a1224]/60 border border-[#3a1224]/10 hover:border-[#3a1224]/20'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Custom Menu
          </div>
        </button>
      </div>

      {/* Package Selection */}
      {menuPackages.map((pkg) => (

        <div
          key={pkg._id}
          onClick={() => handlePackageSelect(pkg)}
          className={`
      relative border rounded-3xl p-6 cursor-pointer transition-all duration-300 shadow-lg
      ${selectedPackage?._id === pkg._id
              ? 'border-[#C0A04C]/30 bg-white ring-2 ring-[#C0A04C]/20'
              : 'border-[#3a1224]/5 bg-white/95 hover:border-[#3a1224]/10'
            }
    `}
        >
          {/* Hover Overlay with View Full Menu Button */}
          <div className={`
      absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center
      opacity-0 group-hover:opacity-100 transition-opacity duration-300
      ${selectedPackage?._id === pkg._id ? 'opacity-0 hover:opacity-100' : ''}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = ROUTES.SITE.MENU_DETAILS(pkg.slug);
              }}
              className="bg-white text-[#3a1224] px-6 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest
                   hover:bg-[#C0A04C] hover:text-white transition-colors duration-300
                   shadow-lg cursor-pointer"
            >
              View Full Menu
            </button>
          </div>

          {/* Package Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-display font-black text-[#3a1224]">{pkg.name}</h4>
              <p className="text-sm text-[#3a1224]/60 mt-1">{pkg.description}</p>
            </div>
            <div className={`
        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
        ${selectedPackage?._id === pkg._id ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-[#3a1224]/10'}
      `}>
              {selectedPackage?._id === pkg._id && (
                <CheckIcon width={16} color='#3a1224' />
              )}
            </div>
          </div>

          {/* Package Items */}
          <div className="space-y-2 mb-4">
            <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Includes:</p>
            <ul className="space-y-1">
              {pkg.sections.slice(0, 5).map((item, index) => (
                <li key={index} className="text-sm text-[#3a1224]/70 flex items-start">
                  <span className="text-[#C0A04C] mr-2">•</span>
                  {item.section.title}
                </li>
              ))}
              {pkg.sections.length > 5 && (
                <li className="text-sm text-[#3a1224]/40 italic">
                  +{pkg.sections.length - 5} more items...
                </li>
              )}
            </ul>
          </div>

          {/* Price */}
          <div className="pt-4 border-t border-[#3a1224]/10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Per person</span>
              <span className="text-lg font-black text-[#C0A04C]">
                NPR {pkg.pricePerPerson.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-black text-[#3a1224]">
                Total for {data.guests} guests
              </span>
              <span className="text-xl font-black text-[#3a1224]">
                NPR {(pkg.pricePerPerson * data.guests).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Custom Menu Selection */}
      {
        menuMode === 'custom' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#C0A04C]"></div>
              <h3 className="text-lg font-display font-black text-[#3a1224]">Build Your Custom Menu</h3>
            </div>

            {/* Group items by category */}
            {Object.entries(
              customItems.reduce((acc, item) => {
                const category = item.category || 'Other';
                if (!acc[category]) acc[category] = [];
                acc[category].push(item);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-md font-display font-black text-[#3a1224] flex items-center">
                  <span className="w-2 h-2 bg-[#C0A04C] rounded-full mr-3"></span>
                  {category}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {items.map((item) => {
                    const isSelected = selectedCustomItems.some(i => i.itemId === item._id);
                    const selectedItem = selectedCustomItems.find(i => i.itemId === item._id);

                    return (
                      <div
                        key={item._id}
                        className={`
                        border rounded-xl p-5 transition-all duration-300
                        ${isSelected
                            ? 'border-[#C0A04C]/30 bg-[#C0A04C]/5 ring-2 ring-[#C0A04C]/20'
                            : 'border-[#3a1224]/5 bg-white/95 hover:border-[#3a1224]/10'
                          }
                      `}
                      >
                        <div className="flex items-center justify-between">
                          {/* Item Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCustomItemToggle(item)}
                                className="mt-1 w-5 h-5 text-[#C0A04C] bg-white border-[#3a1224]/10 rounded focus:ring-[#C0A04C]/20"
                              />
                              <div>
                                <h5 className="font-black text-[#3a1224]">{item.name}</h5>
                                {item.description && (
                                  <p className="text-sm text-[#3a1224]/60 mt-1">{item.description}</p>
                                )}
                                <p className="text-sm font-black text-[#C0A04C] mt-2">
                                  NPR {item.pricePerPerson} / person
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          {isSelected && (
                            <div className="ml-4 flex items-center gap-3">
                              <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Qty:</label>
                              <input
                                type="number"
                                min="1"
                                value={selectedItem.quantity}
                                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                className="w-16 px-3 py-2 bg-gray-50 border border-[#3a1224]/10 rounded-lg focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 text-center font-black text-[#3a1224]"
                              />
                              <span className="text-sm font-black text-[#3a1224] ml-2">
                                NPR {(selectedItem.total || 0).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Additional Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#3a1224]/10">
        <div>
          <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
            Serving Style
          </label>
          <select
            {...register('servingStyle')}
            className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 font-black text-[#3a1224] text-sm"
          >
            <option value="buffet">Buffet Style</option>
            <option value="plated">Plated Service</option>
            <option value="family">Family Style</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
            Dietary Restrictions (Optional)
          </label>
          <input
            type="text"
            {...register('dietaryRestrictions')}
            placeholder="e.g., Vegetarian, Vegan, Gluten-free"
            className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 placeholder-[#3a1224]/20 font-black text-[#3a1224] text-sm"
          />
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#4a172d] rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Menu Total</p>
            <p className="text-xs text-[#C0A04C]/70 mt-2">
              {menuMode === 'package' ? `${selectedPackage?.name || 'No package selected'}` : `${selectedCustomItems.length} items selected`}
            </p>
          </div>
          <p className="text-4xl font-black text-[#C0A04C]">
            NPR {getTotal().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer"
        >
          Continue to Decorations →
        </button>
      </div>
    </form>
  );
}
