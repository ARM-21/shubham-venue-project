import React from 'react'

export default function MenuStats({menus}) {

    if(menus.length === 0) {
        return <p>No Stats Available</p>;
    }


  return (
    <>
     {menus.length > 0 && (
                <div className="mt-12 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#4e3842] mb-4">Menu Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-[#4e3842]">{menus.length}</div>
                            <div className="text-sm text-gray-600">Total Packages</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-[#4e3842]">
                                {Math.min(...menus.map(m => m.pricePerPerson || 0)).toLocaleString()} NPR
                            </div>
                            <div className="text-sm text-gray-600">Starting Price</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-[#4e3842]">
                                {Math.round(menus.reduce((acc, m) => acc + (m.dishCount), 0) / menus.length)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Dishes per Menu</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-[#4e3842]">
                                {menus.filter(m => m.isCustomMenu).length}
                            </div>
                            <div className="text-sm text-gray-600">Customizable</div>
                        </div>
                    </div>
                </div>
            )}
    </>

  )
}
