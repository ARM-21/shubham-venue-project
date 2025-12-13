import React from 'react'
import SearchIcon from './SearchIcon';

export default function SearchFilter({ searchTerm, setSearchTerm, sortBy, setSortBy, categories, selectedCategory, setSelectedCategory }) {
  return (
      <div className="bg-white p-4 rounded-lg shadow mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    {/* Search */}
                    <div className="w-full md:w-64">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search menus..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#421c2d] focus:border-transparent"
                            />
                            <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"/>
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="w-full md:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#421c2d focus:border-transparent"
                        >
                            <option value="name">Sort by: Name</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="dishes">Most Dishes</option>
                        </select>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    {/* {categories.map((category) => ( */}
                        <button
                            // key={category}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                     "bg-emerald-600 text-white bg-[#594850]  hover:bg-gray-200""}`}
                        >
                            { "All Menus" }
                        </button>
                    {/* ))} */}
                </div>  
            </div>

  )
}
