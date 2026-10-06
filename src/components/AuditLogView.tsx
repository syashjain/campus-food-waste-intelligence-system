import React from 'react';
import { History, Database } from 'lucide-react';
import { useRelationalDatabase } from '../store/dbStore';

export const AuditLogView: React.FC = () => {
  const { state } = useRelationalDatabase();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 harness-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="harness-badge harness-badge-mint">
              PRD Section 18 &amp; 21
            </span>
            <span className="text-xs text-[#aeaeb7]">Forensic Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-[#ffffff] flex items-center gap-2.5 mt-2 tracking-[0.056em]">
            <History className="w-5 h-5 text-[#70dcd3]" />
            Immutable System Audit Ledger (audit_log)
          </h1>
          <p className="text-xs sm:text-sm text-[#aeaeb7] mt-1">
            Append-only forensic ledger capturing row-level JSON deltas, executed via PostgreSQL triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141418] border border-[#2e3038] text-xs font-mono text-[#aeaeb7]">
          <Database className="w-3.5 h-3.5 text-[#70dcd3]" />
          <span>{state.auditLogs.length} Logged Transactions</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="harness-card rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141418] text-[#aeaeb7] font-semibold border-b border-[#22222a] sticky top-0">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Table Name</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Captured Delta (JSONB Payload)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222a]">
              {state.auditLogs.slice().reverse().map(log => (
                <tr key={log.audit_id} className="hover:bg-[#141418]/60 transition-colors">
                  <td className="py-3 px-4 text-[#aeaeb7] font-bold">#{log.audit_id}</td>
                  <td className="py-3 px-4 text-[#ffffff] whitespace-nowrap">
                    {new Date(log.executed_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[#0092e4] font-bold">{log.table_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      log.operation_type === 'INSERT' ? 'border border-[#75ae4c] text-[#75ae4c]' :
                      log.operation_type === 'UPDATE' ? 'border border-[#0092e4] text-[#0092e4]' :
                      log.operation_type === 'ROLLBACK' ? 'border border-[#f43f5e] text-[#f43f5e]' :
                      'border border-[#2e3038] text-[#aeaeb7]'
                    }`}>
                      {log.operation_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#70dcd3] font-mono break-all max-w-md">
                    {JSON.stringify(log.new_data || log.old_data || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
