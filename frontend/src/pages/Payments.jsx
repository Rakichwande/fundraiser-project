import { useState, useEffect } from "react";
import PaymentFormDialog from "../components/payments/PaymentFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Loader2, CreditCard } from "lucide-react";
import moment from "moment";
import API from "../api/apiClient";

const methodLabels = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Money",
  check: "Check",
  other: "Other",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // 🔹 Load Data (ONLY ONCE)
  const loadData = async () => {
  try {
    setLoading(true);

    const paymentsRes = await API.get("/payments");
    setPayments(paymentsRes.data || []);

    const membersRes = await API.get("/members");
    setMembers(membersRes.data || []);

  } catch (error) {
    console.error("Payments load error:", error);
    setPayments([]);
    setMembers([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  loadData();

  // safety timeout (prevents forever loading UI)
  const timer = setTimeout(() => {
    setLoading(false);
  }, 300);

  return () => clearTimeout(timer);
}, []);

  // ✅ NEW: Handle payment save WITHOUT re-fetch
  const handlePaymentSaved = (payment) => {
    setPayments((prev) => [...prev, payment]);

    // 🔥 Optional (ADVANCED): update member total locally
    setMembers((prev) =>
      prev.map((m) =>
        m.id === payment.member_id
          ? { ...m, total_paid: (m.total_paid || 0) + payment.amount }
          : m
      )
    );
  };

  // 🔹 Helper
  const getMemberName = (member_id) => {
    const member = members.find((m) => m.id === member_id);
    return member ? member.name : "Unknown";
  };

  // 🔹 Filter
  const filtered = payments.filter((p) => {
    const memberName = getMemberName(p.member_id).toLowerCase();

    return (
      memberName.includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // 🔹 Total
  const totalCollected = payments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  // 🔹 Export
  const handleExport = () => {
    const headers = ["Date", "Member", "Amount", "Method", "Reference", "Notes"];

    const rows = filtered.map((p) => [
      moment(p.created_date).format("YYYY-MM-DD"),
      getMemberName(p.member_id),
      p.amount,
      methodLabels[p.method] || p.method,
      p.reference || "",
      p.notes || "",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payments_export.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  // 🔹 Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 🔹 UI
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {payments.length} payments · KES {totalCollected.toLocaleString()} collected
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>

          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by member name or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No payments found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs uppercase">Member</th>
                  <th className="px-4 py-3 text-right text-xs uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs uppercase hidden sm:table-cell">Method</th>
                  <th className="px-4 py-3 text-left text-xs uppercase hidden md:table-cell">Reference</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {moment(p.created_date).format("MMM D, YYYY")}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium">
                      {getMemberName(p.member_id)}
                    </td>

                    <td className="px-4 py-3 text-sm font-bold text-right">
                      KES {p.amount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-sm hidden sm:table-cell">
                      {methodLabels[p.method] || p.method}
                    </td>

                    <td className="px-4 py-3 text-sm hidden md:table-cell">
                      {p.reference || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <PaymentFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          members={members}
          onSaved={handlePaymentSaved} 
        />
      )}
    </div>
  );
}