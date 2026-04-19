import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import API from "@/api/apiClient";

export default function MemberFormDialog({ open, onOpenChange, member, onSaved }) {
  const isEdit = !!member;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    pledged_amount: "",
    status: "active",
    notes: "",
  });

  // 🔹 Load member data
  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || "",
        phone_number: member.phone_number || "",
        pledged_amount: member.pledged_amount || "",
        status: member.status || "active",
        notes: member.notes || "",
      });
    } else {
      setForm({
        name: "",
        phone_number: "",
        pledged_amount: "",
        status: "active",
        notes: "",
      });
    }
  }, [member, open]);

  // ✅ CLEAN SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;
    setSaving(true);

    try {
      const data = {
        name: form.name,
        phone_number: form.phone_number,
        pledged_amount: parseFloat(form.pledged_amount) || 0,
        notes: form.notes || "",
      };

      let response;

      if (isEdit) {
        // UPDATE
        response = await API.put(`/members/${member.id}`, data);
      } else {
        // CREATE
        response = await API.post("/members", data);
      }

      if (onSaved) {
        onSaved(response.data);
      }

      onOpenChange(false);

    } catch (error) {
      console.error("Error saving member:", error.response?.data || error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit Member" : "Add Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div>
            <Label>Full Name *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          {/* Phone */}
          <div>
            <Label>Phone Number *</Label>
            <Input
              required
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="+254..."
            />
          </div>

          {/* Pledge */}
          <div>
            <Label>Pledged Amount *</Label>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.pledged_amount}
              onChange={(e) => setForm({ ...form, pledged_amount: e.target.value })}
              placeholder="1000"
            />
          </div>

          {/* Status (only useful for edit visually) */}
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Update" : "Add Member"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}