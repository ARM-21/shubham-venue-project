// components/booking/Step2MenuSelection.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { CheckIcon, PlusIcon, Salad, Flame, Dessert, Wine } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { FormSelectField, FormTextField, PrimaryButton, SecondaryButton, ActionButtonGroup } from './FormInputs';

export default function Step2MenuSelection({ data, onUpdate, onNext, onPrev }) {
  const [menuPackages, setMenuPackages] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(data.selectedPackage || null);
  const [selectedCustomItems, setSelectedCustomItems] = useState(data.selectedMenu || []);
  const [menuMode, setMenuMode] = useState(data.menuMode || 'package'); // 'package' or 'custom'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' or specific category
  const [itemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // Get category icon and color
  const getCategoryStyle = (category) => {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('starter') || categoryLower.includes('appetizer') || categoryLower.includes('appetiser')) {
      return { icon: Salad, color: '#10b981', label: '🥗 Starters' };
    }
    if (categoryLower.includes('main') || categoryLower.includes('entrée') || categoryLower.includes('entree')) {
      return { icon: Flame, color: '#ef4444', label: '🍖 Main Courses' };
    }
    if (categoryLower.includes('dessert') || categoryLower.includes('sweet')) {
      return { icon: Dessert, color: '#f59e0b', label: '🍰 Desserts' };
    }
    if (categoryLower.includes('drink') || categoryLower.includes('beverage') || categoryLower.includes('wine')) {
      return { icon: Wine, color: '#8b5cf6', label: '🍷 Beverages' };
    }
    return { icon: Salad, color: '#6366f1', label: '✨ ' + category };
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      dietaryRestrictions: data.dietaryRestrictions || ''
    }
  });

  // Fetch menu data
  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      // Fetch menus with their dishes
      const menusRes = await axiosInstance.get(ROUTES.API.MENUS.ROOT);
      
      // Extract menus (packages)
      const menus = menusRes.data?.menus || menusRes.data?.data || (Array.isArray(menusRes.data) ? menusRes.data : []);
      setMenuPackages(menus);
      
      // Extract all dishes from menus WITH DEDUPLICATION
      let allDishes = [];
      const seenDishIds = new Set();
      
      menus.forEach((menu) => {
        if (menu.sections && Array.isArray(menu.sections)) {
          menu.sections.forEach((section) => {
            if (section.dishes && Array.isArray(section.dishes)) {
              section.dishes.forEach((dish) => {
                // Only add dish if we haven't seen this ID before
                if (!seenDishIds.has(dish._id)) {
                  seenDishIds.add(dish._id);
                  allDishes.push({
                    ...dish,
                    menuName: menu.name,
                    category: section.section?.title || section.section || 'Uncategorized',
                  });
                }
              });
            }
          });
        }
      });
      setCustomItems(allDishes);
    } catch (error) {
      toast.error('Failed to load menu options');
      console.error(error);
      // Set empty arrays on error
      setMenuPackages([]);
      setCustomItems([]);
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

  // Filter items by search query and category
  const filteredItems = customItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group filtered items by category
  const groupedByCategory = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Flatten grouped items for pagination
  const flattenedItems = Object.entries(groupedByCategory).flatMap(([category, items]) => 
    items.map((item, idx) => ({ ...item, _categoryKey: `${category}-${idx}` }))
  );

  const totalPages = Math.ceil(flattenedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = flattenedItems.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
      dietaryRestrictions: formData.dietaryRestrictions
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
            <p className="text-xs text-slate-600 mt-1">{flattenedItems.length} items available</p>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search dishes by name, category, or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 text-sm font-medium text-slate-900 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">Menu Section</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 text-sm font-medium text-slate-900 bg-white hover:border-slate-400 transition-colors"
            >
              <option value="all">All Sections</option>
              {[...new Set(customItems.map(item => item.category))].sort().map(category => (
                <option key={category} value={category}>
                  {getCategoryStyle(category).label}
                </option>
              ))}
            </select>
          </div>

          {flattenedItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 font-medium">No items match your search</p>
            </div>
          ) : (
            <>
              {/* Category Header */}
              {paginatedItems.length > 0 && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-[#C0A04C]/10 to-[#C0A04C]/5 border border-[#C0A04C]/20 rounded-xl p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {paginatedItems[0]?.category ? getCategoryStyle(paginatedItems[0].category).label : '✨ Menu Items'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Paginated Items */}
              <div className="space-y-3">
                {paginatedItems.map((item, idx) => {
                  const isSelected = selectedCustomItems.some(i => i.itemId === item._id);
                  const selectedItem = selectedCustomItems.find(i => i.itemId === item._id);
                  // Create unique key combining item ID and pagination offset
                  const uniqueKey = `${item._id}-${startIndex + idx}`;

                  return (
                    <div
                      key={uniqueKey}
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
                              <p className="text-xs text-slate-500 mt-1">{item.category}</p>
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
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:inline">Qty:</label>
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-600">
                      Page <span className="text-[#C0A04C]">{currentPage}</span> of <span className="text-[#C0A04C]">{totalPages}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Additional Options */}
      <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-200">
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
