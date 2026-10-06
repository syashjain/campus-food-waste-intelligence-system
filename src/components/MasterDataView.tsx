import React, { useState } from 'react';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';

export const MasterDataView: React.FC = () => {
  const { state, db } = useRelationalDatabase();
  const [activeTab, setActiveTab] = useState<'items' | 'facilities'>('items');

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 harness-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              PRD Section 9.2 &amp; 9.3
            </span>
            <span className="text-xs text-[#aeaeb7]">Master Data &amp; Soft Deactivation Invariant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-[#ffffff] flex items-center gap-2.5 mt-2 tracking-[0.056em]">
            <Building2 className="w-5 h-5 text-[#70dcd3]" />
            Facilities, Food Categories &amp; Items Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#aeaeb7] mt-1">
            Rules #10 &amp; #11: Master records cannot be hard deleted. Soft deactivation preserves historical referential integrity.
          </p>
        </div>

        <div className="flex items-center bg-[#141418] border border-[#2e3038] p-1 rounded-full text-xs">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              activeTab === 'items' ? 'bg-[#ffffff] text-[#070707] font-semibold' : 'text-[#aeaeb7] hover:text-[#ffffff]'
            }`}
          >
            Food Items ({state.foodItems.length})
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              activeTab === 'facilities' ? 'bg-[#ffffff] text-[#070707] font-semibold' : 'text-[#aeaeb7] hover:text-[#ffffff]'
            }`}
          >
            Dining Facilities ({state.facilities.length})
          </button>
        </div>
      </div>

      {activeTab === 'items' && (
        <div className="harness-card rounded-[20px] overflow-hidden">
          <div className="p-4 border-b border-[#22222a] bg-[#141418] font-semibold text-xs text-[#ffffff] flex items-center justify-between">
            <span>Food Master Catalog (Click Status to test soft deactivation guard)</span>
            <span className="text-[#70dcd3] font-mono text-[11px]">BCNF: Normalized Categories</span>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141418] text-[#aeaeb7] font-semibold border-b border-[#22222a] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Standard Unit</th>
                  <th className="py-3 px-3">Unit Cost Basis</th>
                  <th className="py-3 px-3">Perishable?</th>
                  <th className="py-3 px-4">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222a]">
                {state.foodItems.map(item => {
                  const cat = state.foodCategories.find(c => c.category_id === item.category_id);
                  return (
                    <tr key={item.item_id} className="hover:bg-[#141418]/60 transition-colors">
                      <td className="py-3 px-4 text-[#0092e4] font-bold">{item.item_code}</td>
                      <td className="py-3 px-3 font-semibold text-[#ffffff]">{item.item_name}</td>
                      <td className="py-3 px-3 text-[#aeaeb7]">{cat?.category_name}</td>
                      <td className="py-3 px-3 text-[#a6e5f2]">{item.standard_unit}</td>
                      <td className="py-3 px-3 font-bold text-[#ffffff]">₹{item.standard_unit_cost.toFixed(2)}</td>
                      <td className="py-3 px-3 text-[#c8cad0]">{item.is_perishable ? 'YES' : 'NO'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => db.toggleFoodItemActive(item.item_id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium font-mono flex items-center gap-1.5 transition-all ${
                            item.is_active 
                              ? 'border border-[#75ae4c] text-[#75ae4c] hover:bg-[#75ae4c]/10' 
                              : 'border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10'
                          }`}
                        >
                          {item.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {item.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.facilities.map(fac => {
            const campus = state.campuses.find(c => c.campus_id === fac.campus_id);
            return (
              <div key={fac.facility_id} className="p-5 harness-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#ffffff] text-base tracking-tight">{fac.facility_name}</span>
                  <button
                    onClick={() => db.toggleFacilityActive(fac.facility_id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium font-mono transition-all ${
                      fac.is_active 
                        ? 'border border-[#75ae4c] text-[#75ae4c] hover:bg-[#75ae4c]/10' 
                        : 'border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10'
                    }`}
                  >
                    {fac.is_active ? 'ACTIVE' : 'SOFT DEACTIVATED'}
                  </button>
                </div>
                <div className="text-xs text-[#aeaeb7] font-mono space-y-1.5 bg-[#141418] border border-[#2e3038] p-3 rounded-[14px]">
                  <div>Campus: <span className="text-[#ffffff]">{campus?.name}</span></div>
                  <div>Facility Code: <span className="text-[#0092e4]">{fac.facility_code}</span></div>
                  <div>Dining Seating Capacity: <span className="text-[#70dcd3] font-medium">{fac.dining_capacity} seats</span></div>
                  <div>Contact: <span className="text-[#c8cad0]">{fac.contact_phone} &bull; {fac.contact_email}</span></div>
                  <div>PostGIS Coordinates: <span className="text-[#a6e5f2]">{fac.lat.toFixed(4)}, {fac.lng.toFixed(4)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
