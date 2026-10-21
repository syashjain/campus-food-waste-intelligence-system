import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Database, ZoomIn, ZoomOut, Maximize2, Search, Filter, 
  Layers, Link2, Key, ShieldCheck, ChevronRight, Table, Info
} from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';
import { useTheme } from '../context/ThemeContext';

export interface ColumnDef {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: { table: string; column: string };
  nullable?: boolean;
}

export interface TableNodeDef extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  displayName: string;
  domain: 'tenancy' | 'kitchen' | 'waste' | 'procurement' | 'governance';
  description: string;
  rowCount: number;
  columns: ColumnDef[];
  indexes: string[];
  pk: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface RelationshipLinkDef extends d3.SimulationLinkDatum<TableNodeDef> {
  source: string | TableNodeDef;
  target: string | TableNodeDef;
  sourceCol: string;
  targetCol: string;
  cardinality: '1:N' | '1:1' | 'N:M';
  description: string;
}

const DOMAINS = [
  { id: 'all', label: 'All Tables', color: '#0092e4' },
  { id: 'tenancy', label: 'Tenancy & Master', color: '#70dcd3' },
  { id: 'kitchen', label: 'Kitchen & Menus', color: '#38bdf8' },
  { id: 'waste', label: 'Waste & Recovery', color: '#f43f5e' },
  { id: 'procurement', label: 'Procurement', color: '#f59e0b' },
  { id: 'governance', label: 'Audit & Roles', color: '#a855f7' }
];

