import { TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react";

export default function StatsCards({ members }) {
  const totalPledged = members.reduce((s, m) => s + (m.pledged_amount || 0), 0);
  const totalCollected = members.reduce((s, m) => s + (m.total_paid || 0), 0);
  const remaining = totalPledged - totalCollected;
  const overdue = members.filter((m) => m.status === "active" && (m.total_paid || 0) < (m.pledged_amount || 0)).length;
  const TARGET = 29000000;
  const progress = (totalCollected / TARGET) * 100;

  const stats = [
    {
      label: "Total Pledged",
      value: `KES ${totalPledged.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Collected",
      value: `KES ${totalCollected.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Remaining",
      value: `KES ${remaining.toLocaleString()}`,
      icon: DollarSign,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Outstanding Members",
      value: overdue,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      subtitle: `of ${members.length} total`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-heading font-bold mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
                )}
              </div>
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Campaign Progress</h3>
          <span className="text-sm font-bold text-primary">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>KES 0</span>
          <span>KES 29,000,000 target</span>
        </div>
      </div>
    </div>
  );
}