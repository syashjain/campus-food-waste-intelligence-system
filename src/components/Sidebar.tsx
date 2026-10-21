import React from 'react';
import { 
  LayoutDashboard, 
  ChefHat, 
  ShoppingBag, 
  Building2, 
  FileText, 
  Terminal, 
  FlaskConical, 
  History, 
  Cpu
} from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';

export type ActiveTab = 
  | 'dashboard' 
  | 'operations' 
  | 'procurement' 
  | 'master-data' 
  | 'reports' 
  | 'sql-workbench' 
  | 'dbms-lab' 
  | 'audit-log';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { state } = useRelationalDatabase();
  const role = state.currentUserRole;

  const currentRoleObj = state.roles.find(r => r.role_code === state.currentUserRole);
  const currentUserObj = state.users.find(u => u.user_id === state.currentUserId);
  const currentCampusObj = state.campuses.find(c => c.campus_id === state.currentCampusId);

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Analytics Dashboard',
      icon: LayoutDashboard,
      badge: '8 KPIs',
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'MESS_MANAGER', 'ANALYST', 'STUDENT']
    },
    {
      id: 'operations' as ActiveTab,
      label: 'Daily Operations',
      icon: ChefHat,
      badge: 'Prep & Waste',
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'MESS_MANAGER', 'KITCHEN_STAFF']
    },
    {
      id: 'procurement' as ActiveTab,
      label: 'Procurement & Vendors',
      icon: ShoppingBag,
      badge: 'PO / Costs',
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'PROCUREMENT_MANAGER', 'ANALYST']
    },
    {
      id: 'master-data' as ActiveTab,
      label: 'Facilities & Food Items',
      icon: Building2,
      badge: '32 Items',
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'MESS_MANAGER']
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reporting Suite',
      icon: FileText,
      badge: '10 Reports',
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'MESS_MANAGER', 'ANALYST']
    },
    {
      id: 'sql-workbench' as ActiveTab,
      label: 'SQL Workbench',
      icon: Terminal,
      badge: '20+ Queries',
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'ANALYST', 'MESS_MANAGER', 'STUDENT', 'KITCHEN_STAFF', 'PROCUREMENT_MANAGER']
    },
    {
      id: 'dbms-lab' as ActiveTab,
      label: 'DBMS Academic Lab',
      icon: FlaskConical,
      badge: 'SSI / Triggers',
      highlight: true,
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'ANALYST', 'MESS_MANAGER', 'STUDENT', 'KITCHEN_STAFF', 'PROCUREMENT_MANAGER']
    },
    {
      id: 'audit-log' as ActiveTab,
      label: 'Audit & Forensic Log',
      icon: History,
      badge: `${state.auditLogs.length} events`,
      allowedRoles: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FINANCE_OFFICER', 'ANALYST']
    }
  ];

  return (
    <aside className="w-64 bg-[var(--color-carbon-plate)] border-r border-[var(--color-steel-border)] flex flex-col justify-between shrink-0 z-20 transition-colors duration-200">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-[var(--color-graphite)] uppercase tracking-[0.094em] flex items-center justify-between">
          <span>Command Modules</span>
          <span className="harness-badge harness-badge-mint text-[9px] uppercase">
            RLS Active
          </span>
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isPermitted = item.allowedRoles.includes(role);

            return (
              <button
                key={item.id}
                onClick={() => isPermitted && onSelectTab(item.id)}
                disabled={!isPermitted}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  !isPermitted
                    ? 'opacity-30 cursor-not-allowed text-[var(--color-cinder)]'
                    : isActive
                    ? 'bg-[var(--color-obsidian)] border border-[var(--color-fog)] text-[var(--color-pure-white)] font-semibold shadow-sm'
                    : 'text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-obsidian)] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive 
                      ? 'text-[#70dcd3]' 
                      : item.highlight 
                      ? 'text-[#0092e4]' 
                      : 'text-[var(--color-graphite)]'
                  }`} />
                  <span className="truncate tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[var(--color-void-canvas)] text-[#70dcd3] border border-[#70dcd3]/40'
                      : item.highlight
                      ? 'bg-[var(--color-obsidian)] text-[#a6e5f2] border border-[#0677d4]'
                      : 'text-[var(--color-cinder)]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* RLS Multi-Tenant Session Card */}
      <div className="p-3">
        <div className="harness-panel p-3.5 space-y-2 border border-[var(--color-iron-edge)] rounded-[16px] bg-[var(--color-obsidian)]">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-graphite)]">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#70dcd3] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#70dcd3]" />
              Session Context
            </span>
            <span className="harness-badge harness-badge-success text-[9px] py-0 px-1.5">
              SECURE
            </span>
          </div>
          
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-[var(--color-graphite)]">
              <span>User:</span>
              <span className="text-[var(--color-pure-white)] font-medium truncate max-w-[130px]" title={`${currentUserObj?.full_name || state.currentUserId} (${currentUserObj?.username || ''})`}>
                {currentUserObj?.full_name || currentUserObj?.username || state.currentUserId}
              </span>
            </div>
            <div className="flex justify-between items-center text-[var(--color-graphite)]">
              <span>Role:</span>
              <span className="text-[#a6e5f2] font-semibold truncate max-w-[130px]" title={currentRoleObj?.description || currentRoleObj?.role_name || state.currentUserRole}>
                {currentRoleObj?.role_name || state.currentUserRole}
              </span>
            </div>
            <div className="flex justify-between items-center text-[var(--color-graphite)]">
              <span>Campus:</span>
              <span className="text-[#70dcd3] font-medium truncate max-w-[130px]" title={`${currentCampusObj?.name} (${currentCampusObj?.city})`}>
                {currentCampusObj?.campus_code || state.currentCampusId}
              </span>
            </div>
            <div className="flex justify-between items-center text-[var(--color-graphite)]">
              <span>Facility:</span>
              <span className="text-[var(--color-pure-white)] truncate max-w-[130px]" title={state.facilities.find(f => f.facility_id === state.currentFacilityId)?.facility_name}>
                {state.facilities.find(f => f.facility_id === state.currentFacilityId)?.facility_name || 'All Facilities'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-iron-edge)] text-[10px] text-[var(--color-cinder)] font-mono leading-tight">
            RLS Policy: <code className="text-[#75ae4c]">campus_isolation_v2</code>
          </div>
        </div>
      </div>
    </aside>
  );
};
