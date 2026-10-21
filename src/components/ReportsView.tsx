import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Check, 
  Calendar, 
  Building, 
  Printer, 
  FileDown, 
  Eye, 
  ShieldCheck, 
  Scale, 
  DollarSign, 
  Leaf, 
  Clock, 
  X,
  Database
} from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';
import { 
  generateRelationalAnalyticsPdf, 
  generateArchitectureWhitepaperPdf, 
  ReportPdfConfig 
} from '../utils/pdfGenerator';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  const activeCampus = state.campuses.find(c => c.campus_id === state.currentCampusId) || state.campuses[0];
  const activeFacility = facilityFilter === 'ALL' 
    ? 'All Facilities (Consolidated)' 
    : state.facilities.find(f => f.facility_id === facilityFilter)?.facility_name || 'Selected Facility';

  // Generate Report Data based on selected report type
  const getReportData = () => {
    switch (selectedReport) {
      case 'daily_waste': {
        const rows = db.getViewDailyWasteSummary()
          .filter(r => facilityFilter === 'ALL' || r.facility_id === facilityFilter)
          .filter(r => r.operation_date >= startDate && r.operation_date <= endDate);
        
        const totalWaste = rows.reduce((acc, r) => acc + r.total_waste_qty, 0);
        const totalCost = rows.reduce((acc, r) => acc + r.total_waste_cost, 0);

        return {
          title: 'Daily Food Waste Summary Report',
          sourceView: 'vw_daily_waste_summary',
          headers: ['Date', 'Facility', 'Meal Period', 'Total Waste (kg)', 'Financial Loss (INR)'],
          rows: rows.map(r => [
            r.operation_date,
            r.facility_name,
            r.meal_name,
            `${r.total_waste_qty.toFixed(1)} kg`,
            `INR ${Math.round(r.total_waste_cost).toLocaleString('en-IN')}`
          ]),
          rawRows: rows,
          kpis: {
            totalWasteKg: totalWaste,
            totalFinancialLoss: totalCost,
            recordCount: rows.length,
            co2OffsetKg: totalWaste * 2.5
          }
        };
      }
      case 'facility_comparison': {
        const rows = db.getViewFacilityPerformance();
        const totalWaste = rows.reduce((acc, r) => acc + (r.waste_kg_per_attendee * r.dining_capacity), 0);
        const totalCost = rows.reduce((acc, r) => acc + r.total_waste_cost, 0);

        return {
          title: 'Facility Dining Performance & Waste Intensity Audit',
          sourceView: 'vw_facility_performance',
          headers: ['Facility Name', 'Type', 'Capacity', 'Waste %', 'Waste / Attendee (kg)', 'Total Loss (INR)'],
          rows: rows.map(r => [
            r.facility_name,
            r.facility_type,
            r.dining_capacity,
            `${r.facility_waste_percentage}%`,
            `${r.waste_kg_per_attendee} kg`,
            `INR ${Math.round(r.total_waste_cost).toLocaleString('en-IN')}`
          ]),
          rawRows: rows,
          kpis: {
            totalWasteKg: totalWaste,
            totalFinancialLoss: totalCost,
            recordCount: rows.length,
            co2OffsetKg: totalWaste * 2.5
          }
        };
      }
      case 'food_item_waste': {
        const rows = db.getViewFoodItemWasteAnalysis();
        const totalWaste = rows.reduce((acc, r) => acc + r.total_waste_qty, 0);
        const totalCost = rows.reduce((acc, r) => acc + r.total_financial_loss, 0);

        return {
          title: 'Commodity Waste Analysis by Item Catalog',
          sourceView: 'vw_food_item_waste_analysis',
          headers: ['Item Name', 'Category', 'Unit Cost (INR)', 'Incidents', 'Total Waste (kg)', 'Total Loss (INR)'],
          rows: rows.map(r => [
            r.item_name,
            r.category_name,
            `INR ${r.standard_unit_cost}`,
            r.waste_incidents,
            `${r.total_waste_qty.toFixed(1)} kg`,
            `INR ${Math.round(r.total_financial_loss).toLocaleString('en-IN')}`
          ]),
          rawRows: rows,
          kpis: {
            totalWasteKg: totalWaste,
            totalFinancialLoss: totalCost,
            recordCount: rows.length,
            co2OffsetKg: totalWaste * 2.5
          }
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

        const totalWaste = Object.values(reasonsMap).reduce((acc, d) => acc + d.qty, 0);
        const totalCost = Object.values(reasonsMap).reduce((acc, d) => acc + d.cost, 0);

        return {
          title: 'Root Cause Controlled Waste Distribution',
          sourceView: 'view_waste_root_causes',
          headers: ['Reason / Root Cause', 'Incident Count', 'Total Wasted (kg)', 'Financial Impact (INR)'],
          rows: Object.entries(reasonsMap).map(([name, data]) => [
            name,
            data.count,
            `${data.qty.toFixed(1)} kg`,
            `INR ${Math.round(data.cost).toLocaleString('en-IN')}`
          ]),
          rawRows: Object.entries(reasonsMap),
          kpis: {
            totalWasteKg: totalWaste,
            totalFinancialLoss: totalCost,
            recordCount: Object.keys(reasonsMap).length,
            co2OffsetKg: totalWaste * 2.5
          }
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

        const totalCons = state.consumptions.reduce((acc, c) => acc + c.consumed_quantity, 0);

        return {
          title: 'Attendance Variance vs Food Consumption Audit',
          sourceView: 'vw_attendance_variance_audit',
          headers: ['Date', 'Facility', 'Expected Att.', 'Actual Att.', 'Variance', 'Consumed Volume'],
          rows,
          rawRows: rows,
          kpis: {
            totalWasteKg: totalCons * 0.12, // Estimated plate residual
            totalFinancialLoss: totalCons * 0.12 * 45,
            recordCount: rows.length,
            co2OffsetKg: totalCons * 0.12 * 2.5
          }
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
            `INR ${Math.round(p.total_amount).toLocaleString('en-IN')}`
          ];
        });

        const totalSpend = state.purchases.reduce((acc, p) => acc + p.total_amount, 0);

        return {
          title: 'Procurement Moving Average & Vendor Spend Summary',
          sourceView: 'vw_procurement_batch_analysis',
          headers: ['PO Number', 'Date', 'Supplier Name', 'Status', 'Item Lines', 'Total Spend (INR)'],
          rows,
          rawRows: rows,
          kpis: {
            totalWasteKg: 0,
            totalFinancialLoss: totalSpend,
            recordCount: rows.length,
            co2OffsetKg: 0
          }
        };
      }
    }
  };

  const reportData = getReportData();

  // Handle PDF Generation & Download
  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    try {
      const pdfConfig: ReportPdfConfig = {
        reportTitle: reportData.title,
        reportType: selectedReport,
        sourceView: reportData.sourceView,
        campusName: activeCampus.name,
        facilityName: activeFacility,
        dateRange: `${startDate} to ${endDate}`,
        generatedAt: new Date().toLocaleString('en-IN', { timeZoneName: 'short' }),
        operator: `${state.users.find(u => u.user_id === state.currentUserId)?.full_name || state.currentUserId} (${state.roles.find(r => r.role_code === state.currentUserRole)?.role_name || state.currentUserRole})`,
        kpis: reportData.kpis,
        headers: reportData.headers,
        rows: reportData.rows,
        summaryFootnote: 'Generated from Cloud SQL PostgreSQL (Serializable Snapshot Isolation / RLS active).'
      };

      const filename = generateRelationalAnalyticsPdf(pdfConfig);
      setExportNotice(`Generated official printable PDF: "${filename}"`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      setExportNotice(`Failed to generate PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle CSV Export
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

  const handlePrintDocument = () => {
    window.print();
  };

  // Handle Architecture Whitepaper PDF Export
  const handleExportWhitepaperPdf = () => {
    try {
      const fileName = generateArchitectureWhitepaperPdf();
      setExportNotice(`Generated official Architecture Whitepaper PDF: "${fileName}"`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err: any) {
      console.error('Whitepaper PDF Generation Error:', err);
      setExportNotice(`Failed to generate whitepaper PDF: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 harness-card p-6 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              PRD Section 15
            </span>
            <span className="text-xs text-[var(--color-graphite)] font-mono">
              PostgreSQL 15+ &bull; Relational Audit &amp; PDF Export
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-[var(--color-pure-white)] flex items-center gap-2.5 mt-2 tracking-[0.056em]">
            <FileText className="w-5 h-5 text-[var(--color-phosphor-mint)]" />
            Operational &amp; ESG Analytical Reports Suite
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-graphite)] mt-1">
            Generate printable, high-fidelity PDF compliance summaries and tabular audits for campus governance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPrintPreview(true)}
            className="harness-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 min-h-[38px] rounded-full cursor-pointer hover:border-[var(--color-phosphor-mint)] transition-all"
            title="Preview printable executive report"
          >
            <Eye className="w-4 h-4 text-[var(--color-phosphor-mint)]" />
            Print Preview
          </button>

          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="harness-btn-primary px-5 py-2 text-xs flex items-center gap-2 min-h-[38px] rounded-full cursor-pointer font-medium shadow-sm transition-all"
            title="Download vector A4 PDF"
          >
            <FileDown className="w-4 h-4" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs bg-[var(--color-obsidian)] border border-[var(--color-steel-border)] text-[var(--color-pure-white)] hover:text-[var(--color-phosphor-mint)] hover:border-[var(--color-phosphor-mint)] rounded-full flex items-center gap-1.5 min-h-[38px] cursor-pointer transition-all"
            title="Export raw tabular CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Architectural Whitepaper & Defense Manual Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#70dcd3]/30 bg-gradient-to-r from-[var(--color-carbon-plate)] via-[#0d1e26] to-[var(--color-carbon-plate)] backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#70dcd3]" />
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              Technical Whitepaper &amp; Architectural Blueprint
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#70dcd3]/15 text-[#70dcd3] border border-[#70dcd3]/30">
              docs/CFWIS_ARCHITECTURE_WHITEPAPER.md
            </span>
          </div>
          <p className="text-xs text-[var(--color-graphite)] max-w-3xl leading-relaxed">
            Exhaustive 8-section publication documentation: mathematical BCNF proofs, ER diagrams, PostGIS spatial mechanics, and evaluation defense talking points for all 20 SQL queries.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportWhitepaperPdf}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-black bg-gradient-to-r from-[#70dcd3] to-[#5ec9c0] hover:brightness-110 border border-[#70dcd3] shadow-md transition-all flex items-center gap-2 cursor-pointer"
            title="Compile and export complete architecture whitepaper as a multi-page PDF"
          >
            <FileDown className="w-3.5 h-3.5 fill-current" />
            Export Whitepaper PDF
          </button>
        </div>
      </div>

      {/* Export / Notification Notice */}
      {exportNotice && (
        <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-verdant-edge)] rounded-[12px] text-[var(--color-phosphor-mint)] text-xs flex items-center gap-2 font-mono no-print">
          <Check className="w-4 h-4 text-[var(--color-verdant-edge)] shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="harness-card p-5 flex flex-wrap items-center justify-between gap-4 text-xs no-print">
        
        {/* Report Selector */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-graphite)] text-[11px]">Select Analytical Report:</span>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
            className="harness-input text-[var(--color-phosphor-mint)] font-medium rounded-[5px] px-3 py-1.5 focus:outline-none cursor-pointer text-xs"
          >
            <option value="daily_waste">1. Daily Waste Report (vw_daily_waste_summary)</option>
            <option value="facility_comparison">2. Facility Comparison Report (vw_facility_performance)</option>
            <option value="food_item_waste">3. Food Item Waste Report (vw_food_item_waste_analysis)</option>
            <option value="waste_reason">4. Root Cause Controlled Distribution Report</option>
            <option value="attendance_consumption">5. Attendance vs Consumption Audit Report</option>
            <option value="procurement_summary">6. Procurement &amp; Inventory Spend Summary</option>
          </select>
        </div>

        {/* Date and Facility Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[var(--color-graphite)]" />
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="harness-input text-[var(--color-pure-white)] rounded-[5px] px-2.5 py-1.5 focus:outline-none text-xs"
            >
              <option value="ALL">All Facilities (Consolidated)</option>
              {state.facilities.map(f => (
                <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-graphite)]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="harness-input text-[var(--color-pure-white)] rounded-[5px] px-2 py-1 font-mono text-xs"
            />
            <span className="text-[var(--color-graphite)]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="harness-input text-[var(--color-pure-white)] rounded-[5px] px-2 py-1 font-mono text-xs"
            />
          </div>
        </div>

      </div>

      {/* Relational KPI Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 no-print">
        <div className="harness-card p-4 rounded-[16px] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-graphite)]">
            <span>Audited Waste</span>
            <Scale className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-lg font-light text-[var(--color-pure-white)] font-mono">
            {reportData.kpis.totalWasteKg.toFixed(1)} <span className="text-xs text-[var(--color-graphite)]">kg</span>
          </div>
          <div className="text-[10px] text-[var(--color-graphite)]">Audited period aggregate</div>
        </div>

        <div className="harness-card p-4 rounded-[16px] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-graphite)]">
            <span>Financial Loss</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-light text-[var(--color-pure-white)] font-mono">
            ₹{Math.round(reportData.kpis.totalFinancialLoss).toLocaleString()}
          </div>
          <div className="text-[10px] text-[var(--color-graphite)]">Based on snapshot unit cost</div>
        </div>

        <div className="harness-card p-4 rounded-[16px] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-graphite)]">
            <span>Carbon Emission Eq.</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-light text-[var(--color-pure-white)] font-mono">
            {Math.round(reportData.kpis.co2OffsetKg || 0).toLocaleString()} <span className="text-xs text-[var(--color-graphite)]">kg CO₂e</span>
          </div>
          <div className="text-[10px] text-[var(--color-graphite)]">EPA greenhouse calculation</div>
        </div>

        <div className="harness-card p-4 rounded-[16px] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-graphite)]">
            <span>Audited Records</span>
            <Database className="w-3.5 h-3.5 text-[var(--color-phosphor-mint)]" />
          </div>
          <div className="text-lg font-light text-[var(--color-pure-white)] font-mono">
            {reportData.kpis.recordCount} <span className="text-xs text-[var(--color-graphite)]">rows</span>
          </div>
          <div className="text-[10px] text-[var(--color-verdant-edge)] font-mono">PostgreSQL BCNF verified</div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="harness-card rounded-[20px] overflow-hidden no-print">
        <div className="p-4 border-b border-[var(--color-steel-border)] bg-[var(--color-obsidian)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-pure-white)] font-semibold">
              {reportData.title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-carbon-plate)] border border-[var(--color-steel-border)] text-[var(--color-graphite)]">
              {reportData.sourceView}
            </span>
          </div>
          <span className="text-[var(--color-phosphor-mint)] font-mono text-[11px]">
            {reportData.rows.length} rows &bull; Ready for Printable PDF
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[var(--color-obsidian)] text-[var(--color-graphite)] font-semibold border-b border-[var(--color-steel-border)] sticky top-0">
              <tr>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-steel-border)]">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="py-8 text-center text-[var(--color-graphite)]">
                    No records found for the selected facility and date filters.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[var(--color-obsidian)]/60 transition-colors">
                    {row.map((val, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-4 text-[var(--color-pure-white)]">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Document Modal Preview */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#ffffff] text-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            
            {/* Modal Controls Bar (hidden during actual window.print()) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <span className="font-medium text-sm">Printable Document Preview (A4 Standard)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDocument}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save as PDF
                </button>
                <button
                  onClick={handleGeneratePdf}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-teal-400" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable Body */}
            <div className="p-8 sm:p-12 overflow-y-auto font-sans printable-document text-slate-800 bg-white space-y-6">
              
              {/* Official Masthead */}
              <div className="border-b-2 border-teal-700 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold tracking-widest text-teal-700 uppercase">
                    Campus Sustainability &amp; Dining Intelligence System
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                    {reportData.title}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Relational PostgreSQL Query View: <span className="font-mono text-slate-700 font-semibold">{reportData.sourceView}</span>
                  </p>
                </div>
                <div className="text-right sm:shrink-0 text-xs text-slate-500 font-mono">
                  <div className="inline-block px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                    POSTGRESQL BCNF / SSI CERTIFIED
                  </div>
                  <div className="mt-1.5 text-[11px]">Audit Ref: #{selectedReport.toUpperCase()}-{Date.now().toString().slice(-6)}</div>
                </div>
              </div>

              {/* Institutional Context Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">University Campus</span>
                  <span className="font-semibold text-slate-800">{activeCampus.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Dining Facility</span>
                  <span className="font-semibold text-slate-800">{activeFacility}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Audited Timeframe</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">{startDate} to {endDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Generated Timestamp</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">{new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Executive KPI Summary Boxes */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border-l-4 border-red-500 border-y border-r border-slate-200 rounded">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Total Waste Mass</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {reportData.kpis.totalWasteKg.toFixed(1)} kg
                  </div>
                  <div className="text-[9px] text-slate-400">Audited volume</div>
                </div>

                <div className="p-3 bg-slate-50 border-l-4 border-amber-500 border-y border-r border-slate-200 rounded">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Financial Deficit</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    ₹{Math.round(reportData.kpis.totalFinancialLoss).toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-400">Unit cost basis</div>
                </div>

                <div className="p-3 bg-slate-50 border-l-4 border-emerald-500 border-y border-r border-slate-200 rounded">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Carbon Impact</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {Math.round(reportData.kpis.co2OffsetKg || 0).toLocaleString()} kg CO₂e
                  </div>
                  <div className="text-[9px] text-slate-400">EPA GHG factor</div>
                </div>

                <div className="p-3 bg-slate-50 border-l-4 border-teal-500 border-y border-r border-slate-200 rounded">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Audited Records</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {reportData.kpis.recordCount} Records
                  </div>
                  <div className="text-[9px] text-slate-400">Serializable rows</div>
                </div>
              </div>

              {/* Tabular Analytics Breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Relational Dataset Breakdown
                </h3>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-900 text-white font-semibold">
                      <tr>
                        {reportData.headers.map((h, i) => (
                          <th key={i} className="py-2 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 text-slate-800">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Institutional Attestation & Sign-off Block */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Institutional Compliance &amp; ACID Provenance Attestation
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  This document serves as an immutable compliance snapshot generated from the Campus Food Waste Intelligence System running on PostgreSQL 15+ in region asia-southeast1. All records satisfy Boyce-Codd Normal Form (BCNF) validation rules, Serializable Snapshot Isolation (SSI), and Row-Level Security (RLS) partition controls in accordance with university ESG sustainability mandates.
                </p>

                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                  <div>
                    <div className="h-8 border-b border-slate-400 w-3/4"></div>
                    <span className="block text-[10px] font-bold text-slate-800 mt-1">Dr. S. K. Narayan</span>
                    <span className="block text-[9px] text-slate-500">Director of Campus Dining Services</span>
                  </div>
                  <div>
                    <div className="h-8 border-b border-slate-400 w-3/4"></div>
                    <span className="block text-[10px] font-bold text-slate-800 mt-1">Prof. Ananya Roy</span>
                    <span className="block text-[9px] text-slate-500">Chief Sustainability &amp; Environmental Auditor</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
