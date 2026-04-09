import { Link } from "react-router-dom";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const statusStyles = {
  active: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  defaulted: "bg-red-100 text-red-700",
};

export default function MemberTable({ members, onEdit, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const maskPhone = (phone) => {
    if (isAdmin) return phone;
    if (!phone) return '';
    return phone.slice(0, 7) + '***' + phone.slice(-3);
  };
  if (members.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <p className="text-muted-foreground">No members found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Member</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Phone</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Pledged</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Paid</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Remaining</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => {
              const remaining = (m.pledged_amount || 0) - (m.total_paid || 0);
              const progress = m.pledged_amount ? ((m.total_paid || 0) / m.pledged_amount) * 100 : 0;
              return (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/members/${m.id}`} className="flex items-center gap-3 group">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                        {m.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{maskPhone(m.phone_number)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right">KES {(m.pledged_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right text-accent">KES {(m.total_paid || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right hidden md:table-cell">
                    KES {remaining.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${statusStyles[m.status] || statusStyles.active}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/members/${m.id}`}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(m)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(m)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}