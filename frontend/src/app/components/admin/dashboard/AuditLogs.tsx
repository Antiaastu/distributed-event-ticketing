import { Activity } from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  details: string;
  created_at: string;
  user_id: number;
}

interface AuditLogsProps {
  logs: AuditLog[];
}

export function AuditLogs({ logs }: AuditLogsProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6">
      <h4 className="mb-4">System Audit Logs</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-sm">Time</th>
              <th className="px-4 py-3 text-left text-sm">Action</th>
              <th className="px-4 py-3 text-left text-sm">Details</th>
              <th className="px-4 py-3 text-left text-sm">Admin ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{log.action}</td>
                <td className="px-4 py-3 text-sm">{log.details}</td>
                <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{log.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
