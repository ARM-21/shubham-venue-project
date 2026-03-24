// components/booking/Step2MenuSelection.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { FormSelectField, FormTextField, PrimaryButton, SecondaryButton, ActionButtonGroup } from './FormInputs';

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
      {/* Menu Mode Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMenuMode('package')}
          className={`flex-1 h-12 px-6 rounded-lg font-semibold text-sm transition-all ${
            menuMode === 'package'
              ? 'bg-[#C0A04C] text-white'
              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
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
          className={`flex-1 h-12 px-6 rounded-lg font-semibold text-sm transition-all ${
            menuMode === 'custom'
              ? 'bg-[#C0A04C] text-white'
              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Custom Menu
          </div>
        </button>
      </div>

      {/* Package Selection */}
      {menuMode === 'package' && menuPackages.map((pkg) => (
        <div
          key={pkg._id}
          onClick={() => handlePackageSelect(pkg)}
          className={`relative border rounded-lg p-6 cursor-pointer transition-all ${
            selectedPackage?._id === pkg._id
              ? 'border-[#C0A04C] bg-[#C0A04C]/5 ring-2 ring-[#C0A04C]/10'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          {/* Package Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900">{pkg.name}</h4>
              <p className="text-sm text-slate-600 mt-1">{pkg.description}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selectedPackage?._id === pkg._id ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-slate-300'
            }`}>
              {selectedPackage?._id === pkg._id && (
                <CheckIcon width={16} color='white' />
              )}
            </div>
          </div>

          {/* Package Items */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Includes:</p>
            <ul className="space-y-1">
              {pkg.sections.slice(0, 5).map((item, index) => (
                <li key={index} className="text-sm text-slate-700 flex items-start">
                  <span className="text-[#C0A04C] mr-2">•</span>
                  {item.section.title}
                </li>
              ))}
              {pkg.sections.length > 5 && (
                <li className="text-sm text-slate-400 italic">
                  +{pkg.sections.length - 5} more items...
                </li>
              )}
            </ul>
          </div>

          {/* Price */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Per person</span>
              <span className="text-lg font-bold text-[#C0A04C]">
                NPR {pkg.pricePerPerson.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-semibold text-slate-900">
                Total for {data.guests} guests
              </span>
              <span className="text-lg font-bold text-slate-900">
                NPR {(pkg.pricePerPerson * data.guests).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Custom Menu Selection */}
      {menuMode === 'custom' && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">Build Your Custom Menu</p>
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
              <h4 className="text-sm font-semibold text-slate-900 flex items-center">
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
                      className={`border rounded-lg p-5 transition-all ${
                        isSelected
                          ? 'border-[#C0A04C] bg-[#C0A04C]/5'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Item Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCustomItemToggle(item)}
                              className="mt-1 w-5 h-5 text-[#C0A04C] border-slate-300 rounded focus:ring-[#C0A04C]/20"
                            />
                            <div>
                              <h5 className="font-semibold text-slate-900">{item.name}</h5>
                              {item.description && (
                                <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                              )}
                              <p className="text-sm font-semibold text-[#C0A04C] mt-2">
                                NPR {item.pricePerPerson} / person
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        {isSelected && (
                          <div className="ml-4 flex items-center gap-3">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={selectedItem.quantity}
                              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                              className="w-16 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 text-center font-semibold text-slate-900"
                            />
                            <span className="text-sm font-semibold text-slate-900 ml-2">
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
      )}

      {/* Additional Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
        <FormSelectField
          label="Serving Style"
          {...register('servingStyle')}
          options={[
            { value: 'buffet', label: 'Buffet Style' },
            { value: 'plated', label: 'Plated Service' },
            { value: 'family', label: 'Family Style' }
          ]}
        />

        <FormTextField
          label="Dietary Restrictions"
          placeholder="e.g., Vegetarian, Vegan, Gluten-free"
          {...register('dietaryRestrictions')}
        />
      </div>

      {/* Total Summary */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#4a172d] rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#C0A04C] uppercase tracking-widest">Menu Total</p>
            <p className="text-sm text-[#C0A04C]/70 mt-2">
              {menuMode === 'package' ? `${selectedPackage?.name || 'No package selected'}` : `${selectedCustomItems.length} items selected`}
            </p>
          </div>
          <p className="text-4xl font-bold text-[#C0A04C]">
            NPR {getTotal().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <ActionButtonGroup>
        <SecondaryButton onClick={onPrev}>← Back</SecondaryButton>
        <PrimaryButton type="submit">
          Continue to Decorations →
        </PrimaryButton>
      </ActionButtonGroup>
    </form>
  );
}
