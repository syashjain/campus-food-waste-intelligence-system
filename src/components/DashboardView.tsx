import React, { useState } from 'react';
import { 
  TrendingUp, AlertTriangle, Scale, DollarSign, Users, Award, 
  Flame, PieChart, Layers, LineChart as LineChartIcon, Download, FileSpreadsheet
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ReferenceLine 
} from 'recharts';
import { useRelationalDatabase } from '../store/dbStore';
import { useTheme } from '../context/ThemeContext';
import { WasteForecastingWidget } from './WasteForecastingWidget';

// Custom Recharts Tooltip following the nocturnal terminal / command deck aesthetic
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const TerminalWasteTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-[var(--color-obsidian)] border border-[var(--color-fog)] rounded-[14px] p-3.5 shadow-2xl font-mono text-xs space-y-2.5 min-w-[270px] max-w-[320px] pointer-events-none z-50">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-iron-edge)] text-[10px]">
        <div className="flex items-center gap-1.5 text-[#70dcd3]">
          <span className="w-2 h-2 rounded-full bg-[#70dcd3] animate-pulse inline-block" />
          <span className="font-bold tracking-wider uppercase">DEV::TELEMETRY_STREAM</span>
        </div>
        <span className="text-[var(--color-graphite)] bg-[var(--color-carbon-plate)] px-1.5 py-0.5 rounded-full border border-[var(--color-iron-edge)] text-[9px]">
          TTY_01
        </span>
      </div>

      {/* Terminal Command Prompt */}
      <div className="text-[11px] text-[var(--color-graphite)] leading-tight flex items-center gap-1">
        <span className="text-[#0092e4] font-bold">$</span>
        <span className="text-[var(--color-pure-white)] truncate">cat /proc/waste_telemetry?date={data.fullDate}</span>
      </div>

      {/* Exact Timestamps Readout */}
      <div className="bg-[var(--color-carbon-plate)] border border-[var(--color-iron-edge)] rounded-[8px] p-2 space-y-1 text-[11px]">
        <div className="flex justify-between items-center text-[var(--color-graphite)]">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-cinder)]">OPERATIONAL_WINDOW</span>
          <span className="text-[var(--color-pure-white)] font-medium">{data.humanTimestamp}</span>
        </div>
        <div className="flex justify-between items-center text-[var(--color-graphite)] text-[10px]">
          <span className="text-[9px] uppercase tracking-wider text-[var(--color-cinder)]">EXACT_ISO_TIME</span>
          <span className="text-[#70dcd3] font-mono">{data.isoTimestamp}</span>
        </div>
      </div>

      {/* Primary Exact Waste Metric Callout */}
      <div className="bg-[var(--color-carbon-plate)] border border-[var(--color-fog)]/40 rounded-[10px] p-2.5 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] text-[var(--color-graphite)] block uppercase tracking-wider">Exact Waste Volume</span>
          <span className="text-xl font-bold text-[var(--color-pure-white)] flex items-baseline gap-1 font-mono">
            {data.exactWaste} <span className="text-xs font-normal text-[#70dcd3]">kg</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[var(--color-graphite)] block uppercase tracking-wider">Audit Records</span>
          <span className="text-xs font-semibold text-[#0092e4] font-mono">{data.wasteLogCount} transactions</span>
        </div>
      </div>

      {/* Multi-Metric Breakdown Table */}
      <div className="space-y-1.5 text-[11px] pt-1">
        {payload.map((entry: any, idx: number) => (
          <div key={`entry-${idx}`} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--color-graphite)]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="text-[var(--color-pure-white)] font-semibold font-mono">
              {entry.value} kg
            </span>
          </div>
        ))}
        {data.cost !== undefined && (
          <div className="flex items-center justify-between pt-1.5 border-t border-[var(--color-iron-edge)] text-[11px]">
            <span className="text-[var(--color-graphite)]">FINANCIAL_LOSS:</span>
            <span className="text-[#70dcd3] font-bold font-mono">{data.costFormatted}</span>
          </div>
        )}
      </div>

      {/* Terminal Footer Integrity Status */}
      <div className="pt-1.5 border-t border-[var(--color-iron-edge)] flex items-center justify-between text-[9px] text-[var(--color-cinder)] uppercase">
        <span>STATUS: ACTIVE_FEED</span>
        <span>BCNF_INTEGRITY: 100% PASS</span>
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const { state, db } = useRelationalDatabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const selectedDate = state.selectedDate;

  // Chart 1 state: Filter trend range (7, 30, 90 days) and comparative metric toggles
  const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);
  const [chartMode, setChartMode] = useState<'waste_only' | 'all_metrics'>('waste_only');

  // Filter entities for selected date and facility
  const prepsToday = state.preparations.filter(p => 
    p.prep_date === selectedDate && p.facility_id === state.currentFacilityId
  );
  const prepIdsToday = prepsToday.map(p => p.prep_id);
  const consumptionsToday = state.consumptions.filter(c => prepIdsToday.includes(c.prep_id));
  const wastesToday = state.wastes.filter(w => 
    w.waste_date === selectedDate && w.facility_id === state.currentFacilityId
  );
  const attendanceToday = state.attendances.filter(a => 
    a.attendance_date === selectedDate && a.facility_id === state.currentFacilityId
  );

  // 8 Core Metrics (PRD Section 14.1)
  const totalPreparedToday = Math.round(prepsToday.reduce((acc, curr) => acc + curr.prepared_quantity, 0));
  const totalConsumedToday = Math.round(consumptionsToday.reduce((acc, curr) => acc + curr.consumed_quantity, 0));
  const totalWastedToday = Math.round(wastesToday.reduce((acc, curr) => acc + curr.waste_quantity, 0) * 10) / 10;
  const wastePercentage = totalPreparedToday > 0 ? (totalWastedToday / totalPreparedToday) * 100 : 0;
  const estimatedWasteCost = Math.round(wastesToday.reduce((acc, curr) => acc + curr.estimated_waste_cost, 0));
  const totalExpectedAtt = attendanceToday.reduce((acc, curr) => acc + curr.expected_attendance, 0);
  const totalActualAtt = attendanceToday.reduce((acc, curr) => acc + curr.actual_attendance, 0);

  // Find food item with highest waste today
  const wasteByItem: Record<string, number> = {};
  wastesToday.forEach(w => {
    wasteByItem[w.item_id] = (wasteByItem[w.item_id] || 0) + w.waste_quantity;
  });
  let maxWasteItemId = '';
  let maxWaste = 0;
  Object.entries(wasteByItem).forEach(([itemId, qty]) => {
    if (qty > maxWaste) {
      maxWaste = qty;
      maxWasteItemId = itemId;
    }
  });
  const highestWasteItem = state.foodItems.find(i => i.item_id === maxWasteItemId);

  // Top waste reason today
  const wasteByReason: Record<number, number> = {};
  wastesToday.forEach(w => {
    wasteByReason[w.reason_id] = (wasteByReason[w.reason_id] || 0) + w.waste_quantity;
  });
  let topReasonId = 1;
  let topReasonQty = 0;
  Object.entries(wasteByReason).forEach(([rId, qty]) => {
    if (qty > topReasonQty) {
      topReasonQty = qty;
      topReasonId = Number(rId);
    }
  });
  const topReason = state.wasteReasons.find(r => r.reason_id === topReasonId);

  // Waste Intelligence Score for current facility
  const intelligenceScore = db.getWasteIntelligenceScore(state.currentFacilityId);

  // Compute Time-Series Telemetry for Recharts Line Graph
  const dailyTrendData = Array.from({ length: trendRange }, (_, i) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (trendRange - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });

    // Filter day's preps, consumptions, and wastes for active facility
    const dayPreps = state.preparations.filter(p => p.prep_date === dateStr && p.facility_id === state.currentFacilityId);
    const dayPrepIds = dayPreps.map(p => p.prep_id);
    const dayCons = state.consumptions.filter(c => dayPrepIds.includes(c.prep_id));
    const dayWastes = state.wastes.filter(w => w.waste_date === dateStr && w.facility_id === state.currentFacilityId);

    const rawWasted = dayWastes.reduce((acc, curr) => acc + curr.waste_quantity, 0);
    const rawCost = dayWastes.reduce((acc, curr) => acc + curr.estimated_waste_cost, 0);

    return {
      date: dayLabel,
      fullDate: dateStr,
      weekday,
      humanTimestamp: `${weekday}, ${dateStr} 23:59:59 UTC`,
      isoTimestamp: `${dateStr}T23:59:59.000Z`,
      wasted: Math.round(rawWasted * 10) / 10,
      exactWaste: rawWasted.toFixed(2),
      wasteLogCount: dayWastes.length,
      prepared: Math.round(dayPreps.reduce((acc, curr) => acc + curr.prepared_quantity, 0)),
      consumed: Math.round(dayCons.reduce((acc, curr) => acc + curr.consumed_quantity, 0)),
      cost: Math.round(rawCost),
      costFormatted: `₹${Math.round(rawCost).toLocaleString()}`
    };
  });

  // Calculate average waste for benchmark reference line
  const avgWasteVolume = dailyTrendData.length > 0 
    ? Math.round(dailyTrendData.reduce((acc, curr) => acc + curr.wasted, 0) / dailyTrendData.length)
    : 0;

  // CSV Export Utility Function for Current Waste Metrics & Chart Telemetry
  const exportWasteMetricsCsv = () => {
    const currentFacility = state.facilities.find(f => f.facility_id === state.currentFacilityId);
    const headers = [
      'Record_Date',
      'Day_Of_Week',
      'ISO_Timestamp',
      'Waste_Quantity_KG',
      'Estimated_Loss_INR',
      'Audit_Log_Transactions',
      'Prepared_Quantity_KG',
      'Consumed_Quantity_KG',
      'Facility_Code',
      'Facility_Name',
      'Campus_ID'
    ];

    const rows = dailyTrendData.map(d => [
      d.fullDate,
      d.weekday,
      d.isoTimestamp,
      d.exactWaste,
      d.cost,
      d.wasteLogCount,
      d.prepared,
      d.consumed,
      `"${currentFacility?.facility_code || 'N/A'}"`,
      `"${currentFacility?.facility_name || 'N/A'}"`,
      `"${state.currentCampusId}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cfwis_waste_metrics_${state.currentFacilityId}_${trendRange}d_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Chart 2: Waste by Food Category
  const categoryWaste: Record<string, { name: string; qty: number; cost: number }> = {};
  state.wastes.forEach(w => {
    const item = state.foodItems.find(i => i.item_id === w.item_id);
    const cat = state.foodCategories.find(c => c.category_id === item?.category_id);
    const cName = cat?.category_name || 'Other';
    if (!categoryWaste[cName]) {
      categoryWaste[cName] = { name: cName, qty: 0, cost: 0 };
    }
    categoryWaste[cName].qty += w.waste_quantity;
    categoryWaste[cName].cost += w.estimated_waste_cost;
  });
  const topCategories = Object.values(categoryWaste).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Chart 3: Waste by Facility
  const facilityWaste = db.getViewFacilityPerformance();

  // Chart 5: Waste Reason Breakdown
  const reasonBreakdown: Record<string, number> = {};
  state.wastes.forEach(w => {
    const r = state.wasteReasons.find(wr => wr.reason_id === w.reason_id);
    const rName = r?.reason_name || 'Other';
    reasonBreakdown[rName] = (reasonBreakdown[rName] || 0) + w.waste_quantity;
  });
  const topReasons = Object.entries(reasonBreakdown)
    .map(([name, qty]) => ({ name, qty: Math.round(qty) }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner: Date, Facility context & Phosphor Mint Intelligence Score */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 harness-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              Live Relational Snapshot
            </span>
            <span className="text-xs text-[var(--color-graphite)]">Date: <strong className="text-[var(--color-pure-white)] font-mono">{selectedDate}</strong></span>
          </div>
          <h1 className="text-xl sm:text-3xl font-light text-[var(--color-pure-white)] mt-2 tracking-[0.056em]">
            Campus Dining &amp; Food Waste Operations
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-graphite)] mt-1">
            Real-time batch tracking, consumption validation, and cost-basis loss analytics.
          </p>
        </div>

        {/* Top Actions: Export CSV Data & Score Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Export Data Button */}
          <button
            onClick={exportWasteMetricsCsv}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] hover:border-[var(--color-fog)] text-[var(--color-pure-white)] text-xs font-medium transition-all shadow-sm cursor-pointer hover:bg-[var(--color-obsidian)]/80 active:scale-95"
            title="Download full operational waste telemetry as CSV"
          >
            <Download className="w-4 h-4 text-[#70dcd3] transition-transform group-hover:-translate-y-0.5" />
            <span className="font-mono text-xs">Export Telemetry (CSV)</span>
          </button>

          {/* Academic Food Waste Intelligence Score Badge — Phosphor Mint Highlight Card */}
          <div className="harness-card-accent p-4 rounded-[20px] flex items-center gap-4 text-[#070707] shrink-0 border border-[#d9dae5] shadow-lg">
            <div className="h-12 w-12 rounded-full bg-[#070707] text-[#70dcd3] flex items-center justify-center font-bold text-xl font-mono border border-[#70dcd3]">
              {intelligenceScore.composite_score}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#070707] uppercase tracking-wider">Waste Intelligence Score</span>
                <Award className="w-3.5 h-3.5 text-[#070707]" />
              </div>
              <div className="text-sm font-extrabold text-[#070707]">
                {intelligenceScore.rating}
              </div>
              <div className="text-[10px] text-[#070707]/80 font-mono mt-0.5">
                Waste: {intelligenceScore.waste_rate_score} | Cost: {intelligenceScore.financial_severity_score} | Att: {intelligenceScore.attendance_prediction_score}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Primary Dashboard KPIs (PRD Section 14.1) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Prepared */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Prepared Today</span>
            <Flame className="w-4 h-4 text-[#0092e4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[var(--color-pure-white)] font-mono tracking-tight">
            {totalPreparedToday} <span className="text-xs font-normal text-[var(--color-graphite)]">kg</span>
          </div>
          <p className="text-[10px] text-[var(--color-cinder)]">Sum across scheduled batches</p>
        </div>

        {/* KPI 2: Consumed */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Consumed Today</span>
            <Scale className="w-4 h-4 text-[#70dcd3]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#70dcd3] font-mono tracking-tight">
            {totalConsumedToday} <span className="text-xs font-normal text-[var(--color-graphite)]">kg</span>
          </div>
          <p className="text-[10px] text-[var(--color-cinder)]">Measured scale tally</p>
        </div>

        {/* KPI 3: Waste */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Discarded Today</span>
            <AlertTriangle className="w-4 h-4 text-[#f43f5e]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#f43f5e] font-mono tracking-tight">
            {totalWastedToday} <span className="text-xs font-normal text-[var(--color-graphite)]">kg</span>
          </div>
          <p className="text-[10px] text-[var(--color-cinder)]">Direct scale logs</p>
        </div>

        {/* KPI 4: Waste Ratio */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Waste Percentage</span>
            <TrendingUp className="w-4 h-4 text-[#75ae4c]" />
          </div>
          <div className={`text-2xl sm:text-3xl font-light font-mono tracking-tight ${
            wastePercentage > 15 ? 'text-[#f43f5e]' : 'text-[#75ae4c]'
          }`}>
            {wastePercentage.toFixed(1)}%
          </div>
          <p className="text-[10px] text-[var(--color-cinder)]">Target threshold &lt; 8.0%</p>
        </div>

        {/* KPI 5: Estimated Cost Loss */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Cost of Waste</span>
            <DollarSign className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#f59e0b] font-mono tracking-tight">
            ₹{estimatedWasteCost.toLocaleString()}
          </div>
          <p className="text-[10px] text-[var(--color-cinder)]">Unit cost multiplied loss</p>
        </div>

        {/* KPI 6: Expected vs Actual Attendance */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Attendance</span>
            <Users className="w-4 h-4 text-[#0092e4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#0092e4] font-mono tracking-tight">
            {totalActualAtt} <span className="text-xs font-normal text-[var(--color-graphite)]">/ {totalExpectedAtt}</span>
          </div>
          <p className="text-[10px] text-[var(--color-cinder)]">
            Variance: <span className={totalActualAtt < totalExpectedAtt ? 'text-[#f43f5e] font-mono' : 'text-[#70dcd3] font-mono'}>
              {totalActualAtt - totalExpectedAtt}
            </span>
          </p>
        </div>

        {/* KPI 7: Highest Waste Food Item */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Highest-Waste Item</span>
            <Flame className="w-4 h-4 text-[#f43f5e]" />
          </div>
          <div className="text-lg font-medium text-[var(--color-pure-white)] truncate" title={highestWasteItem?.item_name || 'N/A'}>
            {highestWasteItem?.item_name || 'None Recorded'}
          </div>
          <p className="text-[10px] text-[#f43f5e] font-mono">
            {maxWaste > 0 ? `${maxWaste} kg discarded` : 'No excess waste'}
          </p>
        </div>

        {/* KPI 8: Most Common Waste Reason */}
        <div className="harness-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-graphite)] text-xs font-medium">
            <span>Primary Root Cause</span>
            <AlertTriangle className="w-4 h-4 text-[#a6e5f2]" />
          </div>
          <div className="text-lg font-medium text-[#a6e5f2] truncate" title={topReason?.reason_name || 'N/A'}>
            {topReason?.reason_name || 'Overproduction'}
          </div>
          <p className="text-[10px] text-[var(--color-cinder)]">
            Category: {topReason?.category || 'KITCHEN'}
          </p>
        </div>

      </div>

      {/* Charts Section (PRD Section 14.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Daily Food Waste Trend using Recharts Line Graph & Custom Terminal Tooltip */}
        <div className="harness-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="harness-eyebrow">TIME-SERIES TELEMETRY</div>
              <h3 className="text-lg font-light text-[var(--color-pure-white)] flex items-center gap-2 tracking-[0.056em] mt-0.5">
                <LineChartIcon className="w-4 h-4 text-[#70dcd3]" />
                Daily Food Waste Trend
              </h3>
              <p className="text-xs text-[var(--color-graphite)]">Operational trend tracking exact waste volume across dining sessions</p>
            </div>

            {/* Range and Mode Controls — Pill shaped (800px) */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Mode Toggle */}
              <div className="flex items-center bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] p-1 rounded-full text-[11px]">
                <button
                  onClick={() => setChartMode('waste_only')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    chartMode === 'waste_only' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
                  }`}
                >
                  Waste Only
                </button>
                <button
                  onClick={() => setChartMode('all_metrics')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    chartMode === 'all_metrics' ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
                  }`}
                >
                  Compare All
                </button>
              </div>

              {/* Time Range Selector (7d, 30d, 90d) */}
              <div className="flex items-center bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] p-1 rounded-full font-mono text-[11px]">
                {([7, 30, 90] as const).map(days => (
                  <button
                    key={days}
                    onClick={() => setTrendRange(days)}
                    className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                      trendRange === days 
                        ? 'bg-[#70dcd3] text-[#070707] font-bold' 
                        : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>

              {/* Quick Chart CSV Export */}
              <button
                onClick={exportWasteMetricsCsv}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] hover:border-[var(--color-fog)] text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] transition-colors cursor-pointer font-mono text-[11px]"
                title="Download CSV for this time slice"
              >
                <Download className="w-3.5 h-3.5 text-[#70dcd3]" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>

          {/* Recharts Line Graph Visualization */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 15, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2e3038' : '#e2e8f0'} opacity={0.7} />
                <XAxis 
                  dataKey="date" 
                  stroke={isDark ? '#aeaeb7' : '#64748b'} 
                  fontSize={11} 
                  tickLine={false}
                  dy={4}
                  interval={trendRange === 90 ? 7 : trendRange === 30 ? 2 : 0}
                />
                <YAxis 
                  stroke={isDark ? '#aeaeb7' : '#64748b'} 
                  fontSize={11} 
                  tickLine={false} 
                  unit="kg"
                />
                <Tooltip 
                  content={<TerminalWasteTooltip />}
                  cursor={{ stroke: '#70dcd3', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                {/* Benchmark Reference Line */}
                <ReferenceLine 
                  y={avgWasteVolume} 
                  stroke="#75ae4c" 
                  strokeDasharray="4 4" 
                  label={{ value: `Avg ${avgWasteVolume}kg`, fill: '#75ae4c', fontSize: 10, position: 'insideTopRight' }} 
                />

                {/* Primary Daily Food Waste Trend Line */}
                <Line 
                  type="monotone" 
                  dataKey="wasted" 
                  name="Waste Volume" 
                  stroke="#f43f5e" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#f43f5e', strokeWidth: 1 }} 
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#f43f5e', strokeWidth: 3 }} 
                />

                {/* Optional Comparative Metric Lines */}
                {chartMode === 'all_metrics' && (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="prepared" 
                      name="Prepared Food" 
                      stroke="#0092e4" 
                      strokeWidth={2} 
                      strokeDasharray="3 3" 
                      dot={false} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consumed" 
                      name="Consumed Food" 
                      stroke="#70dcd3" 
                      strokeWidth={2} 
                      strokeDasharray="3 3" 
                      dot={false} 
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--color-graphite)] pt-3 border-t border-[var(--color-steel-border)] font-mono">
            <span>Sample Window: <strong className="text-[var(--color-pure-white)]">{trendRange} Days</strong></span>
            <span>Query Plan: Partition Pruning on <code className="text-[#70dcd3]">food_waste_2026_q4</code></span>
          </div>
        </div>

        {/* Chart 2: Waste by Food Category */}
        <div className="harness-card p-6 space-y-4">
          <div>
            <div className="harness-eyebrow">COMMODITY DRILLDOWN</div>
            <h3 className="text-lg font-light text-[var(--color-pure-white)] flex items-center gap-2 tracking-[0.056em] mt-0.5">
              <PieChart className="w-4 h-4 text-[#a6e5f2]" />
              Waste Distribution by Food Category
            </h3>
            <p className="text-xs text-[var(--color-graphite)]">Identifies major commodity loss sectors across dining facilities</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {topCategories.map((c, i) => {
              const maxCatQty = topCategories[0]?.qty || 1;
              const pct = (c.qty / maxCatQty) * 100;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--color-pure-white)]">{c.name}</span>
                    <span className="text-[var(--color-graphite)] font-mono text-[11px]">
                      <strong className="text-[#f43f5e]">{Math.round(c.qty)} kg</strong> (₹{Math.round(c.cost).toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? 'bg-[#f43f5e]' : i === 1 ? 'bg-[#0092e4]' : i === 2 ? 'bg-[#70dcd3]' : 'bg-[#75ae4c]'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Facility Comparison */}
        <div className="harness-card p-6 space-y-4">
          <div>
            <div className="harness-eyebrow">RELATIONAL VIEW</div>
            <h3 className="text-lg font-light text-[var(--color-pure-white)] flex items-center gap-2 tracking-[0.056em] mt-0.5">
              <Layers className="w-4 h-4 text-[#0092e4]" />
              Dining Facility Comparison
            </h3>
            <p className="text-xs text-[var(--color-graphite)]">Comparing mess capacities, waste intensity per student, and total financial loss</p>
          </div>

          <div className="overflow-x-auto rounded-[14px] border border-[var(--color-steel-border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-obsidian)] text-[var(--color-graphite)] font-semibold border-b border-[var(--color-steel-border)]">
                <tr>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2">Capacity</th>
                  <th className="py-2.5 px-2">Waste %</th>
                  <th className="py-2.5 px-2">Waste / Attendee</th>
                  <th className="py-2.5 px-2">Cost Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-steel-border)] font-mono">
                {facilityWaste.map((f) => (
                  <tr key={f.facility_id} className="hover:bg-[var(--color-obsidian)] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-pure-white)]">{f.facility_name}</td>
                    <td className="py-2.5 px-2 text-[var(--color-graphite)]">{f.facility_type}</td>
                    <td className="py-2.5 px-2 text-[var(--color-graphite)]">{f.dining_capacity}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.facility_waste_percentage > 15 
                          ? 'border border-[#f43f5e] text-[#f43f5e]' 
                          : 'border border-[#75ae4c] text-[#75ae4c]'
                      }`}>
                        {f.facility_waste_percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[var(--color-graphite)]">{f.waste_kg_per_attendee} kg</td>
                    <td className="py-2.5 px-2 text-[#f43f5e] font-bold">₹{f.total_waste_cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 4: Primary Waste Drivers Breakdown */}
        <div className="harness-card p-6 space-y-4">
          <div>
            <div className="harness-eyebrow">ROOT CAUSE TAXONOMY</div>
            <h3 className="text-lg font-light text-[var(--color-pure-white)] flex items-center gap-2 tracking-[0.056em] mt-0.5">
              <AlertTriangle className="w-4 h-4 text-[#a6e5f2]" />
              Controlled Waste Reasons Distribution
            </h3>
            <p className="text-xs text-[var(--color-graphite)]">Classified root causes enabling kitchen behavioral corrections</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {topReasons.map((r, i) => {
              const maxQty = topReasons[0]?.qty || 1;
              const pct = (r.qty / maxQty) * 100;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--color-pure-white)]">{r.name}</span>
                    <span className="text-[var(--color-graphite)] font-mono text-[11px]">
                      <strong className="text-[#70dcd3]">{r.qty} kg</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${pct}%` }}
                      className="h-full bg-[#70dcd3] rounded-full"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link to trigger and SQL demo */}
          <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-[12px] text-xs text-[var(--color-graphite)] flex items-center justify-between">
            <span>Root cause audit table:</span>
            <span className="text-[#70dcd3] font-semibold font-mono text-[11px]">vw_daily_waste_summary</span>
          </div>
        </div>

      </div>

      {/* Predictive Waste Demand Forecasting Widget */}
      <WasteForecastingWidget />

    </div>
  );
};
