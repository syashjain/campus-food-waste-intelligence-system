import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[var(--color-carbon-plate)] border border-[var(--color-fog)] rounded-[20px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-[var(--color-pure-white)] transition-colors">
        
        {/* Header with Command Deck Styling */}
        <div className="px-6 py-4 border-b border-[var(--color-steel-border)] flex items-center justify-between bg-[var(--color-obsidian)] rounded-t-[20px]">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <div className="p-2 rounded-full bg-[var(--color-carbon-plate)] border border-[#70dcd3] text-[#70dcd3]">
                <Shield className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-[var(--color-carbon-plate)] border border-[#0092e4] text-[#0092e4]">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-base font-light text-[var(--color-pure-white)] tracking-[0.056em] font-display">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'}
              </h2>
              <span className="text-[10px] text-[var(--color-graphite)] font-mono">CFWIS Institutional Legal Protocol</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--color-graphite)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-obsidian)] border border-transparent hover:border-[var(--color-iron-edge)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-[var(--color-graphite)] font-sans">
          {type === 'privacy' ? (
            <>
              <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-[10px] text-[11px] text-[#70dcd3] font-mono">
                Effective Release: October 2026 &bull; Scope: On-Premise University Deployment
              </div>
              <p>
                The Campus Food Waste Intelligence System (CFWIS) operates on campus-controlled infrastructure. This Privacy Policy details how operational records, biometric headcount summaries, and administrative logins are managed.
              </p>
              
              <h3 className="text-sm font-semibold text-[var(--color-pure-white)] pt-2 border-b border-[var(--color-steel-border)] pb-1">
                1. Data Collected
              </h3>
              <p>
                The database stores operational parameters including mess facility identifiers, food item classifications, planned batch weights, turnstile headcount counts, scale weights, and user role identifiers. No personal financial payment card information is collected or processed.
              </p>

              <h3 className="text-sm font-semibold text-[var(--color-pure-white)] pt-2 border-b border-[var(--color-steel-border)] pb-1">
                2. Multi-Tenant Isolation
              </h3>
              <p>
                Tenant isolation is enforced natively via PostgreSQL Row-Level Security (RLS) policies. Operational mess managers and kitchen staff are strictly confined to their authorized campus facilities.
              </p>

              <h3 className="text-sm font-semibold text-[var(--color-pure-white)] pt-2 border-b border-[var(--color-steel-border)] pb-1">
                3. Audit and Forensics
              </h3>
              <p>
                All DDL and DML state changes are logged immutably in an append-only audit register with user identifier, client timestamp, and action metadata for academic accreditation.
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-[var(--color-obsidian)] border border-[var(--color-iron-edge)] rounded-[10px] text-[11px] text-[#0092e4] font-mono">
                Academic License &bull; Department of Computer Science &amp; Engineering
              </div>
              <p>
                This application represents an educational research implementation designed for university dining waste minimization, relational database verification, and predictive procurement.
              </p>

              <h3 className="text-sm font-semibold text-[var(--color-pure-white)] pt-2 border-b border-[var(--color-steel-border)] pb-1">
                1. Operational Scope
              </h3>
              <p>
                Users agree to interact with the database simulation adhering strictly to university dining health and safety standards. Simulated transactions must not conflict with active supply chain agreements.
              </p>

              <h3 className="text-sm font-semibold text-[var(--color-pure-white)] pt-2 border-b border-[var(--color-steel-border)] pb-1">
                2. Academic Honor Code
              </h3>
              <p>
                The schema, normalization proofs, SQL triggers, and spatial indices represent original curriculum artifacts protected under departmental open-access educational guidelines.
              </p>
            </>
          )}
        </div>

        {/* Footer with Pill CTA */}
        <div className="px-6 py-3.5 border-t border-[var(--color-steel-border)] bg-[var(--color-obsidian)] rounded-b-[20px] flex items-center justify-between">
          <span className="text-[11px] text-[var(--color-cinder)] font-mono">
            Document ID: POL-2026-Q4-V2
          </span>
          <button
            onClick={onClose}
            className="harness-btn-ghost rounded-full px-5 py-2 text-xs font-semibold hover:border-[var(--color-pure-white)] transition-all cursor-pointer"
          >
            Acknowledge &amp; Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