export const SchemaDiagramVisualizer: React.FC = () => {
  const { state } = useRelationalDatabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [selectedTableId, setSelectedTableId] = useState<string | null>('food_waste');
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showColumns, setShowColumns] = useState<boolean>(true);

  // Schema Definitions synced with actual store entities
  const tablesData: TableNodeDef[] = useMemo(() => [
    {
      id: 'campus',
      name: 'campus',
      displayName: 'campus',
      domain: 'tenancy',
      description: 'Top-level educational institution multi-tenant partition root.',
      rowCount: state.campuses.length,
      pk: ['campus_id'],
      indexes: ['idx_campus_code_uq (B-Tree)', 'idx_campus_geom (PostGIS GiST)'],
      columns: [
        { name: 'campus_id', type: 'UUID', isPk: true },
        { name: 'campus_code', type: 'VARCHAR(20)' },
        { name: 'name', type: 'VARCHAR(120)' },
        { name: 'city', type: 'VARCHAR(60)' },
        { name: 'state', type: 'VARCHAR(60)' },
        { name: 'lat', type: 'NUMERIC(10,7)' },
        { name: 'lng', type: 'NUMERIC(10,7)' },
        { name: 'is_active', type: 'BOOLEAN' }
      ]
    },
    {
      id: 'facility',
      name: 'facility',
      displayName: 'facility',
      domain: 'tenancy',
      description: 'Physical dining halls, central mess kitchens, and hostels.',
      rowCount: state.facilities.length,
      pk: ['facility_id'],
      indexes: ['idx_facility_campus_fk (B-Tree)', 'idx_facility_geom (PostGIS GiST)'],
      columns: [
        { name: 'facility_id', type: 'UUID', isPk: true },
        { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: { table: 'campus', column: 'campus_id' } },
        { name: 'facility_code', type: 'VARCHAR(30)' },
        { name: 'facility_name', type: 'VARCHAR(100)' },
        { name: 'facility_type', type: 'VARCHAR(40)' },
        { name: 'dining_capacity', type: 'INT4' },
        { name: 'operating_status', type: 'VARCHAR(20)' }
      ]
    },
    {
      id: 'food_pantry_partner',
      name: 'food_pantry_partner',
      displayName: 'food_pantry_partner',
      domain: 'waste',
      description: 'External NGOs & food rescue agencies within spatial rescue radius.',
      rowCount: state.pantryPartners.length,
      pk: ['pantry_id'],
      indexes: ['idx_pantry_campus_fk (B-Tree)', 'idx_pantry_spatial_pt (PostGIS GiST)'],
      columns: [
        { name: 'pantry_id', type: 'UUID', isPk: true },
        { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: { table: 'campus', column: 'campus_id' } },
        { name: 'partner_name', type: 'VARCHAR(120)' },
        { name: 'storage_capacity_kg', type: 'NUMERIC(10,2)' },
        { name: 'lat', type: 'NUMERIC(10,7)' },
        { name: 'lng', type: 'NUMERIC(10,7)' },
        { name: 'is_active', type: 'BOOLEAN' }
      ]
    },
    {
      id: 'role',
      name: 'role',
      displayName: 'role',
      domain: 'governance',
      description: 'System roles for Role-Based Access Control (RBAC).',
      rowCount: state.roles.length,
      pk: ['role_id'],
      indexes: ['idx_role_code_uq (B-Tree)'],
      columns: [
        { name: 'role_id', type: 'INT4', isPk: true },
        { name: 'role_code', type: 'VARCHAR(30)' },
        { name: 'role_name', type: 'VARCHAR(80)' },
        { name: 'description', type: 'TEXT' }
      ]
    },
    {
      id: 'user_account',
      name: 'user_account',
      displayName: 'user_account',
      domain: 'governance',
      description: 'Authenticated operators, kitchen staff, mess managers, and admins.',
      rowCount: state.users.length,
      pk: ['user_id'],
      indexes: ['idx_user_email_uq (B-Tree)', 'idx_user_campus_role (Composite)'],
      columns: [
        { name: 'user_id', type: 'UUID', isPk: true },
        { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: { table: 'campus', column: 'campus_id' } },
        { name: 'facility_id', type: 'UUID', isFk: true, nullable: true, fkTarget: { table: 'facility', column: 'facility_id' } },
        { name: 'role_id', type: 'INT4', isFk: true, fkTarget: { table: 'role', column: 'role_id' } },
        { name: 'username', type: 'VARCHAR(60)' },
        { name: 'email', type: 'VARCHAR(120)' },
        { name: 'full_name', type: 'VARCHAR(100)' },
        { name: 'is_active', type: 'BOOLEAN' }
      ]
    },
    {
      id: 'food_category',
      name: 'food_category',
      displayName: 'food_category',
      domain: 'kitchen',
      description: 'Taxonomy classification for menu ingredients and consumables.',
      rowCount: state.foodCategories.length,
      pk: ['category_id'],
      indexes: ['idx_category_code_uq (B-Tree)'],
      columns: [
        { name: 'category_id', type: 'UUID', isPk: true },
        { name: 'category_code', type: 'VARCHAR(30)' },
        { name: 'category_name', type: 'VARCHAR(80)' },
        { name: 'is_active', type: 'BOOLEAN' }
      ]
    },
    {
      id: 'food_item',
      name: 'food_item',
      displayName: 'food_item',
      domain: 'kitchen',
      description: 'Master raw and processed inventory food catalog.',
      rowCount: state.foodItems.length,
      pk: ['item_id'],
      indexes: ['idx_item_category_fk (B-Tree)', 'idx_item_perishable (BRIN)'],
      columns: [
        { name: 'item_id', type: 'UUID', isPk: true },
        { name: 'category_id', type: 'UUID', isFk: true, fkTarget: { table: 'food_category', column: 'category_id' } },
        { name: 'item_code', type: 'VARCHAR(30)' },
        { name: 'item_name', type: 'VARCHAR(120)' },
        { name: 'standard_unit', type: 'VARCHAR(20)' },
        { name: 'standard_unit_cost', type: 'NUMERIC(10,2)' },
        { name: 'shelf_life_hours', type: 'INT4' },
        { name: 'is_perishable', type: 'BOOLEAN' }
      ]
    },
    {
      id: 'meal',
      name: 'meal',
      displayName: 'meal',
      domain: 'kitchen',
      description: 'Canonical daily meal periods (Breakfast, Lunch, Snacks, Dinner).',
      rowCount: state.meals.length,
      pk: ['meal_id'],
      indexes: ['idx_meal_code_uq (B-Tree)'],
      columns: [
        { name: 'meal_id', type: 'INT4', isPk: true },
        { name: 'meal_code', type: 'VARCHAR(30)' },
        { name: 'meal_name', type: 'VARCHAR(60)' },
        { name: 'typical_start_time', type: 'TIME' },
        { name: 'typical_end_time', type: 'TIME' }
      ]
    },
    {
      id: 'menu',
      name: 'menu',
      displayName: 'menu',
      domain: 'kitchen',
      description: 'Planned meal roster with expected attendance headcounts.',
      rowCount: state.menus.length,
      pk: ['menu_id'],
      indexes: ['idx_menu_facility_date (Composite B-Tree)'],
      columns: [
        { name: 'menu_id', type: 'UUID', isPk: true },
        { name: 'facility_id', type: 'UUID', isFk: true, fkTarget: { table: 'facility', column: 'facility_id' } },
        { name: 'meal_id', type: 'INT4', isFk: true, fkTarget: { table: 'meal', column: 'meal_id' } },
        { name: 'menu_date', type: 'DATE' },
        { name: 'expected_attendance', type: 'INT4' },
        { name: 'is_active', type: 'BOOLEAN' }
      ]
    },
    {
      id: 'menu_item',
      name: 'menu_item',
      displayName: 'menu_item',
      domain: 'kitchen',
      description: 'Portion specifications and planned batch weights per menu.',
      rowCount: state.menuItems.length,
      pk: ['menu_item_id'],
      indexes: ['idx_menu_item_menu_fk (B-Tree)', 'idx_menu_item_item_fk (B-Tree)'],
      columns: [
        { name: 'menu_item_id', type: 'UUID', isPk: true },
        { name: 'menu_id', type: 'UUID', isFk: true, fkTarget: { table: 'menu', column: 'menu_id' } },
        { name: 'item_id', type: 'UUID', isFk: true, fkTarget: { table: 'food_item', column: 'item_id' } },
        { name: 'planned_quantity', type: 'NUMERIC(10,2)' },
        { name: 'portion_size_grams', type: 'NUMERIC(8,2)' }
      ]
    },
    {
      id: 'food_preparation',
      name: 'food_preparation',
      displayName: 'food_preparation',
      domain: 'kitchen',
      description: 'Batch production logs in kitchen verifying prepared kg volumes.',
      rowCount: state.preparations.length,
      pk: ['prep_id'],
      indexes: ['idx_prep_date_facility (BRIN / Composite)', 'idx_prep_batch_no (B-Tree)'],
      columns: [
        { name: 'prep_id', type: 'UUID', isPk: true },
        { name: 'facility_id', type: 'UUID', isFk: true, fkTarget: { table: 'facility', column: 'facility_id' } },
        { name: 'menu_id', type: 'UUID', isFk: true, fkTarget: { table: 'menu', column: 'menu_id' } },
        { name: 'item_id', type: 'UUID', isFk: true, fkTarget: { table: 'food_item', column: 'item_id' } },
        { name: 'meal_id', type: 'INT4', isFk: true, fkTarget: { table: 'meal', column: 'meal_id' } },
        { name: 'prep_date', type: 'DATE' },
        { name: 'prepared_quantity', type: 'NUMERIC(10,2)' },
        { name: 'batch_number', type: 'VARCHAR(40)' }
      ]
    },
    {
      id: 'food_consumption',
      name: 'food_consumption',
      displayName: 'food_consumption',
      domain: 'kitchen',
      description: 'Scale-verified consumed batch weights strictly enforced by triggers.',
      rowCount: state.consumptions.length,
      pk: ['consumption_id'],
      indexes: ['idx_consumption_prep_fk (B-Tree)'],
      columns: [
        { name: 'consumption_id', type: 'UUID', isPk: true },
        { name: 'prep_id', type: 'UUID', isFk: true, fkTarget: { table: 'food_preparation', column: 'prep_id' } },
        { name: 'consumed_quantity', type: 'NUMERIC(10,2)' },
        { name: 'measurement_type', type: 'VARCHAR(30)' },
        { name: 'recorded_at', type: 'TIMESTAMPTZ' }
      ]
    },
    {
      id: 'waste_reason',
      name: 'waste_reason',
      displayName: 'waste_reason',
      domain: 'waste',
      description: 'Classification taxonomy for avoidable vs unavoidable food waste.',
      rowCount: state.wasteReasons.length,
      pk: ['reason_id'],
      indexes: ['idx_reason_code_uq (B-Tree)'],
      columns: [
        { name: 'reason_id', type: 'INT4', isPk: true },
        { name: 'reason_code', type: 'VARCHAR(30)' },
        { name: 'reason_name', type: 'VARCHAR(80)' },
        { name: 'category', type: 'VARCHAR(50)' },
        { name: 'is_preventable', type: 'BOOLEAN' }
      ]
    },
    {
      id: 'disposal_method',
      name: 'disposal_method',
      displayName: 'disposal_method',
      domain: 'waste',
      description: 'Circular economy pathways: Donation, Composting, Biogas, Landfill.',
      rowCount: state.disposalMethods.length,
      pk: ['method_id'],
      indexes: ['idx_disposal_code_uq (B-Tree)'],
      columns: [
        { name: 'method_id', type: 'INT4', isPk: true },
        { name: 'method_code', type: 'VARCHAR(30)' },
        { name: 'method_name', type: 'VARCHAR(80)' },
        { name: 'environmental_score', type: 'INT4' },
        { name: 'carbon_offset_factor', type: 'NUMERIC(6,3)' }
      ]
    },
    {
      id: 'food_waste',
      name: 'food_waste',
      displayName: 'food_waste',
      domain: 'waste',
      description: 'Core telemetry ledger capturing granular loss metrics with financial cost snapshots.',
      rowCount: state.wastes.length,
      pk: ['waste_id'],
      indexes: ['idx_waste_date_facility (BRIN Partitioned)', 'idx_waste_reason_fk (B-Tree)'],
      columns: [
        { name: 'waste_id', type: 'UUID', isPk: true },
        { name: 'prep_id', type: 'UUID', isFk: true, fkTarget: { table: 'food_preparation', column: 'prep_id' } },
        { name: 'facility_id', type: 'UUID', isFk: true, fkTarget: { table: 'facility', column: 'facility_id' } },
        { name: 'item_id', type: 'UUID', isFk: true, fkTarget: { table: 'food_item', column: 'item_id' } },
        { name: 'meal_id', type: 'INT4', isFk: true, fkTarget: { table: 'meal', column: 'meal_id' } },
        { name: 'reason_id', type: 'INT4', isFk: true, fkTarget: { table: 'waste_reason', column: 'reason_id' } },
        { name: 'method_id', type: 'INT4', isFk: true, nullable: true, fkTarget: { table: 'disposal_method', column: 'method_id' } },
        { name: 'pantry_partner_id', type: 'UUID', isFk: true, nullable: true, fkTarget: { table: 'food_pantry_partner', column: 'pantry_id' } },
        { name: 'waste_date', type: 'DATE' },
        { name: 'waste_quantity', type: 'NUMERIC(10,2)' },
        { name: 'unit_cost_snapshot', type: 'NUMERIC(10,2)' },
        { name: 'estimated_waste_cost', type: 'NUMERIC(12,2)' }
      ]
    },
    {
      id: 'vendor',
      name: 'vendor',
      displayName: 'vendor',
      domain: 'procurement',
      description: 'Contracted food suppliers with vendor compliance metrics.',
      rowCount: state.vendors.length,
      pk: ['vendor_id'],
      indexes: ['idx_vendor_campus_fk (B-Tree)', 'idx_vendor_tax_id (B-Tree)'],
      columns: [
        { name: 'vendor_id', type: 'UUID', isPk: true },
        { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: { table: 'campus', column: 'campus_id' } },
        { name: 'vendor_code', type: 'VARCHAR(30)' },
        { name: 'vendor_name', type: 'VARCHAR(120)' },
        { name: 'compliance_rating', type: 'NUMERIC(3,2)' }
      ]
    },
    {
      id: 'purchase',
      name: 'purchase',
      displayName: 'purchase',
      domain: 'procurement',
      description: 'Procurement orders and invoice ledger linked to vendors.',
      rowCount: state.purchases.length,
      pk: ['purchase_id'],
      indexes: ['idx_purchase_vendor_date (Composite)', 'idx_purchase_po_uq (B-Tree)'],
      columns: [
        { name: 'purchase_id', type: 'UUID', isPk: true },
        { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: { table: 'campus', column: 'campus_id' } },
        { name: 'vendor_id', type: 'UUID', isFk: true, fkTarget: { table: 'vendor', column: 'vendor_id' } },
        { name: 'po_number', type: 'VARCHAR(40)' },
        { name: 'purchase_date', type: 'DATE' },
        { name: 'total_amount', type: 'NUMERIC(12,2)' },
        { name: 'status', type: 'VARCHAR(20)' }
      ]
    },
    {
      id: 'purchase_item',
      name: 'purchase_item',
      displayName: 'purchase_item',
      domain: 'procurement',
      description: 'Line item purchase details with batch numbers and unit rates.',
      rowCount: state.purchases.reduce((acc, p) => acc + (p.items?.length || 0), 0),
      pk: ['purchase_item_id'],
      indexes: ['idx_pitem_purchase_fk (B-Tree)', 'idx_pitem_item_fk (B-Tree)'],
      columns: [
        { name: 'purchase_item_id', type: 'UUID', isPk: true },
        { name: 'purchase_id', type: 'UUID', isFk: true, fkTarget: { table: 'purchase', column: 'purchase_id' } },
        { name: 'item_id', type: 'UUID', isFk: true, fkTarget: { table: 'food_item', column: 'item_id' } },
        { name: 'quantity', type: 'NUMERIC(10,2)' },
        { name: 'unit_price', type: 'NUMERIC(10,2)' },
        { name: 'line_total', type: 'NUMERIC(12,2)' }
      ]
    },
    {
      id: 'audit_log',
      name: 'audit_log',
      displayName: 'audit_log',
      domain: 'governance',
      description: 'Immutable append-only write-ahead ledger for all mutation events.',
      rowCount: state.auditLogs.length,
      pk: ['audit_id'],
      indexes: ['idx_audit_executed_at (BRIN)', 'idx_audit_table_op (Composite)'],
      columns: [
        { name: 'audit_id', type: 'INT8', isPk: true },
        { name: 'campus_id', type: 'UUID', isFk: true, nullable: true, fkTarget: { table: 'campus', column: 'campus_id' } },
        { name: 'table_name', type: 'VARCHAR(60)' },
        { name: 'operation_type', type: 'VARCHAR(20)' },
        { name: 'record_pk', type: 'VARCHAR(100)' },
        { name: 'executed_at', type: 'TIMESTAMPTZ' }
      ]
    }
  ], [state]);

  // Derive relationship links from columns with fkTarget
  const linksData: RelationshipLinkDef[] = useMemo(() => {
    const links: RelationshipLinkDef[] = [];
    tablesData.forEach(sourceTable => {
      sourceTable.columns.forEach(col => {
        if (col.isFk && col.fkTarget) {
          const targetExists = tablesData.some(t => t.id === col.fkTarget!.table);
          if (targetExists) {
            links.push({
              source: sourceTable.id,
              target: col.fkTarget.table,
              sourceCol: col.name,
              targetCol: col.fkTarget.column,
              cardinality: col.name === 'prep_id' && sourceTable.id === 'food_consumption' ? '1:1' : '1:N',
              description: `${sourceTable.name}.${col.name} ➔ ${col.fkTarget.table}.${col.fkTarget.column}`
            });
          }
        }
      });
    });
    return links;
  }, [tablesData]);

  // Selected table entity details
  const activeTable = useMemo(() => {
    return tablesData.find(t => t.id === selectedTableId) || tablesData[0];
  }, [selectedTableId, tablesData]);

  // Direct connected tables
  const connectedTableIds = useMemo(() => {
    if (!selectedTableId) return new Set<string>();
    const set = new Set<string>();
    set.add(selectedTableId);
    linksData.forEach(l => {
      const src = typeof l.source === 'object' ? (l.source as TableNodeDef).id : l.source;
      const tgt = typeof l.target === 'object' ? (l.target as TableNodeDef).id : l.target;
      if (src === selectedTableId) set.add(tgt);
      if (tgt === selectedTableId) set.add(src);
    });
    return set;
  }, [selectedTableId, linksData]);

  // Filtered tables based on domain and search
  const visibleTableIds = useMemo(() => {
    return new Set(
      tablesData
        .filter(t => {
          const matchesDomain = selectedDomain === 'all' || t.domain === selectedDomain;
          const matchesSearch = !searchQuery || 
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.columns.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesDomain && matchesSearch;
        })
        .map(t => t.id)
    );
  }, [tablesData, selectedDomain, searchQuery]);

  // D3 Rendering & Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 580;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create Defs for Arrow Markers and Gradients
    const defs = svg.append('defs');

    // Arrowhead marker
    defs.append('marker')
      .attr('id', 'rel-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', isDark ? '#70dcd3' : '#0d9488');

    defs.append('marker')
      .attr('id', 'rel-arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38bdf8');

    // Setup Main Canvas with Pan/Zoom
    const g = svg.append('g').attr('class', 'diagram-canvas');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial Zoom transform centered
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

    // Deep clone data for simulation so D3 mutation doesn't mutate React state
    const nodes: TableNodeDef[] = tablesData.map(d => ({ ...d }));
    const links: RelationshipLinkDef[] = linksData.map(d => ({ ...d }));

    // Force Simulation with tuned balance
    const simulation = d3.forceSimulation<TableNodeDef>(nodes)
      .force('link', d3.forceLink<TableNodeDef, RelationshipLinkDef>(links).id(d => d.id).distance(140).strength(0.35))
      .force('charge', d3.forceManyBody().strength(-420).distanceMax(500))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide<TableNodeDef>().radius(d => (showColumns ? 75 : 55)).iterations(3))
      .alphaDecay(0.028);

    // Links container
    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    // Draw Links
    const link = linkGroup.selectAll<SVGPathElement, RelationshipLinkDef>('path')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'relationship-line')
      .attr('fill', 'none')
      .attr('stroke', d => {
        const srcId = typeof d.source === 'object' ? (d.source as TableNodeDef).id : d.source;
        const tgtId = typeof d.target === 'object' ? (d.target as TableNodeDef).id : d.target;
        if (selectedTableId && (srcId === selectedTableId || tgtId === selectedTableId)) {
          return '#38bdf8';
        }
        return isDark ? '#2e3038' : '#cbd5e1';
      })
      .attr('stroke-width', d => {
        const srcId = typeof d.source === 'object' ? (d.source as TableNodeDef).id : d.source;
        const tgtId = typeof d.target === 'object' ? (d.target as TableNodeDef).id : d.target;
        if (selectedTableId && (srcId === selectedTableId || tgtId === selectedTableId)) return 2.2;
        return 1.2;
      })
      .attr('stroke-dasharray', d => d.cardinality === '1:1' ? '4,4' : 'none')
      .attr('opacity', d => {
        const srcId = typeof d.source === 'object' ? (d.source as TableNodeDef).id : d.source;
        const tgtId = typeof d.target === 'object' ? (d.target as TableNodeDef).id : d.target;
        if (!visibleTableIds.has(srcId as string) || !visibleTableIds.has(tgtId as string)) return 0.08;
        if (selectedTableId && (srcId !== selectedTableId && tgtId !== selectedTableId)) return 0.2;
        return 0.85;
      })
      .attr('marker-end', d => {
        const srcId = typeof d.source === 'object' ? (d.source as TableNodeDef).id : d.source;
        const tgtId = typeof d.target === 'object' ? (d.target as TableNodeDef).id : d.target;
        if (selectedTableId && (srcId === selectedTableId || tgtId === selectedTableId)) {
          return 'url(#rel-arrow-highlight)';
        }
        return 'url(#rel-arrow)';
      });

    // Draw Table Nodes
    const node = nodeGroup.selectAll<SVGGElement, TableNodeDef>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'table-node cursor-pointer')
      .call(
        d3.drag<SVGGElement, TableNodeDef>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Click and Hover Handlers
    node
      .on('click', (_, d) => {
        setSelectedTableId(d.id);
      })
      .on('mouseenter', (_, d) => {
        setHoveredTableId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredTableId(null);
      });

    // Render Table Card Background & Elements
    node.each(function(d) {
      const el = d3.select(this);
      const isSelected = d.id === selectedTableId;
      const isConnected = connectedTableIds.has(d.id);
      const isVisible = visibleTableIds.has(d.id);
      
      const cardWidth = showColumns ? 150 : 130;
      const rowHeight = 14;
      const headerHeight = 26;
      const renderedCols = showColumns ? d.columns.slice(0, 5) : [];
      const cardHeight = headerHeight + (renderedCols.length * rowHeight) + (showColumns && d.columns.length > 5 ? 14 : 6);

      const domainColor = DOMAINS.find(dm => dm.id === d.domain)?.color || '#0092e4';

      // Group opacity for search/filter/focus
      let opacity = 1;
      if (!isVisible) opacity = 0.15;
      else if (selectedTableId && !isConnected) opacity = 0.35;
      el.attr('opacity', opacity);

      // Card Container Rect
      el.append('rect')
        .attr('x', -cardWidth / 2)
        .attr('y', -cardHeight / 2)
        .attr('width', cardWidth)
        .attr('height', cardHeight)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', isDark ? '#0d0e12' : '#ffffff')
        .attr('stroke', isSelected ? '#70dcd3' : isConnected ? domainColor : isDark ? '#2e3038' : '#cbd5e1')
        .attr('stroke-width', isSelected ? 2.5 : isConnected ? 1.8 : 1)
        .attr('filter', isSelected ? 'drop-shadow(0 0 8px rgba(112, 220, 211, 0.35))' : 'none');

      // Table Header Fill
      el.append('rect')
        .attr('x', -cardWidth / 2)
        .attr('y', -cardHeight / 2)
        .attr('width', cardWidth)
        .attr('height', headerHeight)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', isDark ? '#141418' : '#f1f5f9')
        .attr('stroke', 'none');

      // Table Domain Indicator Pip
      el.append('circle')
        .attr('cx', -cardWidth / 2 + 10)
        .attr('cy', -cardHeight / 2 + 13)
        .attr('r', 3.5)
        .attr('fill', domainColor);

      // Table Name Text
      el.append('text')
        .attr('x', -cardWidth / 2 + 20)
        .attr('y', -cardHeight / 2 + 16)
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', isSelected ? (isDark ? '#70dcd3' : '#0d9488') : (isDark ? '#f8fafc' : '#0f172a'))
        .text(d.name.length > 15 ? d.name.substring(0, 14) + '…' : d.name);

      // Row Count Badge Pill
      el.append('text')
        .attr('x', cardWidth / 2 - 8)
        .attr('y', -cardHeight / 2 + 16)
        .attr('text-anchor', 'end')
        .attr('font-size', '8.5px')
        .attr('font-family', 'monospace')
        .attr('fill', isDark ? '#aeaeb7' : '#64748b')
        .text(`${d.rowCount}`);

      // Column rows if showColumns is enabled
      if (showColumns) {
        renderedCols.forEach((col, idx) => {
          const colY = -cardHeight / 2 + headerHeight + 11 + (idx * rowHeight);

          // PK / FK Indicator
          if (col.isPk) {
            el.append('text')
              .attr('x', -cardWidth / 2 + 8)
              .attr('y', colY)
              .attr('font-size', '8px')
              .attr('font-family', 'monospace')
              .attr('font-weight', 'bold')
              .attr('fill', '#f59e0b')
              .text('PK');
          } else if (col.isFk) {
            el.append('text')
              .attr('x', -cardWidth / 2 + 8)
              .attr('y', colY)
              .attr('font-size', '8px')
              .attr('font-family', 'monospace')
              .attr('font-weight', 'bold')
              .attr('fill', '#38bdf8')
              .text('FK');
          }

          // Column Name
          el.append('text')
            .attr('x', -cardWidth / 2 + (col.isPk || col.isFk ? 24 : 10))
            .attr('y', colY)
            .attr('font-size', '8.5px')
            .attr('font-family', 'monospace')
            .attr('fill', col.isPk ? (isDark ? '#f8fafc' : '#0f172a') : (isDark ? '#aeaeb7' : '#475569'))
            .text(col.name.length > 13 ? col.name.substring(0, 12) + '…' : col.name);

          // Column Type
          el.append('text')
            .attr('x', cardWidth / 2 - 8)
            .attr('y', colY)
            .attr('text-anchor', 'end')
            .attr('font-size', '7.5px')
            .attr('font-family', 'monospace')
            .attr('fill', isDark ? '#64748b' : '#94a3b8')
            .text(col.type.replace(/\(.*\)/, ''));
        });

        if (d.columns.length > 5) {
          el.append('text')
            .attr('x', 0)
            .attr('y', -cardHeight / 2 + headerHeight + (5 * rowHeight) + 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '7.5px')
            .attr('font-family', 'monospace')
            .attr('fill', isDark ? '#64748b' : '#94a3b8')
            .text(`+${d.columns.length - 5} more columns`);
        }
      }
    });

    // Update coordinates on simulation tick
    simulation.on('tick', () => {
      link.attr('d', d => {
        const source = d.source as TableNodeDef;
        const target = d.target as TableNodeDef;
        if (!source.x || !source.y || !target.x || !target.y) return '';

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.25; // Gentle curve
        return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
      });

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [tablesData, linksData, selectedTableId, connectedTableIds, visibleTableIds, showColumns, isDark]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.25);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth || 800;
      d3.select(svgRef.current).transition().duration(400).call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(width / 2, 290).scale(0.85)
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search, Domains, Display Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[var(--color-carbon-plate)] p-3.5 rounded-[16px] border border-[var(--color-steel-border)]">
        
        {/* Left: Domain Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--color-graphite)] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#70dcd3]" />
            Domain:
          </span>
          {DOMAINS.map(dom => (
            <button
              key={dom.id}
              onClick={() => setSelectedDomain(dom.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedDomain === dom.id
                  ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-bold shadow-sm'
                  : 'bg-[var(--color-obsidian)] text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] border border-[var(--color-iron-edge)]'
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: dom.color }} />
              {dom.label}
            </button>
          ))}
        </div>

        {/* Right: Search, Columns Toggle, Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--color-graphite)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table or column..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-full pl-8 pr-3 py-1 text-xs text-[var(--color-pure-white)] placeholder:text-[var(--color-graphite)] focus:outline-none focus:border-[#70dcd3] w-44 sm:w-52"
            />
          </div>

          <button
            onClick={() => setShowColumns(!showColumns)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--color-iron-edge)] transition-all cursor-pointer flex items-center gap-1 ${
              showColumns ? 'bg-[var(--color-obsidian)] text-[#70dcd3] border-[#70dcd3]/40' : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
            title="Toggle column visibility"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Columns</span>
          </button>

          <div className="flex items-center bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-full p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1 text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] rounded-full transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] rounded-full transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] rounded-full transition-colors cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: D3 SVG Canvas (Left) + Table Inspector Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* SVG Diagram Canvas */}
        <div 
          ref={containerRef}
          className="lg:col-span-8 bg-[var(--color-void-canvas)] border border-[var(--color-iron-edge)] rounded-[20px] relative overflow-hidden shadow-inner h-[580px] flex flex-col"
        >
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#70dcd3_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Quick HUD Legend */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-[var(--color-obsidian)]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--color-iron-edge)] text-[11px] font-mono text-[var(--color-graphite)] shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span>PK Candidate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              <span>FK Constraint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link2 className="w-3 h-3 text-[#70dcd3]" />
              <span>{linksData.length} Relations</span>
            </div>
          </div>

          <svg 
            ref={svgRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          />

          <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-[var(--color-graphite)] opacity-60">
            D3 Force-Directed Relational Graph Engine • Drag nodes to reposition • Scroll to zoom
          </div>
        </div>

        {/* Right Inspector Panel: Active Table Deep Dive */}
        <div className="lg:col-span-4 space-y-3">
          {activeTable ? (
            <div className="harness-card p-5 space-y-4 h-[580px] overflow-y-auto">
              
              {/* Table Header & Tag */}
              <div className="border-b border-[var(--color-steel-border)] pb-3">
                <div className="flex items-center justify-between">
                  <span className="harness-badge harness-badge-teal text-[11px] uppercase tracking-wider">
                    {activeTable.domain} domain
                  </span>
                  <span className="text-xs font-mono text-[#70dcd3] font-bold">
                    {activeTable.rowCount} rows in store
                  </span>
                </div>
                <h3 className="text-lg font-mono font-bold text-[var(--color-pure-white)] mt-2 flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#70dcd3]" />
                  {activeTable.name}
                </h3>
                <p className="text-xs text-[var(--color-graphite)] mt-1 leading-relaxed">
                  {activeTable.description}
                </p>
              </div>

              {/* Primary Key & Indexes */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[var(--color-graphite)] uppercase tracking-wider block">
                  Index Architecture &amp; Keys
                </span>
                <div className="p-2.5 bg-[var(--color-obsidian)] rounded-[12px] border border-[var(--color-iron-edge)] space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[#f59e0b]">
                    <Key className="w-3 h-3 flex-shrink-0" />
                    <span>PRIMARY KEY ({activeTable.pk.join(', ')})</span>
                  </div>
                  {activeTable.indexes.map((idx, i) => (
                    <div key={i} className="text-[11px] text-[var(--color-graphite)] flex items-center gap-1.5 pl-4">
                      <span className="w-1 h-1 rounded-full bg-[var(--color-graphite)]" />
                      <span>{idx}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schema Columns Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[var(--color-graphite)] uppercase tracking-wider block">
                  Relation Columns ({activeTable.columns.length})
                </span>
                <div className="bg-[var(--color-obsidian)] rounded-[12px] border border-[var(--color-iron-edge)] overflow-hidden">
                  <div className="divide-y divide-[var(--color-iron-edge)] text-xs font-mono">
                    {activeTable.columns.map((col, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between hover:bg-[var(--color-carbon-plate)] transition-colors">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {col.isPk ? (
                            <span className="px-1 py-0.5 text-[9px] bg-[#f59e0b]/20 text-[#f59e0b] rounded font-bold">PK</span>
                          ) : col.isFk ? (
                            <span className="px-1 py-0.5 text-[9px] bg-[#0092e4]/20 text-[#0092e4] rounded font-bold">FK</span>
                          ) : (
                            <span className="w-2.5" />
                          )}
                          <span className={`truncate ${col.isPk ? 'text-[var(--color-pure-white)] font-bold' : 'text-[var(--color-graphite)]'}`}>
                            {col.name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[11px] text-[#70dcd3]">{col.type}</span>
                          {col.fkTarget && (
                            <span className="block text-[9px] text-[#38bdf8]">➔ {col.fkTarget.table}.{col.fkTarget.column}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Relational Foreign Key Graph Links */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[var(--color-graphite)] uppercase tracking-wider block">
                  Foreign Key Constraints
                </span>
                <div className="space-y-1.5">
                  {linksData
                    .filter(l => {
                      const src = typeof l.source === 'object' ? (l.source as TableNodeDef).id : l.source;
                      const tgt = typeof l.target === 'object' ? (l.target as TableNodeDef).id : l.target;
                      return src === activeTable.id || tgt === activeTable.id;
                    })
                    .map((l, i) => {
                      const src = typeof l.source === 'object' ? (l.source as TableNodeDef).id : l.source;
                      const tgt = typeof l.target === 'object' ? (l.target as TableNodeDef).id : l.target;
                      const isOutgoing = src === activeTable.id;

                      return (
                        <div 
                          key={i} 
                          onClick={() => setSelectedTableId(isOutgoing ? (tgt as string) : (src as string))}
                          className="p-2 bg-[var(--color-obsidian)] rounded-[12px] border border-[var(--color-iron-edge)] flex items-center justify-between text-xs font-mono hover:border-[#70dcd3] cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-1.5 text-[var(--color-pure-white)]">
                            <Link2 className="w-3.5 h-3.5 text-[#70dcd3]" />
                            <span className="group-hover:text-[#70dcd3] transition-colors">{l.description}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-void-canvas)] text-[var(--color-graphite)]">
                              {l.cardinality}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-graphite)] group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* DDL Quick Spec */}
              <div className="p-3 bg-[var(--color-void-canvas)] rounded-[12px] border border-[var(--color-iron-edge)] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#70dcd3]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PostgreSQL DDL Compliance</span>
                </div>
                <p className="text-[11px] text-[var(--color-graphite)] leading-relaxed font-mono">
                  Normalized in BCNF (Boyce-Codd). All non-trivial functional dependencies possess a candidate superkey as determinant.
                </p>
              </div>

            </div>
          ) : (
            <div className="harness-card p-6 h-[580px] flex flex-col items-center justify-center text-center space-y-3">
              <Database className="w-8 h-8 text-[var(--color-graphite)] animate-pulse" />
              <p className="text-xs text-[var(--color-graphite)]">
                Click any table node on the D3 canvas to inspect its relational structure, indices, and foreign key topology.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
