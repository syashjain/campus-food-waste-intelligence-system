import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OperationsView } from './components/OperationsView';
import { ProcurementView } from './components/ProcurementView';
import { MasterDataView } from './components/MasterDataView';
import { ReportsView } from './components/ReportsView';
import { SqlWorkbenchView } from './components/SqlWorkbenchView';
import { DbmsLabView } from './components/DbmsLabView';
import { AuditLogView } from './components/AuditLogView';
import { LegalModal } from './components/LegalModal';
import { useRelationalDatabase } from './store/dbStore';
import { Database, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const { state } = useRelationalDatabase();

  return (
    <div className="min-h-screen harness-canvas text-[var(--color-pure-white)] flex flex-col font-sans selection:bg-[#70dcd3] selection:text-[#070707] transition-colors duration-200">
      {/* Top Header Command Deck Navigation */}
      <Navbar />

      {/* Main Command Deck Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Console Dock Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Viewport Content with Surface Stacking */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between scroll-smooth bg-[var(--color-void-canvas)] transition-colors duration-200">
          <div className="pb-10 p-3 sm:p-5 md:p-6 max-w-[1400px] w-full mx-auto space-y-6">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'operations' && <OperationsView />}
            {activeTab === 'procurement' && <ProcurementView />}
            {activeTab === 'master-data' && <MasterDataView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'sql-workbench' && <SqlWorkbenchView />}
            {activeTab === 'dbms-lab' && <DbmsLabView />}
            {activeTab === 'audit-log' && <AuditLogView />}
          </div>

          {/* Mission Control Engineering Footer */}
          <footer className="mt-auto border-t border-[var(--color-steel-border)] bg-[var(--color-carbon-plate)] px-6 py-6 text-xs text-[var(--color-graphite)] transition-colors duration-200">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-[var(--color-pure-white)]">
                <div className="h-8 w-8 rounded-full bg-[var(--color-obsidian)] border border-[var(--color-fog)] flex items-center justify-center text-[#70dcd3]">
                  <Database className="w-4 h-4 text-[#70dcd3]" />
                </div>
                <div>
                  <span className="font-semibold text-[var(--color-pure-white)] tracking-wider uppercase text-xs font-mono">
                    Campus Food Waste Intelligence System (CFWIS)
                  </span>
                  <span className="text-[11px] text-[var(--color-graphite)] block font-mono">
                    Enterprise Relational DBMS Architecture &bull; CS-601 / CS-402
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('sql-workbench')}
                  className="px-3.5 py-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] hover:border-[var(--color-fog)] transition-all cursor-pointer"
                >
                  SQL DDL &amp; Workbench
                </button>
                <button
                  onClick={() => setActiveTab('dbms-lab')}
                  className="px-3.5 py-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] hover:border-[var(--color-fog)] transition-all cursor-pointer"
                >
                  Architecture &amp; Proofs
                </button>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="px-3.5 py-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] hover:border-[var(--color-fog)] transition-all cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setLegalModal('terms')}
                  className="px-3.5 py-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] hover:border-[var(--color-fog)] transition-all cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto mt-4 pt-3 border-t border-[var(--color-steel-border)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--color-cinder)] font-mono">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#70dcd3]" />
                <span>Engine: PostgreSQL 15 | PostGIS 3.4 | PgBouncer Tx | HikariCP Sized</span>
              </div>
              <div className="mt-2 sm:mt-0 text-[var(--color-graphite)]">
                <span>Relational BCNF &bull; SSI Concurrency &bull; RLS Multi-Tenancy</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Privacy Policy & Terms Modal */}
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
}
