import { Calendar, Users, Shield, TrendingUp } from 'lucide-react';

interface StatsGridProps {
  eventsCount: number;
  usersCount: number;
  pendingCount: number;
  totalRevenue: number;
}

export function StatsGrid({ eventsCount, usersCount, pendingCount, totalRevenue }: StatsGridProps) {
  const stats = [
    {
      label: 'Total Events',
      value: eventsCount,
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Users',
      value: usersCount,
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Pending Approvals',
      value: pendingCount,
      icon: <Shield className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all"
        >
          <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}>
            {stat.icon}
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-1">{stat.label}</p>
          <h3>{stat.value}</h3>
        </div>
      ))}
    </div>
  );
}
