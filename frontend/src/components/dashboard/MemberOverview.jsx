import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function MemberOverview({ members }) {
  const sorted = [...members].sort(
    (a, b) => ((b.pledged_amount || 0) - (b.total_paid || 0)) - ((a.pledged_amount || 0) - (a.total_paid || 0))
  );

  const top = sorted.slice(0, 6);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "defaulted": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-sm">Top Outstanding</h3>
        <Link to="/members" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No members yet</p>
      ) : (
        <div className="space-y-2.5">
          {top.map((m) => {
            const remaining = (m.pledged_amount || 0) - (m.total_paid || 0);
            const progress = m.pledged_amount ? ((m.total_paid || 0) / m.pledged_amount) * 100 : 0;
            return (
              <Link
                key={m.id}
                to={`/members/${m.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {m.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(m.status)}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1.5">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold">KES {remaining.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">remaining</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}