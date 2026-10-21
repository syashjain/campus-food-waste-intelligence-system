import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Terminal, Zap, Clock, Database, Search, Copy, Check, 
  RotateCcw, Download, AlertTriangle, Table as TableIcon, 
  Sparkles, Layers, ChevronRight, HelpCircle, FileText, CheckCircle2
} from 'lucide-react';
import alasql from 'alasql';
import { 
  INITIAL_CAMPUSES, 
  INITIAL_FACILITIES, 
  INITIAL_FOOD_ITEMS, 
  INITIAL_VENDORS, 
  INITIAL_USERS, 
  INITIAL_WASTE_LOGS, 
  INITIAL_DAILY_OPERATIONS 
} from '../data/initialData';

export type QueryDifficulty = 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SqlPreset {
  id: number;
  title: string;
  category: QueryDifficulty;
  sql: string;
  description: string;
  concept: string;
}

export const PRESENTATION_QUERIES: SqlPreset[] = [
  // Basic (CRUD & Filtering)
  {
    id: 1,
    title: 'View Active Facilities',
    category: 'Basic',
    sql: "SELECT * FROM facilities WHERE status = 'ACTIVE'",
    description: 'Filters all dining facilities and messes with an active operational status.',
    concept: 'Simple selection, projected wildcard, boolean status filter'
  },
  {
    id: 2,
    title: 'List Desserts & Costs',
    category: 'Basic',
    sql: "SELECT item_name, unit_cost FROM food_items WHERE category = 'DESSERT'",
    description: 'Retrieves all dessert inventory items alongside their per-unit standardized purchase costs.',
    concept: 'Column projection, string equality filtering'
  },
  {
    id: 3,
    title: 'High Waste Events (> 50 kg)',
    category: 'Basic',
    sql: "SELECT date, facility_id, waste_kg FROM waste_logs WHERE waste_kg > 50",
    description: 'Isolates severe food loss events exceeding the 50 kg operational threshold.',
    concept: 'Numeric threshold predicate filtering'
  },
  {
    id: 4,
    title: 'Lookup Manager by Email',
    category: 'Basic',
    sql: "SELECT name, role FROM users WHERE email = 'manager@college.edu'",
    description: 'Locates identity credentials and system RBAC role for the campus dining manager.',
    concept: 'Point lookup via unique candidate key'
  },
  {
    id: 5,
    title: 'Total Waste Events Count',
    category: 'Basic',
    sql: "SELECT COUNT(*) as total_events FROM waste_logs",
    description: 'Computes the total volume of discrete discarded food logs captured in the system.',
    concept: 'Unary aggregate COUNT(*) function'
  },

  // Intermediate (Aggregations & Joins)
  {
    id: 6,
    title: 'Total Waste per Facility',
    category: 'Intermediate',
    sql: "SELECT facility_id, SUM(waste_kg) as total_waste FROM waste_logs GROUP BY facility_id",
    description: 'Aggregates cumulative discarded kilogram mass grouped by individual mess facility ID.',
    concept: 'GROUP BY aggregation with SUM()'
  },
  {
    id: 7,
    title: 'Average Attendance by Campus',
    category: 'Intermediate',
    sql: "SELECT campus_id, AVG(actual_attendance) as avg_att FROM daily_operations GROUP BY campus_id",
    description: 'Calculates the mean student dining attendance across North, South, and Tech Park campuses.',
    concept: 'Multi-campus GROUP BY with AVG() calculation'
  },
  {
    id: 8,
    title: 'Waste Mass by Food Category',
    category: 'Intermediate',
    sql: "SELECT category, SUM(waste_kg) as vol FROM waste_logs JOIN food_items ON waste_logs.item_id = food_items.id GROUP BY category",
    description: 'Relates waste logs to food items catalog to determine which food category loses the most mass.',
    concept: 'Equi-JOIN across primary/foreign key with aggregation'
  },
  {
    id: 9,
    title: 'Financial Loss Reasons Breakdown',
    category: 'Intermediate',
    sql: "SELECT reason, SUM(financial_loss) as loss FROM waste_logs GROUP BY reason",
    description: 'Quantifies cumulative rupees lost grouped by root cause (Over-prep, Cold Storage, etc.).',
    concept: 'Financial roll-up by categorical reason classification'
  },
  {
    id: 10,
    title: 'Audit Recent Waste (2026-10-07)',
    category: 'Intermediate',
    sql: "SELECT w.date, f.name, w.waste_kg FROM waste_logs w JOIN facilities f ON w.facility_id = f.id WHERE w.date = '2026-10-07'",
    description: 'Performs an audit join for a specific operational date to match kilograms with human-readable facility names.',
    concept: 'Two-table inner join with date predicate filtering'
  },

  // Advanced (Subqueries & Analytics)
  {
    id: 11,
    title: 'Vendor Waste Source Analysis',
    category: 'Advanced',
    sql: "SELECT v.vendor_name, SUM(w.waste_kg) FROM waste_logs w JOIN food_items fi ON w.item_id = fi.id JOIN vendors v ON fi.vendor_id = v.id GROUP BY v.vendor_name",
    description: 'Multi-hop join tracing waste logs back through food items to the original supply vendor.',
    concept: '3-table relational chain JOIN with vendor group roll-up'
  },
  {
    id: 12,
    title: 'Daily Attendance vs Waste Correlation',
    category: 'Advanced',
    sql: "SELECT o.date, o.actual_attendance, SUM(w.waste_kg) FROM daily_operations o JOIN waste_logs w ON o.id = w.operation_id GROUP BY o.date, o.actual_attendance",
    description: 'Joins operational attendance registers with aggregated food discard mass per service date.',
    concept: 'Multi-column composite GROUP BY with operational parent key'
  },
  {
    id: 13,
    title: 'Cross-Campus Financial Loss Comparison',
    category: 'Advanced',
    sql: "SELECT c.campus_name, SUM(w.financial_loss) FROM waste_logs w JOIN facilities f ON w.facility_id = f.id JOIN campuses c ON f.campus_id = c.id GROUP BY c.campus_name",
    description: 'Hierarchical aggregation from waste log line items up to campus administrative entities.',
    concept: 'Multi-tier relational roll-up across 3 normalization boundaries'
  },
  {
    id: 14,
    title: 'Facilities with Above Average Waste',
    category: 'Advanced',
    sql: "SELECT facility_id, AVG(waste_kg) as avg_waste FROM waste_logs GROUP BY facility_id HAVING AVG(waste_kg) > 50",
    description: 'Identifies chronic high-waste facilities whose mean discard volume surpasses 50 kg.',
    concept: 'HAVING clause post-aggregation predicate filter'
  },
  {
    id: 15,
    title: 'Critical Attendance Drop (< 80% Expected)',
    category: 'Advanced',
    sql: "SELECT date, expected, actual_attendance FROM daily_operations WHERE actual_attendance < (expected * 0.8)",
    description: 'Flags days where actual student dining headcount fell below 80% of projected turn-out.',
    concept: 'Calculated relational expression in WHERE predicate'
  },

  // Expert (Presentation Showstoppers)
  {
    id: 16,
    title: 'Highest Waste Facility (Correlated Subquery)',
    category: 'Expert',
    sql: "SELECT f.name, (SELECT SUM(waste_kg) FROM waste_logs w WHERE w.facility_id = f.id) as total_waste FROM facilities f ORDER BY total_waste DESC",
    description: 'Computes facility rankings using a correlated scalar subquery directly in the projection list.',
    concept: 'Correlated scalar subquery in SELECT projection with ORDER BY'
  },
  {
    id: 17,
    title: 'Top 3 Most Wasted Food Items',
    category: 'Expert',
    sql: "SELECT item_id, SUM(waste_kg) as total FROM waste_logs GROUP BY item_id ORDER BY total DESC LIMIT 3",
    description: 'Determines the top 3 highest wasted items across all campus messes ordered descending.',
    concept: 'GROUP BY aggregation with ORDER BY alias and LIMIT clause'
  },
  {
    id: 18,
    title: 'Total Cumulative Semester Financial Loss',
    category: 'Expert',
    sql: "SELECT SUM(financial_loss) as total_semester_loss FROM waste_logs",
    description: 'Global executive financial metric computing cumulative money lost across all campuses.',
    concept: 'Table-wide scalar SUM() aggregation'
  },
  {
    id: 19,
    title: 'Facilities with Zero Waste on Date',
    category: 'Expert',
    sql: "SELECT name FROM facilities WHERE id NOT IN (SELECT facility_id FROM waste_logs WHERE date = '2026-10-08')",
    description: 'Finds spotless mess facilities that recorded zero wasted food on 2026-10-08.',
    concept: 'Anti-semi join pattern using NOT IN subquery'
  },
  {
    id: 20,
    title: 'Cost per Student Waste Metric',
    category: 'Expert',
    sql: "SELECT o.date, (SUM(w.financial_loss) / o.actual_attendance) as loss_per_student FROM daily_operations o JOIN waste_logs w ON o.id = w.operation_id GROUP BY o.date, o.actual_attendance",
    description: 'Calculates the normalized financial loss per dining student per operational meal service.',
    concept: 'Composite joined ratio metric dividing aggregate SUM by grouped integer'
  }
];

