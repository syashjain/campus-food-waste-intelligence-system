import React, { useState } from 'react';
import { FileText, Download, Check, Calendar, Building } from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';

type ReportType = 
  | 'daily_waste'
  | 'facility_comparison'
  | 'food_item_waste'
  | 'waste_reason'
  | 'attendance_consumption'
  | 'procurement_summary';

export const ReportsView: React.FC = () => {
  const { state, db } = useRelationalDatabase();
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily_waste');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Generate Report Data based on selected report type
  const getReportData = () => {
    switch (selectedReport) {
      case 'daily_waste': {
        const rows = db.getViewDailyWasteSummary()
          .filter(r => facilityFilter === 'ALL' || r.facility_id === facilityFilter)
          .filter(r => r.operation_date >= startDate && r.operation_date <= endDate);
        return {
          title: 'Daily Food Waste Summary (vw_daily_waste_summary)',
          headers: ['Date', 'Facility', 'Meal Period', 'Total Waste (kg)', 'Total Loss (INR)'],
          rows: rows.map(r => [
            r.operation_date,
            r.facility_name,
            r.meal_name,
            `${r.total_waste_qty.toFixed(1)} kg`,
            `₹${r.total_waste_cost.toLocaleString()}`
          ])
        };
      }
      case 'facility_comparison': {
        const rows = db.getViewFacilityPerformance();
        return {
          title: 'Facility Dining Performance & Waste Intensity (vw_facility_performance)',
          headers: ['Facility Name', 'Type', 'Capacity', 'Waste %', 'Waste / Attendee (kg)', 'Total Loss (INR)'],
          rows: rows.map(r => [
            r.facility_name,
            r.facility_type,
            r.dining_capacity,
            `${r.facility_waste_percentage}%`,
            `${r.waste_kg_per_attendee} kg`,
            `₹${r.total_waste_cost.toLocaleString()}`
          ])
        };
      }
      case 'food_item_waste': {
        const rows = db.getViewFoodItemWasteAnalysis();
        return {
          title: 'Commodity Waste Analysis by Item (vw_food_item_waste_analysis)',
          headers: ['Item Name', 'Category', 'Unit Cost', 'Incidents', 'Total Waste (kg)', 'Total Loss (INR)'],
          rows: rows.map(r => [
            r.item_name,
            r.category_name,
            `₹${r.standard_unit_cost}`,
            r.waste_incidents,
            `${r.total_waste_qty.toFixed(1)} kg`,
            `₹${r.total_financial_loss.toLocaleString()}`
          ])
        };
      }
      case 'waste_reason': {
        const reasonsMap: Record<string, { count: number; qty: number; cost: number }> = {};
        state.wastes.forEach(w => {
          const r = state.wasteReasons.find(reason => reason.reason_id === w.reason_id);
          const rName = r?.reason_name || 'Other';
          if (!reasonsMap[rName]) {
            reasonsMap[rName] = { count: 0, qty: 0, cost: 0 };
          }
          reasonsMap[rName].count += 1;
          reasonsMap[rName].qty += w.waste_quantity;
          reasonsMap[rName].cost += w.estimated_waste_cost;
        });
        return {
          title: 'Root Cause Controlled Waste Distribution',
          headers: ['Reason / Root Cause', 'Incident Count', 'Total Wasted (kg)', 'Financial Impact (INR)'],
          rows: Object.entries(reasonsMap).map(([name, data]) => [
            name,
            data.count,
            `${data.qty.toFixed(1)} kg`,
            `₹${Math.round(data.cost).toLocaleString()}`
          ])
        };
      }
      case 'attendance_consumption': {
        const rows = state.attendances.map(a => {
          const fac = state.facilities.find(f => f.facility_id === a.facility_id);
          const preps = state.preparations.filter(p => p.facility_id === a.facility_id && p.prep_date === a.attendance_date);
          const prepIds = preps.map(p => p.prep_id);
          const cons = state.consumptions.filter(c => prepIds.includes(c.prep_id));
          const totalCons = cons.reduce((acc, curr) => acc + curr.consumed_quantity, 0);
          return [
            a.attendance_date,
            fac?.facility_name || 'N/A',
            a.expected_attendance,
            a.actual_attendance,
            a.variance_count,
            `${Math.round(totalCons)} kg`
          ];
        });
        return {
          title: 'Attendance Variance vs Food Consumption Audit',
          headers: ['Date', 'Facility', 'Expected Att.', 'Actual Att.', 'Variance', 'Consumed Volume'],
          rows
        };
      }
      case 'procurement_summary': {
        const rows = state.purchases.map(p => {
          const v = state.vendors.find(vendor => vendor.vendor_id === p.vendor_id);
          return [
            p.po_number,
            p.purchase_date,
            v?.vendor_name || 'N/A',
            p.status,
            p.items.length,
            `₹${p.total_amount.toLocaleString()}`
          ];
        });
        return {
          title: 'Procurement Moving Average Inventory Batches',
          headers: ['PO Number', 'Date', 'Supplier Name', 'Status', 'Item Lines', 'Total Spend'],
          rows
        };
      }
    }
  };

  const reportData = getReportData();

  const handleExportCsv = () => {
    const csvContent = [
      reportData.headers.join(','),
      ...reportData.rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${reportData.rows.length} rows to CSV successfully.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 harness-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              PRD Section 15
            </span>
            <span className="text-xs text-[#aeaeb7]">Formal Reporting &amp; Standardized Export</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-[#ffffff] flex items-center gap-2.5 mt-2 tracking-[0.056em]">
            <FileText className="w-5 h-5 text-[#70dcd3]" />
            Operational &amp; ESG Analytical Reports Suite
          </h1>
          <p className="text-xs sm:text-sm text-[#aeaeb7] mt-1">
            Export standardized compliance reports for university food waste audits.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="harness-btn-primary px-5 py-2 text-xs flex items-center gap-2 shrink-0 min-h-[38px] rounded-full"
        >
          <Download className="w-4 h-4" />
          Export Report to CSV
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#141418] border border-[#75ae4c] rounded-[12px] text-[#70dcd3] text-xs flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-[#75ae4c]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="harness-card p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Report Selector */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#aeaeb7] text-[11px]">Select Report:</span>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
            className="harness-input text-[#70dcd3] font-medium rounded-[5px] px-3 py-1.5 focus:outline-none cursor-pointer text-xs"
          >
            <option value="daily_waste">1. Daily Waste Report (vw_daily_waste_summary)</option>
            <option value="facility_comparison">2. Facility Comparison Report (vw_facility_performance)</option>
            <option value="food_item_waste">3. Food Item Waste Report (vw_food_item_waste_analysis)</option>
            <option value="waste_reason">4. Waste Reason Distribution Report</option>
            <option value="attendance_consumption">5. Attendance vs Consumption Report</option>
            <option value="procurement_summary">6. Procurement &amp; Vendor Spend Summary</option>
          </select>
        </div>

        {/* Date and Facility Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#aeaeb7]" />
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="harness-input text-[#ffffff] rounded-[5px] px-2.5 py-1.5 focus:outline-none text-xs"
            >
              <option value="ALL">All Facilities</option>
              {state.facilities.map(f => (
                <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#aeaeb7]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="harness-input text-[#ffffff] rounded-[5px] px-2 py-1 font-mono text-xs"
            />
            <span className="text-[#aeaeb7]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="harness-input text-[#ffffff] rounded-[5px] px-2 py-1 font-mono text-xs"
            />
          </div>
        </div>

      </div>

      {/* Report Data Table */}
      <div className="harness-card rounded-[20px] overflow-hidden">
        <div className="p-4 border-b border-[#22222a] bg-[#141418] flex items-center justify-between text-xs">
          <span className="text-[#aeaeb7] font-semibold">
            Showing {reportData.rows.length} records &bull; Generated from relational views &amp; tables
          </span>
          <span className="text-[#70dcd3] font-mono text-[11px]">Ready for CSV Export</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141418] text-[#aeaeb7] font-semibold border-b border-[#22222a] sticky top-0">
              <tr>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222a]">
              {reportData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#141418]/60 transition-colors">
                  {row.map((val, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 text-[#ffffff]">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
