import moment from "moment";
import { CreditCard, UserPlus } from "lucide-react";

export default function RecentActivity({ payments, members }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 8);

  if (recentPayments.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No payments recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold text-sm mb-4">Recent Payments</h3>
      <div className="space-y-3">
        {recentPayments.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="bg-accent/10 text-accent p-2 rounded-lg">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.member_name}</p>
              <p className="text-xs text-muted-foreground">
                {moment(p.created_date).fromNow()}
              </p>
            </div>
            <span className="text-sm font-bold text-accent">
              +KES {p.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}