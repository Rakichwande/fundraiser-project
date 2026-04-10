import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import API from "@/api/apiClient";

export default function PaymentFormDialog({
  open,
  onOpenChange,
  members,
  preselectedMemberId,
  onSaved
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    member_id: "",
    amount: "",
    method: "cash",
    reference: "",
    notes: "",
  });

  // 🔹 Preselect member
  useEffect(() => {
    if (preselectedMemberId) {
      setForm((prev) => ({
        ...prev,
        member_id: preselectedMemberId,
      }));
    }
  }, [preselectedMemberId]);

  const selectedMember = members.find((m) => m.id === form.member_id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.member_id || !form.amount) return;
    if (saving) return;

    setSaving(true);

    try {
      const member = members.find((m) => m.id === form.member_id);
      const amount = parseFloat(form.amount);

      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      // ✅ ONLY CREATE PAYMENT (Backend handles totals)
      const res = await API.post("/payments", {
        member_id: form.member_id,
        member_name: member?.name,
        amount,
        method: form.method,
        reference: form.reference,
        notes: form.notes,
      });

      const newPayment = res.data;

      // ✅ Tell parent to update UI
      if (onSaved) {
        onSaved(newPayment);
      }

      // ✅ Close dialog
      onOpenChange(false);

      // ✅ Reset form
      setForm({
        member_id: "",
        amount: "",
        method: "cash",
        reference: "",
        notes: "",
      });

    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Member */}
          <div>
            <Label>Member *</Label>
            <Select
              value={form.member_id}
              onValueChange={(v) => setForm({ ...form, member_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} — KES {((m.pledged_amount || 0) - (m.total_paid || 0)).toLocaleString()} remaining
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {selectedMember && (
            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Pledged:</span>
                <span>KES {selectedMember.pledged_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid:</span>
                <span>KES {selectedMember.total_paid?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Remaining:</span>
                <span>
                  KES {(selectedMember.pledged_amount - selectedMember.total_paid).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <Label>Amount *</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="500"
              required
            />
          </div>

          {/* Method */}
          <div>
            <Label>Payment Method</Label>
            <Select
              value={form.method}
              onValueChange={(v) => setForm({ ...form, method: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div>
            <Label>Reference</Label>
            <Input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}