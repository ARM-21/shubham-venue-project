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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Menu</h2>

      {/* Menu Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMenuMode('package')}
          className={`
            flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 cursor-pointer  
            ${menuMode === 'package'
              ? 'bg-[#66213f] text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Menu Packages
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMenuMode('custom')}
          className={`
            flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 cursor-pointer
            ${menuMode === 'custom'
              ? 'bg-[#66213f] text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <div className="flex items-center justify-center">
            <PlusIcon className="w-5 h-5 mr-2" />
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
      relative border-2 rounded-lg p-5 cursor-pointer transition-all duration-300 
      ${selectedPackage?._id === pkg._id
              ? 'border-[#66213f] shadow-lg'
              : 'border-gray-200 hover:border-[#66213f] hover:shadow-md'
            }
    `}
        >
          {/* Hover Overlay with View Full Menu Button */}
          <div className={`
      absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center
      opacity-0 group-hover:opacity-100 transition-opacity duration-300
      ${selectedPackage?._id === pkg._id ? 'opacity-0 hover:opacity-100' : ''}
    `}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = ROUTES.SITE.MENU_DETAILS(pkg.slug);
              }}
              className="bg-white text-[#66213f] px-6 py-3 rounded-lg font-semibold 
                   hover:bg-[#66213f] hover:text-white transition-colors duration-300
                   shadow-lg cursor-pointer"
            >
              View Full Menu
            </button>
          </div>

          {/* Package Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-bold text-gray-800">{pkg.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
            </div>
            <div className={`
        w-6 h-6 rounded-full border-2 flex items-center justify-center
        ${selectedPackage?._id === pkg._id ? 'border-[#66213f] bg-[#66213f]' : 'border-gray-300'}
      `}>
              {selectedPackage?._id === pkg._id && (
                <CheckIcon width={20} color='white' />
              )}
            </div>
          </div>

          {/* Package Items */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Includes:</p>
            <ul className="space-y-1">
              {pkg.sections.slice(0, 5).map((item, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-[#66213f] mr-2">•</span>
                  {item.section.title}
                </li>
              ))}
              {pkg.sections.length > 5 && (
                <li className="text-sm text-gray-500 italic">
                  +{pkg.sections.length - 5} more items...
                </li>
              )}
            </ul>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Per person</span>
              <span className="text-lg font-bold text-[#66213f]">
                NPR {pkg.pricePerPerson.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-gray-700">
                Total for {data.guests} guests
              </span>
              <span className="text-xl font-bold text-gray-800">
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
            <h3 className="text-lg font-semibold text-gray-700">Build Your Custom Menu</h3>

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
                <h4 className="text-md font-semibold text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-[#66213f] rounded-full mr-2"></span>
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
                        border-2 rounded-lg p-4 transition-all duration-300
                        ${isSelected
                            ? 'border-[#66213f] bg-[#66213f]'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                      `}
                      >
                        <div className="flex items-center justify-between">
                          {/* Item Info */}
                          <div className="flex-1">
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCustomItemToggle(item)}
                                className="mt-1 mr-3 w-5 h-5 text-[#66213f] border-gray-300 rounded focus:ring-[#66213f]"
                              />
                              <div>
                                <h5 className="font-semibold text-gray-800">{item.name}</h5>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                                <p className="text-sm font-medium text-[#66213f] mt-2">
                                  NPR {item.pricePerPerson} / person
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          {isSelected && (
                            <div className="ml-4 flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">Qty:</label>
                              <input
                                type="number"
                                min="1"
                                value={selectedItem.quantity}
                                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                className="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-#66213f-500 text-center"
                              />
                              <span className="text-sm font-semibold text-gray-700 ml-2">
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
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-300">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Serving Style
          </label>
          <select
            {...register('servingStyle')}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-#66213f-500"
          >
            <option value="buffet">Buffet Style</option>
            <option value="plated">Plated Service</option>
            <option value="family">Family Style</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dietary Restrictions (Optional)
          </label>
          <input
            type="text"
            {...register('dietaryRestrictions')}
            placeholder="e.g., Vegetarian, Vegan, Gluten-free"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-#66213f-500"
          />
        </div>
      </div> */}

      {/* Total Summary */}
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Menu Total</p>
            <p className="text-xs text-gray-500 mt-1">
              {menuMode === 'package' ? `${selectedPackage?.name || 'No package selected'}` : `${selectedCustomItems.length} items selected`}
            </p>
          </div>
          <p className="text-3xl font-bold text-#66213f-600">
            NPR {getTotal().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-[#66213f] text-white font-semibold rounded-lg hover:bg-#66213f transition-colors shadow-lg cursor-pointer"
        >
          Continue to Decorations →
        </button>
      </div>
    </form>
  );
}
