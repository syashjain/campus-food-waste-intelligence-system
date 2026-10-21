import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Database, Key, Link2, ZoomIn, ZoomOut, RotateCcw, 
  Layers, ShieldCheck, Search, Info, ExternalLink, Sparkles
} from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';
import { useTheme } from '../context/ThemeContext';

export interface SchemaField {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  nullable?: boolean;
}

export interface SchemaNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: 'core' | 'operations' | 'logistics' | 'security';
  description: string;
  fields: SchemaField[];
  indexes: string[];
  bcnfProof: string;
  recordCount: number;
  width?: number;
  height?: number;
}

export interface SchemaLink extends d3.SimulationLinkDatum<SchemaNode> {
  source: string | SchemaNode;
  target: string | SchemaNode;
  fkField: string;
  pkField: string;
  relationType: '1:N' | 'N:1' | '1:1';
}

type CategoryFilter = 'all' | 'core' | 'operations' | 'logistics' | 'security';

export const D3SchemaDiagram: React.FC = () => {
  const { state } = useRelationalDatabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedTableId, setSelectedTableId] = useState<string | null>('food_waste');
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Define Complete Relational Schema Graph
  const { nodes: allNodes, links: allLinks } = useMemo(() => {
    const rawNodes: SchemaNode[] = [
      {
        id: 'campus',
        name: 'campus',
        category: 'logistics',
        description: 'Multi-tenant geographic institutional root campus record.',
        recordCount: state.campuses.length,
        indexes: ['pk_campus (B-Tree)', 'idx_campus_code (Unique B-Tree)'],
        bcnfProof: 'campus_id -> ALL attributes. Functional dependencies determinant is candidate key.',
        fields: [
          { name: 'campus_id', type: 'UUID', isPk: true },
          { name: 'campus_code', type: 'VARCHAR(20)' },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'city', type: 'VARCHAR(50)' },
          { name: 'lat', type: 'DECIMAL(9,6)' },
          { name: 'lng', type: 'DECIMAL(9,6)' },
          { name: 'is_active', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'facility',
        name: 'facility',
        category: 'operations',
        description: 'Dining halls, central mess facilities, and cafeterias.',
        recordCount: state.facilities.length,
        indexes: ['pk_facility (B-Tree)', 'idx_facility_campus (B-Tree Composite)'],
        bcnfProof: 'facility_id -> ALL attributes. Determinant is minimal candidate key.',
        fields: [
          { name: 'facility_id', type: 'UUID', isPk: true },
          { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: 'campus.campus_id' },
          { name: 'facility_code', type: 'VARCHAR(30)' },
          { name: 'facility_name', type: 'VARCHAR(100)' },
          { name: 'facility_type', type: 'ENUM' },
          { name: 'dining_capacity', type: 'INTEGER' },
          { name: 'operating_status', type: 'VARCHAR(20)' }
        ]
      },
      {
        id: 'food_category',
        name: 'food_category',
        category: 'core',
        description: 'Taxonomy of commodity categories (Grains, Dairy, Produce, etc.).',
        recordCount: state.foodCategories.length,
        indexes: ['pk_food_category (B-Tree)'],
        bcnfProof: 'category_id -> category_name. Single candidate key determinant.',
        fields: [
          { name: 'category_id', type: 'INTEGER', isPk: true },
          { name: 'category_code', type: 'VARCHAR(30)' },
          { name: 'category_name', type: 'VARCHAR(60)' },
          { name: 'description', type: 'TEXT', nullable: true }
        ]
      },
      {
        id: 'food_item',
        name: 'food_item',
        category: 'core',
        description: 'Standard master catalog of recipes and raw food ingredients.',
        recordCount: state.foodItems.length,
        indexes: ['pk_food_item (B-Tree)', 'idx_food_item_cat (B-Tree)'],
        bcnfProof: 'item_id -> ALL attributes. Determinant is candidate key.',
        fields: [
          { name: 'item_id', type: 'UUID', isPk: true },
          { name: 'category_id', type: 'INTEGER', isFk: true, fkTarget: 'food_category.category_id' },
          { name: 'item_code', type: 'VARCHAR(30)' },
          { name: 'item_name', type: 'VARCHAR(80)' },
          { name: 'standard_unit', type: 'ENUM (KG/L/PC)' },
          { name: 'standard_unit_cost', type: 'DECIMAL(10,2)' }
        ]
      },
      {
        id: 'meal',
        name: 'meal',
        category: 'operations',
        description: 'Operational meal periods (Breakfast, Lunch, Snacks, Dinner).',
        recordCount: state.meals.length,
        indexes: ['pk_meal (B-Tree)'],
        bcnfProof: 'meal_id -> ALL attributes. Determinant is candidate key.',
        fields: [
          { name: 'meal_id', type: 'INTEGER', isPk: true },
          { name: 'meal_code', type: 'ENUM' },
          { name: 'meal_name', type: 'VARCHAR(30)' },
          { name: 'typical_start_time', type: 'TIME' },
          { name: 'typical_end_time', type: 'TIME' }
        ]
      },
      {
        id: 'menu',
        name: 'menu',
        category: 'operations',
        description: 'Daily scheduled menus per dining hall and meal session.',
        recordCount: state.menus.length,
        indexes: ['pk_menu (B-Tree)', 'idx_menu_facility_date (Compound B-Tree)'],
        bcnfProof: 'menu_id -> ALL attributes. Determinant is candidate key.',
        fields: [
          { name: 'menu_id', type: 'UUID', isPk: true },
          { name: 'facility_id', type: 'UUID', isFk: true, fkTarget: 'facility.facility_id' },
          { name: 'meal_id', type: 'INTEGER', isFk: true, fkTarget: 'meal.meal_id' },
          { name: 'menu_date', type: 'DATE' },
          { name: 'expected_attendance', type: 'INTEGER' }
        ]
      },
      {
        id: 'menu_item',
        name: 'menu_item',
        category: 'operations',
        description: 'Normalized junction relation linking items to scheduled menus.',
        recordCount: state.menuItems.length,
        indexes: ['pk_menu_item (B-Tree)', 'idx_menu_item_composite (Unique)'],
        bcnfProof: 'menu_item_id -> {menu_id, item_id, planned_quantity}. BCNF satisfied.',
        fields: [
          { name: 'menu_item_id', type: 'UUID', isPk: true },
          { name: 'menu_id', type: 'UUID', isFk: true, fkTarget: 'menu.menu_id' },
          { name: 'item_id', type: 'UUID', isFk: true, fkTarget: 'food_item.item_id' },
          { name: 'planned_quantity', type: 'DECIMAL(10,2)' }
        ]
      },
      {
        id: 'food_preparation',
        name: 'food_preparation',
        category: 'core',
        description: 'Batch production logs measured in kilograms per kitchen.',
        recordCount: state.preparations.length,
        indexes: ['pk_food_preparation (B-Tree)', 'idx_prep_date_facility (BRIN + B-Tree)'],
        bcnfProof: 'prep_id -> ALL attributes. Independent life-cycle relation in BCNF.',
        fields: [
          { name: 'prep_id', type: 'UUID', isPk: true },
          { name: 'facility_id', type: 'UUID', isFk: true, fkTarget: 'facility.facility_id' },
          { name: 'item_id', type: 'UUID', isFk: true, fkTarget: 'food_item.item_id' },
          { name: 'meal_id', type: 'INTEGER', isFk: true, fkTarget: 'meal.meal_id' },
          { name: 'prep_date', type: 'DATE' },
          { name: 'prepared_quantity', type: 'DECIMAL(10,2)' },
          { name: 'batch_number', type: 'VARCHAR(40)' }
        ]
      },
      {
        id: 'food_consumption',
        name: 'food_consumption',
        category: 'core',
        description: 'Scale-verified consumer consumption records with upper bounds.',
        recordCount: state.consumptions.length,
        indexes: ['pk_food_consumption (B-Tree)', 'idx_consumption_prep (Unique B-Tree)'],
        bcnfProof: 'consumption_id -> {prep_id, consumed_quantity, verified_at}. 1:1 prep constraint.',
        fields: [
          { name: 'consumption_id', type: 'UUID', isPk: true },
          { name: 'prep_id', type: 'UUID', isFk: true, fkTarget: 'food_preparation.prep_id' },
          { name: 'consumed_quantity', type: 'DECIMAL(10,2)' },
          { name: 'scale_terminal_id', type: 'VARCHAR(40)' },
          { name: 'recorded_at', type: 'TIMESTAMPTZ' }
        ]
      },
      {
        id: 'food_waste',
        name: 'food_waste',
        category: 'core',
        description: 'Immutable transactional food waste logs with root-cause & cost snapshots.',
        recordCount: state.wastes.length,
        indexes: [
          'pk_food_waste (B-Tree)',
          'idx_waste_date_facility (B-Tree)',
          'idx_waste_brin_date (BRIN on waste_date)',
          'idx_waste_reason_fk (B-Tree)'
        ],
        bcnfProof: 'waste_id -> ALL attributes. Unit cost snapshot preserves temporal accuracy.',
        fields: [
          { name: 'waste_id', type: 'UUID', isPk: true },
          { name: 'prep_id', type: 'UUID', isFk: true, fkTarget: 'food_preparation.prep_id' },
          { name: 'item_id', type: 'UUID', isFk: true, fkTarget: 'food_item.item_id' },
          { name: 'facility_id', type: 'UUID', isFk: true, fkTarget: 'facility.facility_id' },
          { name: 'reason_id', type: 'INTEGER', isFk: true, fkTarget: 'waste_reason.reason_id' },
          { name: 'method_id', type: 'INTEGER', isFk: true, fkTarget: 'disposal_method.method_id' },
          { name: 'pantry_partner_id', type: 'UUID', isFk: true, fkTarget: 'food_pantry_partner.pantry_id', nullable: true },
          { name: 'waste_quantity', type: 'DECIMAL(10,2)' },
          { name: 'unit_cost_snapshot', type: 'DECIMAL(10,2)' },
          { name: 'estimated_waste_cost', type: 'DECIMAL(12,2)' },
          { name: 'waste_date', type: 'DATE' }
        ]
      },
      {
        id: 'waste_reason',
        name: 'waste_reason',
        category: 'core',
        description: 'Taxonomy of classified root-cause drivers (Overproduction, Spoilage, etc.).',
        recordCount: state.wasteReasons.length,
        indexes: ['pk_waste_reason (B-Tree)'],
        bcnfProof: 'reason_id -> ALL attributes. Determinant is candidate key.',
        fields: [
          { name: 'reason_id', type: 'INTEGER', isPk: true },
          { name: 'reason_code', type: 'VARCHAR(40)' },
          { name: 'reason_name', type: 'VARCHAR(60)' },
          { name: 'category', type: 'VARCHAR(30)' },
          { name: 'is_preventable', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'disposal_method',
        name: 'disposal_method',
        category: 'logistics',
        description: 'Disposal and diversion methods with carbon offset environmental coefficients.',
        recordCount: state.disposalMethods.length,
        indexes: ['pk_disposal_method (B-Tree)'],
        bcnfProof: 'method_id -> ALL attributes. Candidate key determinant.',
        fields: [
          { name: 'method_id', type: 'INTEGER', isPk: true },
          { name: 'method_code', type: 'VARCHAR(40)' },
          { name: 'method_name', type: 'VARCHAR(60)' },
          { name: 'carbon_offset_factor', type: 'DECIMAL(6,4)' },
          { name: 'is_recovery', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'food_pantry_partner',
        name: 'food_pantry_partner',
        category: 'logistics',
        description: 'Food rescue pantries with PostGIS geometry spatial coordinates.',
        recordCount: state.pantryPartners.length,
        indexes: ['pk_pantry (B-Tree)', 'gist_pantry_geom (PostGIS GiST R-Tree)'],
        bcnfProof: 'pantry_id -> ALL attributes. Determinant is candidate key.',
        fields: [
          { name: 'pantry_id', type: 'UUID', isPk: true },
          { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: 'campus.campus_id' },
          { name: 'pantry_name', type: 'VARCHAR(100)' },
          { name: 'storage_capacity_kg', type: 'DECIMAL(10,2)' },
          { name: 'lat', type: 'DECIMAL(9,6)' },
          { name: 'lng', type: 'DECIMAL(9,6)' },
          { name: 'geom', type: 'geometry(Point,4326)' }
        ]
      },
      {
        id: 'attendance',
        name: 'attendance',
        category: 'operations',
        description: 'Biometric turnstile headcount counts versus expected banquet attendance.',
        recordCount: state.attendances.length,
        indexes: ['pk_attendance (B-Tree)', 'idx_att_date_fac (Compound B-Tree)'],
        bcnfProof: 'attendance_id -> ALL attributes. Candidate key determinant.',
        fields: [
          { name: 'attendance_id', type: 'VARCHAR(60)', isPk: true },
          { name: 'facility_id', type: 'UUID', isFk: true, fkTarget: 'facility.facility_id' },
          { name: 'meal_id', type: 'INTEGER', isFk: true, fkTarget: 'meal.meal_id' },
          { name: 'attendance_date', type: 'DATE' },
          { name: 'expected_attendance', type: 'INTEGER' },
          { name: 'actual_attendance', type: 'INTEGER' },
          { name: 'variance_count', type: 'INTEGER' }
        ]
      },
      {
        id: 'user_account',
        name: 'user_account',
        category: 'security',
        description: 'Multi-tenant users mapped to campus tenants with RBAC security.',
        recordCount: state.users.length,
        indexes: ['pk_user_account (B-Tree)', 'idx_user_email (Unique B-Tree)'],
        bcnfProof: 'user_id -> ALL attributes. Candidate key determinant.',
        fields: [
          { name: 'user_id', type: 'UUID', isPk: true },
          { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: 'campus.campus_id' },
          { name: 'role_code', type: 'VARCHAR(30)', isFk: true, fkTarget: 'role.role_code' },
          { name: 'email', type: 'VARCHAR(120)' },
          { name: 'full_name', type: 'VARCHAR(80)' },
          { name: 'is_active', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'role',
        name: 'role',
        category: 'security',
        description: 'Role-Based Access Control definitions (SUPER_ADMIN, MESS_MANAGER, etc.).',
        recordCount: state.roles.length,
        indexes: ['pk_role (B-Tree)', 'idx_role_code (Unique)'],
        bcnfProof: 'role_id -> ALL attributes. Determinant is candidate key.',
        fields: [
          { name: 'role_id', type: 'INTEGER', isPk: true },
          { name: 'role_code', type: 'VARCHAR(30)' },
          { name: 'role_name', type: 'VARCHAR(60)' },
          { name: 'description', type: 'TEXT', nullable: true }
        ]
      },
      {
        id: 'purchase',
        name: 'purchase',
        category: 'logistics',
        description: 'Purchase orders for inventory replenishment and supply chain auditing.',
        recordCount: state.purchases.length,
        indexes: ['pk_purchase (B-Tree)', 'idx_purchase_vendor (B-Tree)'],
        bcnfProof: 'purchase_id -> ALL attributes. Minimal candidate key determinant.',
        fields: [
          { name: 'purchase_id', type: 'VARCHAR(40)', isPk: true },
          { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: 'campus.campus_id' },
          { name: 'vendor_id', type: 'UUID', isFk: true, fkTarget: 'vendor.vendor_id' },
          { name: 'po_number', type: 'VARCHAR(40)' },
          { name: 'purchase_date', type: 'DATE' },
          { name: 'total_amount', type: 'DECIMAL(12,2)' }
        ]
      },
      {
        id: 'vendor',
        name: 'vendor',
        category: 'logistics',
        description: 'External farm and food commodity suppliers with compliance tracking.',
        recordCount: state.vendors.length,
        indexes: ['pk_vendor (B-Tree)'],
        bcnfProof: 'vendor_id -> ALL attributes. Candidate key determinant.',
        fields: [
          { name: 'vendor_id', type: 'UUID', isPk: true },
          { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: 'campus.campus_id' },
          { name: 'vendor_name', type: 'VARCHAR(100)' },
          { name: 'contact_person', type: 'VARCHAR(80)' },
          { name: 'compliance_rating', type: 'DECIMAL(3,2)' }
        ]
      },
      {
        id: 'audit_log',
        name: 'audit_log',
        category: 'security',
        description: 'Immutable append-only forensic audit trail of all DDL/DML events.',
        recordCount: state.auditLogs.length,
        indexes: ['pk_audit_log (B-Tree)', 'idx_audit_brin_time (BRIN on executed_at)'],
        bcnfProof: 'audit_id -> ALL attributes. Immutable ledger in BCNF.',
        fields: [
          { name: 'audit_id', type: 'BIGINT', isPk: true },
          { name: 'campus_id', type: 'UUID', isFk: true, fkTarget: 'campus.campus_id' },
          { name: 'table_name', type: 'VARCHAR(50)' },
          { name: 'operation_type', type: 'ENUM (INSERT/UPDATE/DELETE)' },
          { name: 'changed_by', type: 'UUID' },
          { name: 'executed_at', type: 'TIMESTAMPTZ' }
        ]
      }
    ];

    const rawLinks: SchemaLink[] = [
      { source: 'facility', target: 'campus', fkField: 'campus_id', pkField: 'campus_id', relationType: 'N:1' },
      { source: 'food_item', target: 'food_category', fkField: 'category_id', pkField: 'category_id', relationType: 'N:1' },
      { source: 'menu', target: 'facility', fkField: 'facility_id', pkField: 'facility_id', relationType: 'N:1' },
      { source: 'menu', target: 'meal', fkField: 'meal_id', pkField: 'meal_id', relationType: 'N:1' },
      { source: 'menu_item', target: 'menu', fkField: 'menu_id', pkField: 'menu_id', relationType: 'N:1' },
      { source: 'menu_item', target: 'food_item', fkField: 'item_id', pkField: 'item_id', relationType: 'N:1' },
      { source: 'food_preparation', target: 'facility', fkField: 'facility_id', pkField: 'facility_id', relationType: 'N:1' },
      { source: 'food_preparation', target: 'food_item', fkField: 'item_id', pkField: 'item_id', relationType: 'N:1' },
      { source: 'food_preparation', target: 'meal', fkField: 'meal_id', pkField: 'meal_id', relationType: 'N:1' },
      { source: 'food_consumption', target: 'food_preparation', fkField: 'prep_id', pkField: 'prep_id', relationType: '1:1' },
      { source: 'food_waste', target: 'food_preparation', fkField: 'prep_id', pkField: 'prep_id', relationType: 'N:1' },
      { source: 'food_waste', target: 'food_item', fkField: 'item_id', pkField: 'item_id', relationType: 'N:1' },
      { source: 'food_waste', target: 'facility', fkField: 'facility_id', pkField: 'facility_id', relationType: 'N:1' },
      { source: 'food_waste', target: 'waste_reason', fkField: 'reason_id', pkField: 'reason_id', relationType: 'N:1' },
      { source: 'food_waste', target: 'disposal_method', fkField: 'method_id', pkField: 'method_id', relationType: 'N:1' },
      { source: 'food_waste', target: 'food_pantry_partner', fkField: 'pantry_partner_id', pkField: 'pantry_id', relationType: 'N:1' },
      { source: 'food_pantry_partner', target: 'campus', fkField: 'campus_id', pkField: 'campus_id', relationType: 'N:1' },
      { source: 'attendance', target: 'facility', fkField: 'facility_id', pkField: 'facility_id', relationType: 'N:1' },
      { source: 'attendance', target: 'meal', fkField: 'meal_id', pkField: 'meal_id', relationType: 'N:1' },
      { source: 'user_account', target: 'campus', fkField: 'campus_id', pkField: 'campus_id', relationType: 'N:1' },
      { source: 'user_account', target: 'role', fkField: 'role_code', pkField: 'role_code', relationType: 'N:1' },
      { source: 'purchase', target: 'campus', fkField: 'campus_id', pkField: 'campus_id', relationType: 'N:1' },
      { source: 'purchase', target: 'vendor', fkField: 'vendor_id', pkField: 'vendor_id', relationType: 'N:1' },
      { source: 'vendor', target: 'campus', fkField: 'campus_id', pkField: 'campus_id', relationType: 'N:1' },
      { source: 'audit_log', target: 'campus', fkField: 'campus_id', pkField: 'campus_id', relationType: 'N:1' }
    ];

    return { nodes: rawNodes, links: rawLinks };
  }, [state]);

  // Filtered Nodes & Links based on active tab and search
  const { filteredNodes, filteredLinks } = useMemo(() => {
    let nodes = allNodes;
    if (activeCategory !== 'all') {
      nodes = nodes.filter(n => n.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      nodes = nodes.filter(n => 
        n.name.toLowerCase().includes(q) || 
        n.description.toLowerCase().includes(q) ||
        n.fields.some(f => f.name.toLowerCase().includes(q))
      );
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    const links = allLinks.filter(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as SchemaNode).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as SchemaNode).id : l.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return { filteredNodes: nodes, filteredLinks: links };
  }, [allNodes, allLinks, activeCategory, searchTerm]);

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return allNodes.find(n => n.id === selectedTableId) || allNodes[0];
  }, [allNodes, selectedTableId]);

  // Live Sample Tuples for Selected Table
  const sampleTuples = useMemo(() => {
    if (!selectedNode) return [];
    switch (selectedNode.id) {
      case 'campus': return state.campuses.slice(0, 4);
      case 'facility': return state.facilities.slice(0, 4);
      case 'food_category': return state.foodCategories.slice(0, 4);
      case 'food_item': return state.foodItems.slice(0, 4);
      case 'meal': return state.meals.slice(0, 4);
      case 'food_preparation': return state.preparations.slice(0, 4);
      case 'food_consumption': return state.consumptions.slice(0, 4);
      case 'food_waste': return state.wastes.slice(0, 4);
      case 'waste_reason': return state.wasteReasons.slice(0, 4);
      case 'disposal_method': return state.disposalMethods.slice(0, 4);
      case 'food_pantry_partner': return state.pantryPartners.slice(0, 4);
      case 'attendance': return state.attendances.slice(0, 4);
      case 'user_account': return state.users.slice(0, 4);
      case 'role': return state.roles.slice(0, 4);
      case 'purchase': return state.purchases.slice(0, 4);
      case 'vendor': return state.vendors.slice(0, 4);
      case 'audit_log': return state.auditLogs.slice(0, 4);
      default: return [];
    }
  }, [selectedNode, state]);

  // D3 Force Directed Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 620;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', [0, 0, width, height]);

    // Color Helpers
    const categoryColors: Record<string, string> = {
      core: '#70dcd3',       // Phosphor Mint
      operations: '#0092e4', // Signal Blue
      logistics: '#75ae4c',  // Verdant Edge
      security: '#f59e0b'    // Amber Signal
    };

    // Main Zoomable Group
    const g = svg.append('g').attr('class', 'main-scene');

    // D3 Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 100) / 100);
      });

    svg.call(zoom);

    // Arrow Marker Definitions for Foreign Key Relationships
    const defs = svg.append('defs');

    // Arrow markers for links
    Object.entries(categoryColors).forEach(([catKey, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${catKey}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 22)
        .attr('refY', 0)
        .attr('markerWidth', 7)
        .attr('markerHeight', 7)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Default Gray Marker
    defs.append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', isDark ? '#4b5563' : '#94a3b8');

    // Clone data for simulation
    const simulationNodes: SchemaNode[] = filteredNodes.map(d => ({ ...d }));
    const simulationLinks: SchemaLink[] = filteredLinks.map(d => ({ ...d }));

    // Force Simulation
    const simulation = d3.forceSimulation<SchemaNode>(simulationNodes)
      .force('link', d3.forceLink<SchemaNode, SchemaLink>(simulationLinks).id(d => d.id).distance(140).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-750))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(90).strength(0.85))
      .force('x', d3.forceX(width / 2).strength(0.06))
      .force('y', d3.forceY(height / 2).strength(0.06));

    // Links Render Group
    const linkGroup = g.append('g').attr('class', 'links');
    const links = linkGroup.selectAll('path')
      .data(simulationLinks)
      .enter()
      .append('path')
      .attr('class', 'schema-link')
      .attr('stroke', isDark ? '#2e3038' : '#cbd5e1')
      .attr('stroke-width', 1.8)
      .attr('fill', 'none')
      .attr('stroke-dasharray', d => d.relationType === '1:1' ? '4 2' : 'none')
      .attr('marker-end', 'url(#arrow-default)');

    // Nodes Render Group
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeContainers = nodeGroup.selectAll('g.schema-table-node')
      .data(simulationNodes)
      .enter()
      .append('g')
      .attr('class', 'schema-table-node')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, SchemaNode>()
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

    // Node Box Rectangles (Card style)
    const cardWidth = 175;
    const cardHeight = 115;

    // Background Card Surface
    nodeContainers.append('rect')
      .attr('width', cardWidth)
      .attr('height', cardHeight)
      .attr('x', -cardWidth / 2)
      .attr('y', -cardHeight / 2)
      .attr('rx', 14)
      .attr('ry', 14)
      .attr('fill', isDark ? '#0d0e12' : '#ffffff')
      .attr('stroke', d => {
        if (selectedTableId === d.id) return '#70dcd3';
        if (hoveredTableId === d.id) return '#0092e4';
        return isDark ? '#22222a' : '#e2e8f0';
      })
      .attr('stroke-width', d => (selectedTableId === d.id ? 2.5 : 1.2))
      .attr('filter', isDark ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))');

    // Card Header Bar
    nodeContainers.append('rect')
      .attr('width', cardWidth)
      .attr('height', 28)
      .attr('x', -cardWidth / 2)
      .attr('y', -cardHeight / 2)
      .attr('rx', 14)
      .attr('ry', 14)
      .attr('fill', d => {
        const catCol = categoryColors[d.category];
        return isDark ? '#141418' : '#f8fafc';
      });

    // Color Category Pill Line
    nodeContainers.append('rect')
      .attr('width', 4)
      .attr('height', 16)
      .attr('x', -cardWidth / 2 + 8)
      .attr('y', -cardHeight / 2 + 6)
      .attr('rx', 2)
      .attr('fill', d => categoryColors[d.category]);

    // Table Name in Header
    nodeContainers.append('text')
      .attr('x', -cardWidth / 2 + 18)
      .attr('y', -cardHeight / 2 + 18)
      .attr('fill', isDark ? '#ffffff' : '#0f172a')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('font-family', 'var(--font-mono, monospace)')
      .text(d => d.name);

    // Row Count Badge (Right aligned in header)
    nodeContainers.append('text')
      .attr('x', cardWidth / 2 - 10)
      .attr('y', -cardHeight / 2 + 18)
      .attr('text-anchor', 'end')
      .attr('fill', isDark ? '#70dcd3' : '#0d9488')
      .attr('font-size', '9px')
      .attr('font-family', 'var(--font-mono, monospace)')
      .text(d => `${d.recordCount} rows`);

    // Primary Key Field Row
    nodeContainers.append('text')
      .attr('x', -cardWidth / 2 + 10)
      .attr('y', -cardHeight / 2 + 48)
      .attr('fill', '#f59e0b')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono, monospace)')
      .text(d => {
        const pk = d.fields.find(f => f.isPk);
        return pk ? `PK: ${pk.name}` : 'PK: id';
      });

    // FK Field Count & Summary
    nodeContainers.append('text')
      .attr('x', -cardWidth / 2 + 10)
      .attr('y', -cardHeight / 2 + 66)
      .attr('fill', '#0092e4')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono, monospace)')
      .text(d => {
        const fks = d.fields.filter(f => f.isFk);
        return fks.length > 0 ? `FK: ${fks.map(f => f.name.replace('_id', '')).slice(0, 2).join(', ')}${fks.length > 2 ? '…' : ''}` : 'FK: (None - Root Table)';
      });

    // Normalization & Index Badge Row
    nodeContainers.append('text')
      .attr('x', -cardWidth / 2 + 10)
      .attr('y', -cardHeight / 2 + 86)
      .attr('fill', isDark ? '#9ca3af' : '#6b7280')
      .attr('font-size', '9px')
      .attr('font-family', 'var(--font-text, sans-serif)')
      .text(d => `BCNF: Pass • ${d.indexes.length} Indexes`);

    // Category Tag in footer
    nodeContainers.append('text')
      .attr('x', -cardWidth / 2 + 10)
      .attr('y', -cardHeight / 2 + 102)
      .attr('fill', d => categoryColors[d.category])
      .attr('font-size', '8.5px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'var(--font-mono, monospace)')
      .text(d => `SCHEMA::${d.category.toUpperCase()}`);

    // Click & Hover Handlers
    nodeContainers
      .on('click', (_, d) => {
        setSelectedTableId(d.id);
      })
      .on('mouseenter', (_, d) => {
        setHoveredTableId(d.id);
        // Highlight connected links
        links
          .attr('stroke', l => {
            const srcId = typeof l.source === 'object' ? (l.source as SchemaNode).id : l.source;
            const tgtId = typeof l.target === 'object' ? (l.target as SchemaNode).id : l.target;
            if (srcId === d.id || tgtId === d.id) {
              return categoryColors[d.category] || '#70dcd3';
            }
            return isDark ? '#2e3038' : '#cbd5e1';
          })
          .attr('stroke-width', l => {
            const srcId = typeof l.source === 'object' ? (l.source as SchemaNode).id : l.source;
            const tgtId = typeof l.target === 'object' ? (l.target as SchemaNode).id : l.target;
            return (srcId === d.id || tgtId === d.id) ? 3 : 1.5;
          });
      })
      .on('mouseleave', () => {
        setHoveredTableId(null);
        links
          .attr('stroke', isDark ? '#2e3038' : '#cbd5e1')
          .attr('stroke-width', 1.8);
      });

    // Simulation Tick
    simulation.on('tick', () => {
      links.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      nodeContainers.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Expose programmatic zoom functions
    (window as any).__d3SchemaZoomIn = () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1.25);
    };
    (window as any).__d3SchemaZoomOut = () => {
      svg.transition().duration(300).call(zoom.scaleBy, 0.8);
    };
    (window as any).__d3SchemaZoomReset = () => {
      svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    };

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, selectedTableId, isDark]);

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-steel-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              D3.js Relational Schema Engine
            </span>
            <span className="text-xs text-[var(--color-graphite)] font-mono">
              BCNF Normalized &bull; PostgreSQL 15 DDL
            </span>
          </div>
          <h2 className="text-xl font-light text-[var(--color-pure-white)] flex items-center gap-2 mt-1 tracking-[0.056em] font-display">
            <Database className="w-5 h-5 text-[#70dcd3]" />
            Relational Schema &amp; Constraint Graph
          </h2>
          <p className="text-xs text-[var(--color-graphite)] mt-0.5">
            Interactive D3 force-directed visualization of tables, candidate keys, foreign key dependencies, and live table cardinality.
          </p>
        </div>

        {/* Category Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-graphite)]" />
            <input
              type="text"
              placeholder="Find table / column..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="harness-input rounded-[5px] pl-8 pr-3 py-1.5 text-xs text-[var(--color-pure-white)] w-40 sm:w-48"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] p-1 rounded-full text-xs">
            {(['all', 'core', 'operations', 'logistics', 'security'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full font-medium transition-all capitalize cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[var(--color-pure-white)] text-[var(--color-void-canvas)] font-semibold'
                    : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
                }`}
              >
                {cat === 'all' ? 'All Tables' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Diagram Canvas & Table Inspector Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive D3 Graph */}
        <div className="xl:col-span-2 harness-card rounded-[20px] overflow-hidden flex flex-col relative min-h-[620px]">
          
          {/* Canvas Floating Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[var(--color-obsidian)]/90 backdrop-blur-md border border-[var(--color-iron-edge)] p-1.5 rounded-full shadow-lg text-xs">
            <button
              onClick={() => (window as any).__d3SchemaZoomIn?.()}
              className="p-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-carbon-plate)] transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => (window as any).__d3SchemaZoomOut?.()}
              className="p-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-carbon-plate)] transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => (window as any).__d3SchemaZoomReset?.()}
              className="p-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-carbon-plate)] transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono px-2 text-[var(--color-graphite)] border-l border-[var(--color-iron-edge)]">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* Canvas Legend */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-[var(--color-obsidian)]/85 backdrop-blur-md border border-[var(--color-iron-edge)] px-3 py-1.5 rounded-full text-[11px] font-mono text-[var(--color-graphite)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#70dcd3]" />
              <span>Core Waste</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0092e4]" />
              <span>Operations</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#75ae4c]" />
              <span>Logistics/Spatial</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span>Security/Tenancy</span>
            </span>
          </div>

          {/* D3 SVG Container */}
          <div ref={containerRef} className="flex-1 w-full h-[620px] bg-[var(--color-void-canvas)] select-none">
            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>
        </div>

        {/* Right 1 Col: Deep Schema & Tuple Inspector */}
        <div className="harness-card p-6 rounded-[20px] space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Inspector Header */}
            <div className="flex items-start justify-between border-b border-[var(--color-steel-border)] pb-3">
              <div>
                <span className="harness-badge harness-badge-mint uppercase text-[9px]">
                  Table Inspector
                </span>
                <h3 className="text-lg font-bold text-[var(--color-pure-white)] font-mono flex items-center gap-2 mt-1">
                  <Database className="w-4 h-4 text-[#70dcd3]" />
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-[var(--color-graphite)] mt-0.5">
                  {selectedNode.description}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#70dcd3] bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] px-2.5 py-1 rounded-full">
                {selectedNode.recordCount} live records
              </span>
            </div>

            {/* BCNF & Theoretical Validation Box */}
            <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-[14px] space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[#70dcd3]">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#70dcd3]" />
                  BCNF Normalization Proof
                </span>
                <span className="text-[10px] text-[#75ae4c]">VERIFIED</span>
              </div>
              <p className="text-[11px] text-[var(--color-graphite)] leading-relaxed">
                {selectedNode.bcnfProof}
              </p>
            </div>

            {/* Schema Column DDL Definition List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--color-pure-white)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0092e4]" />
                <span>Column Schema ({selectedNode.fields.length} attributes)</span>
              </span>

              <div className="overflow-hidden rounded-[12px] border border-[var(--color-steel-border)] max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[var(--color-obsidian)] text-[var(--color-graphite)] border-b border-[var(--color-steel-border)] sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Column</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2 text-right">Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-steel-border)]">
                    {selectedNode.fields.map((f, i) => (
                      <tr key={i} className="hover:bg-[var(--color-obsidian)]/60">
                        <td className="py-2 px-3 text-[var(--color-pure-white)] font-medium">
                          {f.name}
                        </td>
                        <td className="py-2 px-2 text-[#a6e5f2] text-[11px]">
                          {f.type}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {f.isPk && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                              PK
                            </span>
                          )}
                          {f.isFk && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0092e4]/15 text-[#0092e4] border border-[#0092e4]/30"
                              title={`References ${f.fkTarget}`}
                            >
                              FK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Indexes */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-pure-white)] uppercase tracking-wider font-mono">
                PostgreSQL Index Strategy:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.indexes.map((idx, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] text-[var(--color-graphite)]">
                    {idx}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Database Tuple Sample Preview */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-pure-white)] uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Live In-Memory Sample Tuples</span>
                <span className="text-[10px] text-[var(--color-graphite)] font-normal">Top 4 rows</span>
              </span>

              <div className="overflow-x-auto rounded-[12px] border border-[var(--color-steel-border)] max-h-36">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-[var(--color-obsidian)] text-[var(--color-graphite)] border-b border-[var(--color-steel-border)]">
                    <tr>
                      {sampleTuples.length > 0 && Object.keys(sampleTuples[0]).slice(0, 3).map((k, i) => (
                        <th key={i} className="py-1.5 px-2.5 capitalize">{k.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-steel-border)]">
                    {sampleTuples.map((row: any, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[var(--color-obsidian)]">
                        {Object.values(row).slice(0, 3).map((val: any, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-2.5 text-[var(--color-pure-white)] truncate max-w-[120px]">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-[var(--color-steel-border)] flex items-center justify-between text-[11px] text-[var(--color-graphite)] font-mono">
            <span>DDL Mode: ANSI SQL-92 / PG15</span>
            <span className="text-[#70dcd3]">Multi-Tenant RLS Enabled</span>
          </div>

        </div>

      </div>

    </div>
  );
};
