import { CheckCircle, XCircle, Shield } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: string;
  approval_status: string;
  created_at: string;
}

interface PendingOrganizersProps {
  pendingOrganizers: User[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewAll?: () => void;
  preview?: boolean;
}

export function PendingOrganizers({ pendingOrganizers, onApprove, onReject, onViewAll, preview = false }: PendingOrganizersProps) {
  if (preview) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h4>Pending Organizers</h4>
          <button 
            onClick={onViewAll}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            View All
          </button>
        </div>
        {pendingOrganizers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-sm">Email</th>
                  <th className="px-4 py-3 text-left text-sm">Date</th>
                  <th className="px-4 py-3 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrganizers.slice(0, 5).map(org => (
                  <tr key={org.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-sm">{org.email}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onApprove(org.id)}
                          className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onReject(org.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            No pending organizers
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6">
      <h4 className="mb-4">Pending Organizer Approvals</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-sm">ID</th>
              <th className="px-4 py-3 text-left text-sm">Email</th>
              <th className="px-4 py-3 text-left text-sm">Joined Date</th>
              <th className="px-4 py-3 text-left text-sm">Status</th>
              <th className="px-4 py-3 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrganizers.map(org => (
              <tr key={org.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 text-sm">{org.id}</td>
                <td className="px-4 py-3 text-sm">{org.email}</td>
                <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  {new Date(org.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    {org.approval_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onApprove(org.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button 
                      onClick={() => onReject(org.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pendingOrganizers.length === 0 && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No pending organizer requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