export const SqlWorkbenchView: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<number>(1);
  const [sqlQuery, setSqlQuery] = useState<string>(PRESENTATION_QUERIES[0].sql);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(1.2);
  const [copied, setCopied] = useState<boolean>(false);
  const [executedAt, setExecutedAt] = useState<string>('');
  const [showSchemaDrawer, setShowSchemaDrawer] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize AlaSQL in-memory database tables with expanded mock dataset
  const initAlaSqlTables = () => {
    try {
      alasql('DROP TABLE IF EXISTS campuses');
      alasql('DROP TABLE IF EXISTS facilities');
      alasql('DROP TABLE IF EXISTS food_items');
      alasql('DROP TABLE IF EXISTS vendors');
      alasql('DROP TABLE IF EXISTS users');
      alasql('DROP TABLE IF EXISTS waste_logs');
      alasql('DROP TABLE IF EXISTS daily_operations');

      alasql('CREATE TABLE campuses');
      alasql.tables.campuses.data = INITIAL_CAMPUSES;

      alasql('CREATE TABLE facilities');
      alasql.tables.facilities.data = INITIAL_FACILITIES;

      alasql('CREATE TABLE food_items');
      alasql.tables.food_items.data = INITIAL_FOOD_ITEMS;

      alasql('CREATE TABLE vendors');
      alasql.tables.vendors.data = INITIAL_VENDORS;

      alasql('CREATE TABLE users');
      alasql.tables.users.data = INITIAL_USERS;

      alasql('CREATE TABLE waste_logs');
      alasql.tables.waste_logs.data = INITIAL_WASTE_LOGS;

      alasql('CREATE TABLE daily_operations');
      alasql.tables.daily_operations.data = INITIAL_DAILY_OPERATIONS;
    } catch (err: any) {
      console.error('Failed to initialize AlaSQL tables:', err);
    }
  };

  // Preprocessor to ensure AlaSQL compatibility (e.g., quotes reserved keyword `total`)
  const sanitizeForAlaSql = (rawSql: string): string => {
    return rawSql
      .replace(/\bas\s+total\b/gi, 'AS [total]')
      .replace(/\border\s+by\s+total\b/gi, 'ORDER BY [total]');
  };

  // Execute query in AlaSQL with robust try/catch error trapping
  const executeQuery = (queryTextToRun?: string) => {
    const rawSql = queryTextToRun !== undefined ? queryTextToRun : sqlQuery;
    if (!rawSql.trim()) {
      setError('Query is empty. Please enter a valid SQL query.');
      setResults([]);
      return;
    }

    const startTime = performance.now();
    try {
      setError(null);
      const sanitized = sanitizeForAlaSql(rawSql.trim());
      const res = alasql(sanitized);

      const endTime = performance.now();
      const elapsed = Math.max(0.1, Number((endTime - startTime).toFixed(2)));
      setExecutionTimeMs(elapsed);
      setExecutedAt(new Date().toLocaleTimeString());

      if (Array.isArray(res)) {
        setResults(res);
      } else if (typeof res === 'object' && res !== null) {
        setResults([res]);
      } else {
        setResults([{ result: res }]);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setExecutionTimeMs(Number((endTime - startTime).toFixed(2)));
      setExecutedAt(new Date().toLocaleTimeString());
      setError(err?.message || 'SQL execution failed. Please verify syntax.');
      setResults([]);
    }
  };

  // On mount: initialize tables and execute the default preset query
  useEffect(() => {
    initAlaSqlTables();
    executeQuery(PRESENTATION_QUERIES[0].sql);
  }, []);

  // Filtered preset queries
  const filteredPresets = useMemo(() => {
    return PRESENTATION_QUERIES.filter(q => {
      const matchesCategory = activeCategory === 'All' || q.category === activeCategory;
      const matchesSearch = 
        q.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        q.sql.toLowerCase().includes(searchFilter.toLowerCase()) ||
        q.concept.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchFilter]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: SqlPreset) => {
    setSelectedPresetId(preset.id);
    setSqlQuery(preset.sql);
    executeQuery(preset.sql);
  };

  // Copy query to clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to execute
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  };

  // Export Results to CSV
  const exportToCsv = () => {
    if (!results || results.length === 0) return;
    const headers = Object.keys(results[0]);
    const csvRows = [
      headers.join(','),
      ...results.map(row => 
        headers.map(field => {
          const val = row[field] === null || row[field] === undefined ? '' : String(row[field]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfwis_query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Results to JSON
  const exportToJson = () => {
    if (!results || results.length === 0) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfwis_query_result_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Column keys for table
  const resultColumns = useMemo(() => {
    if (!results || results.length === 0) return [];
    return Object.keys(results[0]);
  }, [results]);

  const activePreset = PRESENTATION_QUERIES.find(p => p.id === selectedPresetId);

  return (
    <div className="space-y-6">
      {/* 3D Spatial Banner Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-7 border border-white/10 bg-gradient-to-r from-[var(--color-carbon-plate)] via-[#121c24] to-[var(--color-carbon-plate)] backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(112,220,211,0.12),transparent_65%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#70dcd3]/15 text-[#70dcd3] border border-[#70dcd3]/30 shadow-inner">
                <Terminal className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                SQL Workbench &amp; Query Engine
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#70dcd3]/15 text-[#70dcd3] border border-[#70dcd3]/30">
                  AlaSQL In-Browser Engine
                </span>
              </h1>
            </div>
            <p className="text-sm text-[var(--color-graphite)] max-w-3xl leading-relaxed">
              Write, edit, and execute arbitrary SQL queries directly against our normalized college campus food waste dataset. Includes 20 curated presentation presets categorized across 4 relational difficulty levels.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                initAlaSqlTables();
                executeQuery();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-[var(--color-graphite)] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Reload all mock JSON tables into AlaSQL memory"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset DB Tables
            </button>
            <button
              onClick={() => setShowSchemaDrawer(!showSchemaDrawer)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                showSchemaDrawer 
                  ? 'bg-[#70dcd3]/20 text-[#70dcd3] border border-[#70dcd3]/40' 
                  : 'bg-white/5 hover:bg-white/10 text-[var(--color-graphite)] hover:text-white border border-white/10'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Table Schemas
            </button>
          </div>
        </div>

        {/* Quick Schema Reference Accordion */}
        {showSchemaDrawer && (
          <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <div className="font-mono font-semibold text-[#70dcd3] flex items-center gap-1.5 mb-1.5">
                <TableIcon className="w-3.5 h-3.5" /> facilities (10 rows)
              </div>
              <p className="text-[11px] font-mono text-[var(--color-graphite)] leading-tight">
                id, name, campus_id, dining_capacity, operating_status, status, facility_type
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <div className="font-mono font-semibold text-[#70dcd3] flex items-center gap-1.5 mb-1.5">
                <TableIcon className="w-3.5 h-3.5" /> food_items (32 rows)
              </div>
              <p className="text-[11px] font-mono text-[var(--color-graphite)] leading-tight">
                id, item_name, category, unit_cost, vendor_id, standard_unit, shelf_life_hours
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <div className="font-mono font-semibold text-[#70dcd3] flex items-center gap-1.5 mb-1.5">
                <TableIcon className="w-3.5 h-3.5" /> waste_logs (37 rows)
              </div>
              <p className="text-[11px] font-mono text-[var(--color-graphite)] leading-tight">
                id, operation_id, date, facility_id, item_id, waste_kg, financial_loss, reason, category
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <div className="font-mono font-semibold text-[#70dcd3] flex items-center gap-1.5 mb-1.5">
                <TableIcon className="w-3.5 h-3.5" /> daily_operations (26 rows)
              </div>
              <p className="text-[11px] font-mono text-[var(--color-graphite)] leading-tight">
                id, date, campus_id, facility_id, expected, actual_attendance, meal_period, total_waste_kg
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <div className="font-mono font-semibold text-[#a6e5f2] flex items-center gap-1.5 mb-1.5">
                <TableIcon className="w-3.5 h-3.5" /> campuses (3 rows)
              </div>
              <p className="text-[11px] font-mono text-[var(--color-graphite)] leading-tight">
                id, campus_name, campus_code, name, city, state, lat, lng
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <div className="font-mono font-semibold text-[#a6e5f2] flex items-center gap-1.5 mb-1.5">
                <TableIcon className="w-3.5 h-3.5" /> vendors (8 rows)
              </div>
              <p className="text-[11px] font-mono text-[var(--color-graphite)] leading-tight">
                id, vendor_name, vendor_code, campus_id, compliance_rating, contact_person
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 sm:col-span-2">
              <div className="font-mono font-semibold text-[#a6e5f2] flex items-center gap-1.5 mb-1.5">
                <TableIcon className="w-3.5 h-3.5" /> users (8 accounts)
              </div>
              <p className="text-[11px] font-mono text-[var(--color-graphite)] leading-tight">
                id, name, full_name, role, email, username, campus_id (includes manager@college.edu)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Presentation Presets Sidebar (4 cols on lg, 5 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="rounded-2xl p-4 sm:p-5 border border-white/10 bg-[var(--color-carbon-plate)]/90 backdrop-blur-xl shadow-xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                  <span>Presentation Presets</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#70dcd3]/20 text-[#70dcd3] border border-[#70dcd3]/30">
                    20 Queries
                  </span>
                </h2>
                <p className="text-xs text-[var(--color-graphite)]">
                  Click any query to populate and run
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-graphite)]" />
              <input
                type="text"
                placeholder="Search presets or SQL keywords..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-[var(--color-cinder)] focus:outline-none focus:border-[#70dcd3]/60 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {(['All', 'Basic', 'Intermediate', 'Advanced', 'Expert'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#70dcd3] text-black font-semibold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-[var(--color-graphite)] hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets List */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredPresets.map(preset => {
                const isSelected = selectedPresetId === preset.id;
                
                const badgeColor = 
                  preset.category === 'Basic' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  preset.category === 'Intermediate' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                  preset.category === 'Advanced' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/40';

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#182830] border-[#70dcd3]/70 shadow-lg shadow-[#70dcd3]/5'
                        : 'bg-black/30 hover:bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {/* Top specular highlight for 3D realism */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--color-graphite)] group-hover:text-white transition-colors">
                          #{String(preset.id).padStart(2, '0')}
                        </span>
                        <h3 className="text-xs font-semibold text-white group-hover:text-[#70dcd3] transition-colors leading-snug">
                          {preset.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0 ${badgeColor}`}>
                        {preset.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--color-graphite)] line-clamp-1 mb-2">
                      {preset.description}
                    </p>

                    <div className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-gray-300 truncate">
                      <code>{preset.sql}</code>
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#70dcd3]">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Loaded in Editor
                        </span>
                        <span className="text-[10px] text-[var(--color-graphite)]">
                          {preset.concept}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPresets.length === 0 && (
                <div className="p-6 text-center text-xs text-[var(--color-graphite)]">
                  No preset queries match &quot;{searchFilter}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor + Execute + Results Table (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          
          {/* SQL Editor Container */}
          <div className="rounded-2xl border border-white/10 bg-[var(--color-carbon-plate)]/90 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Editor Top Bar */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-medium text-white">
                  Query Console
                </span>
                {activePreset && (
                  <span className="text-[11px] font-mono text-[var(--color-graphite)] hidden sm:inline">
                    &bull; Preset #{activePreset.id} ({activePreset.category})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--color-graphite)] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy SQL code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setSqlQuery('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--color-graphite)] hover:text-red-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                  title="Clear SQL Editor"
                >
                  Clear
                </button>

                <button
                  onClick={() => executeQuery()}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-black bg-gradient-to-r from-[#70dcd3] to-[#5ec9c0] hover:brightness-110 border border-[#70dcd3] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Query</span>
                  <span className="opacity-60 text-[10px] hidden md:inline">(Ctrl+Enter)</span>
                </button>
              </div>
            </div>

            {/* Styled Code Area (Textarea with Monospace Font and Inset Shadow) */}
            <div className="relative p-4 sm:p-5 bg-[#0a0f14]">
              <textarea
                ref={textareaRef}
                value={sqlQuery}
                onChange={e => setSqlQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={5}
                placeholder="-- Write any custom SQL query here (e.g., SELECT * FROM facilities WHERE dining_capacity > 500)&#10;SELECT * FROM facilities;"
                spellCheck={false}
                className="w-full font-mono text-sm leading-relaxed text-[#cbf3f0] placeholder-[var(--color-cinder)] bg-transparent resize-y focus:outline-none focus:ring-0 border-0 p-0 selection:bg-[#70dcd3]/30"
                style={{
                  minHeight: '120px',
                  tabSize: 2
                }}
              />

              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--color-graphite)]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#70dcd3]" />
                  Direct AlaSQL compilation &bull; Full CRUD, JOIN, SUBQUERY &amp; AGGREGATE support
                </span>
                <span>
                  Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">Ctrl + Enter</kbd> to run
                </span>
              </div>
            </div>
          </div>

          {/* Syntax Error Box (High Contrast Red / Crimson Alert) */}
          {error && (
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/40 backdrop-blur-md shadow-lg flex items-start gap-3 text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-xs text-red-300 font-mono">
                  SQL Execution Error
                </div>
                <div className="text-xs font-mono text-red-200/90 break-all">
                  {error}
                </div>
                <p className="text-[11px] text-red-300/70 pt-1">
                  Ensure table and column names exist in the schema (e.g. <code className="bg-red-900/50 px-1 py-0.5 rounded">facilities</code>, <code className="bg-red-900/50 px-1 py-0.5 rounded">food_items</code>, <code className="bg-red-900/50 px-1 py-0.5 rounded">waste_logs</code>).
                </p>
              </div>
            </div>
          )}

          {/* Execution Metrics Bar */}
          {!error && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md font-mono text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>200 OK</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-graphite)]">
                  <Clock className="w-3.5 h-3.5 text-[#70dcd3]" />
                  <span>{executionTimeMs} ms</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-graphite)]">
                  <Database className="w-3.5 h-3.5 text-[#70dcd3]" />
                  <span className="text-white font-medium">{results.length} rows</span>
                </div>
                {executedAt && (
                  <span className="text-[var(--color-cinder)] hidden sm:inline">
                    at {executedAt}
                  </span>
                )}
              </div>

              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportToCsv}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[var(--color-graphite)] hover:text-white border border-white/10 text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> CSV
                  </button>
                  <button
                    onClick={exportToJson}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[var(--color-graphite)] hover:text-white border border-white/10 text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> JSON
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Grid Table with 3D Spatial Glassmorphism Styling */}
          <div className="rounded-2xl border border-white/10 bg-[var(--color-carbon-plate)]/90 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="px-5 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#70dcd3]" />
                <span className="text-xs font-mono font-semibold text-white tracking-wider uppercase">
                  Query Results Grid
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--color-graphite)]">
                {results.length} record{results.length === 1 ? '' : 's'} displayed
              </span>
            </div>

            {/* Results Table Scroll Canvas */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              {results.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#121c24]/90 sticky top-0 z-10 backdrop-blur-md border-b border-white/10 text-[11px] font-mono text-[#70dcd3]">
                    <tr>
                      <th className="py-2.5 px-4 font-bold border-r border-white/5 w-12 text-center text-[var(--color-graphite)]">
                        #
                      </th>
                      {resultColumns.map(col => (
                        <th 
                          key={col} 
                          className="py-2.5 px-4 font-bold border-r border-white/5 last:border-r-0 whitespace-nowrap tracking-wide"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {results.map((row, rowIdx) => (
                      <tr 
                        key={rowIdx} 
                        className={`transition-colors hover:bg-white/5 ${
                          rowIdx % 2 === 0 ? 'bg-black/20' : 'bg-transparent'
                        }`}
                      >
                        <td className="py-2 px-4 text-center text-[var(--color-cinder)] border-r border-white/5">
                          {rowIdx + 1}
                        </td>
                        {resultColumns.map(col => {
                          const val = row[col];
                          const isNumber = typeof val === 'number';
                          const isBoolean = typeof val === 'boolean';
                          const displayVal = 
                            val === null || val === undefined ? (
                              <span className="text-[var(--color-cinder)] italic">NULL</span>
                            ) : isBoolean ? (
                              <span className={val ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {String(val)}
                              </span>
                            ) : isNumber ? (
                              <span className="text-[#a6e5f2]">
                                {Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-200">
                                {String(val)}
                              </span>
                            );

                          return (
                            <td 
                              key={col} 
                              className={`py-2 px-4 border-r border-white/5 last:border-r-0 whitespace-nowrap ${
                                isNumber ? 'text-right' : ''
                              }`}
                            >
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-16 px-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[var(--color-graphite)]">
                    <TableIcon className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-white">
                    {error ? 'Execution encountered errors' : 'No records returned'}
                  </div>
                  <p className="text-xs text-[var(--color-graphite)] max-w-sm mx-auto">
                    {error 
                      ? 'Review the error message above and verify table or column names.' 
                      : 'The query executed successfully, but 0 rows matched the specified WHERE criteria.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Academic Presentation Notes & BCNF Justification */}
          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md space-y-2 text-xs">
            <div className="flex items-center gap-2 font-mono font-bold text-white">
              <FileText className="w-4 h-4 text-[#70dcd3]" />
              <span>College DBMS Presentation Note:</span>
            </div>
            <p className="text-[var(--color-graphite)] leading-relaxed">
              This interactive workbench compiles real ANSI-SQL statements in-memory using the AlaSQL database engine. The schema mirrors Boyce-Codd Normal Form (BCNF) specifications, ensuring zero transitive functional dependencies across <code className="text-white">facilities</code>, <code className="text-white">waste_logs</code>, and <code className="text-white">daily_operations</code>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
