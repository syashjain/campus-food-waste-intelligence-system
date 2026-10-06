import React, { useState } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';

export const ProcurementView: React.FC = () => {
  const { state } = useRelationalDatabase();
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'vendors'>('orders');

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 harness-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              PRD Section 9.10
            </span>
            <span className="text-xs text-[#aeaeb7]">Procurement &amp; Standard Moving-Average Costs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-[#ffffff] flex items-center gap-2.5 mt-2 tracking-[0.056em]">
            <ShoppingBag className="w-5 h-5 text-[#70dcd3]" />
            Vendor Management &amp; Food Procurement
          </h1>
          <p className="text-xs sm:text-sm text-[#aeaeb7] mt-1">
            Purchase orders establish the standard moving average cost basis for food waste accounting.
          </p>
        </div>

        <div className="flex items-center bg-[#141418] border border-[#2e3038] p-1 rounded-full text-xs">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              activeSubTab === 'orders' ? 'bg-[#ffffff] text-[#070707] font-semibold' : 'text-[#aeaeb7] hover:text-[#ffffff]'
            }`}
          >
            Purchase Orders ({state.purchases.length})
          </button>
          <button
            onClick={() => setActiveSubTab('vendors')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              activeSubTab === 'vendors' ? 'bg-[#ffffff] text-[#070707] font-semibold' : 'text-[#aeaeb7] hover:text-[#ffffff]'
            }`}
          >
            Vendor Directory ({state.vendors.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="harness-card p-5 space-y-2">
              <span className="text-xs text-[#aeaeb7] block font-medium">Total Procurement Spend</span>
              <span className="text-2xl sm:text-3xl font-light font-mono text-[#70dcd3] tracking-tight">
                ₹{state.purchases.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#60606c] font-mono block">Cumulative moving-average pool</span>
            </div>
            <div className="harness-card p-5 space-y-2">
              <span className="text-xs text-[#aeaeb7] block font-medium">Active Vendors Contracted</span>
              <span className="text-2xl sm:text-3xl font-light font-mono text-[#ffffff] tracking-tight">
                {state.vendors.filter(v => v.is_active).length} Suppliers
              </span>
              <span className="text-[10px] text-[#75ae4c] font-mono block">100% Tax &amp; GST Compliant</span>
            </div>
            <div className="harness-card p-5 space-y-2">
              <span className="text-xs text-[#aeaeb7] block font-medium">Cost Invariant Guarantee</span>
              <span className="text-xs text-[#c8cad0] leading-relaxed block">
                Historical waste records retain original cost basis even when vendor prices escalate.
              </span>
            </div>
          </div>

          <div className="harness-card rounded-[20px] overflow-hidden">
            <div className="p-4 border-b border-[#22222a] bg-[#141418] font-semibold text-xs text-[#ffffff] flex items-center justify-between">
              <span>Procurement Invoices &amp; Batches</span>
              <span className="text-[11px] font-mono text-[#70dcd3]">Snapshot Ready</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141418] text-[#aeaeb7] font-semibold border-b border-[#22222a]">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Line Items</th>
                    <th className="py-3 px-4">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22222a]">
                  {state.purchases.map(p => {
                    const vendor = state.vendors.find(v => v.vendor_id === p.vendor_id);
                    return (
                      <tr key={p.purchase_id} className="hover:bg-[#141418]/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0092e4]">{p.po_number}</td>
                        <td className="py-3 px-3 text-[#aeaeb7]">{p.purchase_date}</td>
                        <td className="py-3 px-3 text-[#ffffff]">{vendor?.vendor_name}</td>
                        <td className="py-3 px-3">
                          <span className="harness-badge harness-badge-mint">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#aeaeb7]">
                          {p.items.map(i => {
                            const fi = state.foodItems.find(item => item.item_id === i.item_id);
                            return `${fi?.item_name || 'Item'} (${i.quantity} ${i.unit})`;
                          }).join(', ')}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#70dcd3]">₹{p.total_amount.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.vendors.map(v => (
            <div key={v.vendor_id} className="p-5 harness-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#ffffff] text-base tracking-tight">{v.vendor_name}</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono bg-[#141418] text-[#a6e5f2] border border-[#2e3038]">
                  <Star className="w-3 h-3 text-[#70dcd3] fill-[#70dcd3]" />
                  {v.compliance_rating} / 5.0
                </span>
              </div>
              <div className="text-xs text-[#aeaeb7] font-mono space-y-1.5 bg-[#141418] border border-[#2e3038] p-3 rounded-[14px]">
                <div>Contact: <span className="text-[#ffffff]">{v.contact_person} ({v.phone})</span></div>
                <div>GST / Tax ID: <span className="text-[#c8cad0]">{v.tax_identifier}</span></div>
                <div>Vendor Code: <span className="text-[#0092e4]">{v.vendor_code}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
