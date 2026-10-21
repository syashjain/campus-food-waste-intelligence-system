import React from 'react';
import { Database, ShieldCheck, MapPin, Calendar, UserCheck, Server } from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';
import { RoleCategory } from '../types/db';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { state, db } = useRelationalDatabase();

  const handleRoleChange = (newRole: RoleCategory) => {
    const userForRole = state.users.find(u => u.role_code === newRole) || state.users[0];
    db.setSessionContext(state.currentCampusId, userForRole.user_id, newRole);
  };

  const handleCampusChange = (newCampusId: string) => {
    db.setSessionContext(newCampusId, state.currentUserId, state.currentUserRole);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-carbon-plate)] border-b border-[var(--color-steel-border)] text-[var(--color-pure-white)] transition-colors duration-200">
      <div className="px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 max-w-[1400px] mx-auto">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[var(--color-obsidian)] border border-[var(--color-fog)] flex items-center justify-center text-[#70dcd3] shadow-sm">
            <Database className="w-5 h-5 text-[#70dcd3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-[0.056em] text-base sm:text-lg text-[var(--color-pure-white)] font-display">
                CFWIS
              </span>
              <span className="harness-badge harness-badge-mint uppercase text-[10px]">
                PostgreSQL 15 + PostGIS
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-graphite)] font-normal hidden sm:block tracking-wide">
              Campus Food Waste Intelligence System &bull; Mission Control Command Deck
            </p>
          </div>
        </div>

        {/* Global Controls: Multi-Tenant RLS Campus, Role, Date, and Light/Dark Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          
          {/* Multi-Tenant Campus Selector */}
          <div className="flex items-center gap-1.5 harness-input px-3 py-1.5 rounded-[5px] text-xs min-h-[36px]">
            <MapPin className="w-3.5 h-3.5 text-[#70dcd3] shrink-0" />
            <span className="text-[var(--color-graphite)] font-medium text-[11px]">Tenant:</span>
            <select
              value={state.currentCampusId}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="bg-transparent text-[#70dcd3] font-medium focus:outline-none cursor-pointer text-xs"
            >
              {state.campuses.map(c => (
                <option key={c.campus_id} value={c.campus_id} className="bg-[var(--color-carbon-plate)] text-[var(--color-pure-white)]">
                  {c.campus_code} ({c.city})
                </option>
              ))}
            </select>
          </div>

          {/* Active Facility */}
          <div className="hidden md:flex items-center gap-1.5 harness-input px-3 py-1.5 rounded-[5px] text-xs min-h-[36px]">
            <Server className="w-3.5 h-3.5 text-[#0092e4] shrink-0" />
            <select
              value={state.currentFacilityId}
              onChange={(e) => db.setSessionContext(state.currentCampusId, state.currentUserId, state.currentUserRole, e.target.value)}
              className="bg-transparent text-[var(--color-pure-white)] font-normal focus:outline-none cursor-pointer max-w-[170px] truncate text-xs"
            >
              {db.getRlsFacilities().map(f => (
                <option key={f.facility_id} value={f.facility_id} className="bg-[var(--color-carbon-plate)] text-[var(--color-pure-white)]">
                  {f.facility_name}
                </option>
              ))}
            </select>
          </div>

          {/* Role-Based Access Control Switcher */}
          <div className="flex items-center gap-1.5 harness-input px-3 py-1.5 rounded-[5px] text-xs min-h-[36px]">
            <UserCheck className="w-3.5 h-3.5 text-[#a6e5f2] shrink-0" />
            <span className="text-[var(--color-graphite)] font-medium text-[11px]">Role:</span>
            <select
              value={state.currentUserRole}
              onChange={(e) => handleRoleChange(e.target.value as RoleCategory)}
              className="bg-transparent text-[#a6e5f2] font-medium focus:outline-none cursor-pointer text-xs max-w-[160px] sm:max-w-[190px] truncate"
              title={state.roles.find(r => r.role_code === state.currentUserRole)?.role_name}
            >
              {state.roles.map(r => (
                <option key={r.role_id} value={r.role_code} className="bg-[var(--color-carbon-plate)] text-[var(--color-pure-white)]">
                  {r.role_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="hidden lg:flex items-center gap-1.5 harness-input px-3 py-1.5 rounded-[5px] text-xs min-h-[36px]">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-graphite)] shrink-0" />
            <input
              type="date"
              value={state.selectedDate}
              onChange={(e) => db.setSelectedDate(e.target.value)}
              className="bg-transparent text-[var(--color-pure-white)] focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <ThemeToggle />

          {/* RLS Active Policy Badge */}
          <div className="harness-badge harness-badge-success text-xs hidden xl:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#75ae4c]" />
            <span>RLS Active</span>
          </div>

        </div>
      </div>
    </header>
  );
};
