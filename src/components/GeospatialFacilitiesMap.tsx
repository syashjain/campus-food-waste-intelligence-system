import React, { useState, useMemo } from 'react';
import { 
  MapPin, Compass, Navigation, Radio, Shield, 
  Layers, Truck, AlertTriangle, CheckCircle, Search, 
  Building2, Server, Eye, RefreshCw, ZoomIn, ZoomOut
} from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';
import { useTheme } from '../context/ThemeContext';
import { Facility, FoodPantryPartner } from '../types/db';

interface GeospatialFacilitiesMapProps {
  className?: string;
  onSelectFacility?: (facilityId: string) => void;
}

export const GeospatialFacilitiesMap: React.FC<GeospatialFacilitiesMapProps> = ({ 
  className = '',
  onSelectFacility 
}) => {
  const { state, db } = useRelationalDatabase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Spatial Controls State
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(state.currentFacilityId);
  const [hoveredNode, setHoveredNode] = useState<{ id: string; type: 'facility' | 'pantry'; name: string; lat: number; lng: number } | null>(null);
  const [dispatchRadius, setDispatchRadius] = useState<number>(5000); // 5000 meters (5km)
  const [showRadiusRings, setShowRadiusRings] = useState<boolean>(true);
  const [showDispatchVectors, setShowDispatchVectors] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const currentCampus = state.campuses.find(c => c.campus_id === state.currentCampusId) || state.campuses[0];
  const campusFacilities = state.facilities.filter(f => f.campus_id === state.currentCampusId);
  const selectedFacility = state.facilities.find(f => f.facility_id === selectedFacilityId) || campusFacilities[0];

  // PostGIS Proximity Query Result
  const spatialDispatch = useMemo(() => {
    if (!selectedFacility) return [];
    return db.getSpatialPantryDispatch(selectedFacility.facility_id, dispatchRadius);
  }, [db, selectedFacility, dispatchRadius]);

  // Spatial Bounding Box & Geo-Projection Math
  const { bounds, projectedFacilities, projectedPantries } = useMemo(() => {
    const allLats: number[] = [currentCampus.lat];
    const allLngs: number[] = [currentCampus.lng];

    campusFacilities.forEach(f => {
      allLats.push(f.lat);
      allLngs.push(f.lng);
    });

    state.pantryPartners.forEach(p => {
      allLats.push(p.lat);
      allLngs.push(p.lng);
    });

    const minLat = Math.min(...allLats) - 0.015;
    const maxLat = Math.max(...allLats) + 0.015;
    const minLng = Math.min(...allLngs) - 0.018;
    const maxLng = Math.max(...allLngs) + 0.018;

    // Projection Dimensions (SVG ViewBox 800x520)
    const mapWidth = 800;
    const mapHeight = 520;
    const padding = 50;

    const project = (lat: number, lng: number) => {
      const x = padding + ((lng - minLng) / (maxLng - minLng)) * (mapWidth - padding * 2);
      // Invert Y axis for standard SVG coordinate space (North is Up)
      const y = mapHeight - (padding + ((lat - minLat) / (maxLat - minLat)) * (mapHeight - padding * 2));
      return { x, y };
    };

    const projFacilities = campusFacilities.map(f => {
      const pos = project(f.lat, f.lng);
      // Calculate today's waste volume for this facility to render spatial heatmap intensity
      const facilityWastes = state.wastes.filter(w => w.facility_id === f.facility_id && w.waste_date === state.selectedDate);
      const todayWasteKg = Math.round(facilityWastes.reduce((acc, curr) => acc + curr.waste_quantity, 0) * 10) / 10;
      const todayWasteCost = Math.round(facilityWastes.reduce((acc, curr) => acc + curr.estimated_waste_cost, 0));

      return {
        ...f,
        x: pos.x,
        y: pos.y,
        todayWasteKg,
        todayWasteCost
      };
    });

    const projPantries = state.pantryPartners.map(p => {
      const pos = project(p.lat, p.lng);
      const dispatchInfo = spatialDispatch.find(d => d.pantry_id === p.pantry_id);
      return {
        ...p,
        x: pos.x,
        y: pos.y,
        distanceMeters: dispatchInfo?.distance_meters || 0,
        distanceKm: dispatchInfo?.distance_km || '0',
        isWithinRadius: dispatchInfo?.is_within_radius ?? false
      };
    });

    return {
      bounds: { minLat, maxLat, minLng, maxLng },
      projectedFacilities: projFacilities,
      projectedPantries: projPantries
    };
  }, [currentCampus, campusFacilities, state.pantryPartners, state.wastes, state.selectedDate, spatialDispatch]);

  const selectedProjFacility = projectedFacilities.find(f => f.facility_id === selectedFacilityId) || projectedFacilities[0];

  // Convert meters to approximate SVG pixel radius
  const svgRadiusPixels = useMemo(() => {
    if (!bounds) return 100;
    const latSpanKm = (bounds.maxLat - bounds.minLat) * 111; // 1 deg lat ≈ 111 km
    const mapHeightPx = 420;
    const pxPerKm = mapHeightPx / Math.max(1, latSpanKm);
    return Math.max(20, (dispatchRadius / 1000) * pxPerKm * zoomLevel);
  }, [bounds, dispatchRadius, zoomLevel]);

  // Handle Rescue Dispatch Simulation
  const handleDispatchRescue = (pantry: { pantry_name?: string; partner_name?: string; contact_person?: string; [key: string]: any }) => {
    const name = pantry.pantry_name || pantry.partner_name || 'Food Pantry';
    const contact = pantry.contact_person || 'Coordinator';
    setDispatchSuccess(`Dispatched surplus rescue vehicle to "${name}" (${contact}). Manifest logged to PostgreSQL WAL audit trail.`);
    setTimeout(() => setDispatchSuccess(null), 6000);
  };

  const handleFacilityClick = (f: Facility) => {
    setSelectedFacilityId(f.facility_id);
    if (onSelectFacility) {
      onSelectFacility(f.facility_id);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header Bar */}
      <div className="harness-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              PostGIS Spatial Engine
            </span>
            <span className="text-xs text-[var(--color-graphite)] font-mono">
              SRID 4326 &bull; R-Tree GiST Index: <code className="text-[#70dcd3]">idx_facility_location_gist</code>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-[var(--color-pure-white)] flex items-center gap-2.5 mt-1.5 tracking-[0.056em] font-display">
            <Compass className="w-6 h-6 text-[#70dcd3]" />
            Geospatial Facility Map &amp; PostGIS Rescue Routing
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-graphite)] mt-0.5">
            Real-time geodetic coordinate mapping across dining facilities, biometric turnstiles, and food rescue pantry partners.
          </p>
        </div>

        {/* Global Radius & Layer Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Radius Slider HUD */}
          <div className="flex items-center gap-2 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] px-3 py-1.5 rounded-full text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-[#70dcd3] animate-pulse" />
            <span className="text-[var(--color-graphite)]">ST_DWithin:</span>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={dispatchRadius}
              onChange={(e) => setDispatchRadius(Number(e.target.value))}
              className="accent-[#70dcd3] cursor-pointer w-20 sm:w-28"
            />
            <span className="text-[#70dcd3] font-bold w-14 text-right">
              {(dispatchRadius / 1000).toFixed(1)} km
            </span>
          </div>

          {/* Layer Toggles */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              showHeatmap 
                ? 'bg-[#70dcd3] text-[#070707] border-[#70dcd3] font-semibold' 
                : 'bg-[var(--color-obsidian)] border-[var(--color-iron-edge)] text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            Waste Heatmap
          </button>

          <button
            onClick={() => setShowDispatchVectors(!showDispatchVectors)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              showDispatchVectors 
                ? 'bg-[#0092e4] text-[#ffffff] border-[#0092e4] font-semibold' 
                : 'bg-[var(--color-obsidian)] border-[var(--color-iron-edge)] text-[var(--color-graphite)] hover:text-[var(--color-pure-white)]'
            }`}
          >
            Rescue Vectors
          </button>
        </div>
      </div>

      {/* Dispatch Success Alert */}
      {dispatchSuccess && (
        <div className="p-4 bg-[var(--color-obsidian)] border border-[#75ae4c] rounded-[16px] text-[#70dcd3] text-xs flex items-center justify-between gap-3 font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-[#75ae4c] shrink-0" />
            <span>{dispatchSuccess}</span>
          </div>
          <button 
            onClick={() => setDispatchSuccess(null)}
            className="text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] text-xs cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Spatial Map Canvas (2 Cols) + Facility Inspector HUD (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spatial Map Canvas Container (Span 2) */}
        <div className="lg:col-span-2 harness-card rounded-[20px] p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
          
          {/* Top Canvas HUD Toolbar */}
          <div className="flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--color-graphite)]">
              <MapPin className="w-3.5 h-3.5 text-[#70dcd3]" />
              <span>Campus: <strong className="text-[var(--color-pure-white)]">{currentCampus.name}</strong></span>
              <span className="hidden sm:inline text-[var(--color-iron-edge)]">|</span>
              <span className="hidden sm:inline text-[10px] text-[#0092e4]">
                GPS: {currentCampus.lat.toFixed(4)}°N, {currentCampus.lng.toFixed(4)}°E
              </span>
            </div>

            {/* Filter Facility Types */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="harness-input rounded-[5px] px-2 py-1 text-[11px] text-[var(--color-pure-white)] bg-[var(--color-obsidian)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Facility Types</option>
                <option value="CENTRAL_MESS">Central Dining Halls</option>
                <option value="HOSTEL_MESS">Hostel Messes</option>
                <option value="CAFETERIA">Cafeterias</option>
                <option value="NIGHT_CANTEEN">Night Canteens</option>
              </select>
            </div>
          </div>

          {/* Interactive SVG Vector Map Viewport */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[var(--color-void-canvas)] border border-[var(--color-steel-border)] rounded-[16px] overflow-hidden shadow-inner flex items-center justify-center">
            
            {/* Background Vector Map Grid Lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#70dcd3_1px,transparent_1px)] [background-size:24px_24px]" />

            <svg 
              viewBox="0 0 800 520" 
              className="w-full h-full select-none"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
            >
              <defs>
                {/* Radial Glow Gradient for Active Facility Geofence Radius */}
                <radialGradient id="geofenceGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#70dcd3" stopOpacity={isDark ? "0.18" : "0.12"} />
                  <stop offset="70%" stopColor="#70dcd3" stopOpacity={isDark ? "0.05" : "0.03"} />
                  <stop offset="100%" stopColor="#70dcd3" stopOpacity="0" />
                </radialGradient>

                {/* Pulsing Waste Heatmap Gradient */}
                <radialGradient id="wasteHeatGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>

                {/* Rescue Vector Animated Marker */}
                <marker id="rescueArrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#0092e4" />
                </marker>
              </defs>

              {/* Geographic Contour Lines / Campus Perimeter Representation */}
              <polygon
                points="120,80 680,60 740,440 180,470"
                fill="none"
                stroke={isDark ? "#22222a" : "#cbd5e1"}
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* 1. PostGIS Geodetic Radius Buffer Ring (ST_DWithin Buffer) */}
              {selectedProjFacility && showRadiusRings && (
                <g>
                  {/* Outer Buffer Fill */}
                  <circle
                    cx={selectedProjFacility.x}
                    cy={selectedProjFacility.y}
                    r={svgRadiusPixels}
                    fill="url(#geofenceGlow)"
                    stroke="#70dcd3"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Intermediate 50% Ring */}
                  <circle
                    cx={selectedProjFacility.x}
                    cy={selectedProjFacility.y}
                    r={svgRadiusPixels * 0.5}
                    fill="none"
                    stroke="#70dcd3"
                    strokeWidth="0.75"
                    strokeDasharray="2 4"
                    opacity="0.5"
                  />
                  {/* Buffer Radius Metric Tag */}
                  <text
                    x={selectedProjFacility.x + 10}
                    y={selectedProjFacility.y - svgRadiusPixels + 14}
                    fill="#70dcd3"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ST_DWithin ({dispatchRadius}m Buffer)
                  </text>
                </g>
              )}

              {/* 2. PostGIS Dispatch Vector Connection Lines (ST_Distance_Sphere) */}
              {selectedProjFacility && showDispatchVectors && projectedPantries.map(p => {
                const isDispatched = p.isWithinRadius;
                return (
                  <g key={`vector-${p.pantry_id}`}>
                    <line
                      x1={selectedProjFacility.x}
                      y1={selectedProjFacility.y}
                      x2={p.x}
                      y2={p.y}
                      stroke={isDispatched ? "#0092e4" : "#2e3038"}
                      strokeWidth={isDispatched ? "1.5" : "1"}
                      strokeDasharray={isDispatched ? "4 2" : "2 4"}
                      opacity={isDispatched ? 0.8 : 0.3}
                      markerEnd={isDispatched ? "url(#rescueArrow)" : undefined}
                    />
                    {isDispatched && (
                      <text
                        x={(selectedProjFacility.x + p.x) / 2}
                        y={(selectedProjFacility.y + p.y) / 2 - 4}
                        fill="#0092e4"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="font-semibold"
                      >
                        {p.distanceKm} km
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 3. Waste Heatmap Spatial Intensity Halos */}
              {showHeatmap && projectedFacilities.map(f => {
                if (f.todayWasteKg <= 0) return null;
                const heatRadius = Math.min(60, 20 + f.todayWasteKg * 1.5);
                return (
                  <circle
                    key={`heat-${f.facility_id}`}
                    cx={f.x}
                    cy={f.y}
                    r={heatRadius}
                    fill="url(#wasteHeatGlow)"
                    pointerEvents="none"
                  />
                );
              })}

              {/* 4. Food Rescue Pantry Partner Nodes */}
              {projectedPantries.map(p => {
                const isDispatched = p.isWithinRadius;
                const displayName = p.partner_name || p.pantry_name || 'Pantry';
                return (
                  <g 
                    key={p.pantry_id}
                    transform={`translate(${p.x}, ${p.y})`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNode({ id: p.pantry_id, type: 'pantry', name: displayName, lat: p.lat ?? 0, lng: p.lng ?? 0 })}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleDispatchRescue(p)}
                  >
                    {/* Outer circle */}
                    <circle
                      r="9"
                      fill={isDispatched ? (isDark ? "#141418" : "#ffffff") : "#22222a"}
                      stroke={isDispatched ? "#0092e4" : "#60606c"}
                      strokeWidth="2"
                    />
                    {/* Inner pantry icon dot */}
                    <circle
                      r="4"
                      fill={isDispatched ? "#0092e4" : "#60606c"}
                    />
                    {/* Node Label */}
                    <text
                      y="18"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      fontWeight="600"
                      fill={isDispatched ? (isDark ? "#ffffff" : "#0f172a") : "#60606c"}
                      textAnchor="middle"
                      className="transition-colors"
                    >
                      {displayName.split(' ')[0]} Pantry
                    </text>
                  </g>
                );
              })}

              {/* 5. Campus Facility Nodes */}
              {projectedFacilities.map(f => {
                const isSelected = f.facility_id === selectedFacilityId;
                const isFiltered = filterType === 'ALL' || f.facility_type === filterType;
                if (!isFiltered) return null;

                return (
                  <g 
                    key={f.facility_id}
                    transform={`translate(${f.x}, ${f.y})`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNode({ id: f.facility_id, type: 'facility', name: f.facility_name, lat: f.lat, lng: f.lng })}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleFacilityClick(f)}
                  >
                    {/* Selection Active Ring */}
                    {isSelected && (
                      <circle
                        r="18"
                        fill="none"
                        stroke="#70dcd3"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Facility Base Shape */}
                    <rect
                      x="-11"
                      y="-11"
                      width="22"
                      height="22"
                      rx="6"
                      fill={isSelected ? "#70dcd3" : (isDark ? "#0d0e12" : "#ffffff")}
                      stroke={isSelected ? "#ffffff" : (f.todayWasteKg > 15 ? "#f43f5e" : "#d9dae5")}
                      strokeWidth="2"
                      className="transition-all duration-200 group-hover:scale-110"
                    />

                    {/* Inner Glyph / Status */}
                    <circle
                      r="3.5"
                      fill={isSelected ? "#070707" : (f.todayWasteKg > 15 ? "#f43f5e" : "#70dcd3")}
                    />

                    {/* Facility Label & Capacity Callout */}
                    <text
                      y="-16"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={isSelected ? "#70dcd3" : (isDark ? "#ffffff" : "#0f172a")}
                      textAnchor="middle"
                    >
                      {f.facility_code}
                    </text>
                    
                    {f.todayWasteKg > 0 && (
                      <text
                        y="22"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#f43f5e"
                        textAnchor="middle"
                      >
                        {f.todayWasteKg} kg waste
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Bottom Left Coordinate HUD */}
            <div className="absolute bottom-3 left-3 bg-[var(--color-carbon-plate)]/90 backdrop-blur-xs border border-[var(--color-iron-edge)] rounded-[8px] px-2.5 py-1.5 font-mono text-[10px] text-[var(--color-graphite)] space-y-0.5 shadow-sm">
              <div className="text-[var(--color-pure-white)] font-semibold flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-[#70dcd3]" />
                <span>PostGIS Coordinate Cursor:</span>
              </div>
              <div>
                {hoveredNode ? (
                  <span>
                    <strong className="text-[#70dcd3]">{hoveredNode.name}</strong>: POINT({hoveredNode.lng.toFixed(5)} {hoveredNode.lat.toFixed(5)})
                  </span>
                ) : (
                  <span>POINT({currentCampus.lng.toFixed(5)} {currentCampus.lat.toFixed(5)}) &bull; EPSG:4326</span>
                )}
              </div>
            </div>

            {/* Zoom Controls Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 bg-[var(--color-carbon-plate)]/90 border border-[var(--color-iron-edge)] rounded-[8px] p-1 shadow-sm">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
                className="p-1 text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-obsidian)] rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
                className="p-1 text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-obsidian)] rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoomLevel(1)}
                className="p-1 text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-obsidian)] rounded cursor-pointer"
                title="Reset Zoom"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--color-graphite)] font-mono pt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-[#70dcd3] border border-[#ffffff] inline-block" />
                <span>Selected Facility</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0092e4] inline-block" />
                <span>Rescue Pantry (&lt;{dispatchRadius / 1000}km)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block" />
                <span>High Waste Density</span>
              </div>
            </div>

            <div className="text-[10px] text-[var(--color-cinder)]">
              Query: <code>SELECT pantry_name, ST_Distance(f.geom, p.geom)</code>
            </div>
          </div>

        </div>

        {/* Selected Facility Inspector & Proximity Dispatch HUD (Span 1) */}
        <div className="harness-card rounded-[20px] p-5 space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Facility Header */}
            <div className="border-b border-[var(--color-steel-border)] pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="harness-badge harness-badge-mint text-[9px] uppercase">
                  {selectedFacility?.facility_type.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-graphite)]">
                  ID: {selectedFacility?.facility_code}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[var(--color-pure-white)]">
                {selectedFacility?.facility_name}
              </h3>
              <p className="text-xs text-[var(--color-graphite)] font-mono">
                PostGIS: POINT({selectedFacility?.lng.toFixed(5)} {selectedFacility?.lat.toFixed(5)})
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-[12px] space-y-0.5">
                <span className="text-[10px] uppercase text-[var(--color-graphite)]">Seating Capacity</span>
                <div className="text-lg font-bold text-[var(--color-pure-white)] font-mono">
                  {selectedFacility?.dining_capacity}
                </div>
              </div>
              <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-[12px] space-y-0.5">
                <span className="text-[10px] uppercase text-[var(--color-graphite)]">Today's Waste</span>
                <div className="text-lg font-bold text-[#f43f5e] font-mono">
                  {selectedProjFacility?.todayWasteKg || 0} <span className="text-xs font-normal">kg</span>
                </div>
              </div>
            </div>

            {/* Active Proximity Pantry Partners List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--color-pure-white)] flex items-center gap-1.5 font-mono text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-[#0092e4]" />
                  Rescue Pantries Within {dispatchRadius / 1000}km
                </span>
                <span className="text-[10px] text-[#70dcd3] font-mono">
                  {spatialDispatch.filter(d => d.is_within_radius).length} Available
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {spatialDispatch.map(p => (
                  <div
                    key={p.pantry_id}
                    className={`p-2.5 rounded-[12px] border text-xs transition-all ${
                      p.is_within_radius 
                        ? 'bg-[var(--color-obsidian)] border-[var(--color-iron-edge)] hover:border-[#0092e4]' 
                        : 'bg-[var(--color-obsidian)]/40 border-transparent opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--color-pure-white)] truncate max-w-[150px]">
                        {p.pantry_name}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${
                        p.is_within_radius ? 'text-[#0092e4]' : 'text-[var(--color-cinder)]'
                      }`}>
                        {p.distance_km} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--color-graphite)]">
                      <span>Cap: {p.storage_capacity_kg} kg</span>
                      {p.is_within_radius ? (
                        <button
                          onClick={() => handleDispatchRescue(p)}
                          className="px-2 py-0.5 rounded-full bg-[#0092e4]/15 border border-[#0092e4] text-[#0092e4] hover:bg-[#0092e4] hover:text-[#ffffff] transition-all font-mono text-[10px] font-medium cursor-pointer"
                        >
                          Dispatch Surplus
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--color-cinder)] font-mono">Exceeds Buffer</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RLS Multi-Tenant Tenancy Notice */}
          <div className="pt-3 border-t border-[var(--color-steel-border)] flex items-center justify-between text-[10px] text-[var(--color-graphite)] font-mono">
            <span className="flex items-center gap-1 text-[#75ae4c]">
              <Shield className="w-3 h-3 text-[#75ae4c]" />
              Spatial RLS Bound
            </span>
            <span>Campus: {currentCampus.campus_code}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
