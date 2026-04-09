import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import API from "@/api/apiClient";

// Generate default personalized message for a member
function generateMessage(member) {
  const remaining = (member.pledged_amount || 0) - (member.total_paid || 0);

  return `Dear ${member.name},

This is a friendly reminder about your pledge.

Pledged: KES ${(member.pledged_amount || 0).toLocaleString()}
Paid: KES ${(member.total_paid || 0).toLocaleString()}
Remaining: KES ${remaining.toLocaleString()}

Thank you for your continued support!`;
}

export default function SendReminderDialog({
  open,
  onOpenChange,
  members,
  preselectedIds = [],
  onSent
}) {
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState(preselectedIds);
  const [customMessage, setCustomMessage] = useState("");

  // Members eligible for reminders
  const eligibleMembers = members.filter(
    (m) => m.status === "active" && (m.total_paid || 0) < (m.pledged_amount || 0)
  );

  // Toggle a single member selection
  const toggleMember = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select or deselect all eligible members
  const selectAll = () => {
    if (selectedIds.length === eligibleMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleMembers.map((m) => m.id));
    }
  };

  // Handle sending reminders
  const handleSend = async () => {
    if (selectedIds.length === 0) return;

    setSending(true);

    try {
      const selected = members.filter((m) => selectedIds.includes(m.id));
      const newMessages = [];

      for (const member of selected) {
        const messageContent = customMessage || generateMessage(member);

        // 🔹 Save message to backend
        const res = await API.post("/messages", {
          member_id: member.id,
          member_name: member.name,
          message_content: messageContent,
          channel: "whatsapp", // future integration
          status: "sent",
        });

        newMessages.push(res.data);

        // 🔹 Update last contacted timestamp
        await API.put(`/members/${member.id}`, {
          last_contacted: new Date().toISOString(),
        });
      }

      toast({
        title: "Reminders Sent",
        description: `Successfully sent ${selected.length} reminder(s).`,
      });

      onSent(newMessages); // update parent with new messages
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast({
        title: "Error",
        description: "Failed to send reminders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Send Reminders</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Select Members ({selectedIds.length} selected)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-xs h-7"
              >
                {selectedIds.length === eligibleMembers.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="border border-border rounded-lg max-h-48 overflow-y-auto divide-y divide-border">
              {eligibleMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No members with outstanding balances
                </p>
              ) : (
                eligibleMembers.map((m) => {
                  const remaining =
                    (m.pledged_amount || 0) - (m.total_paid || 0);

                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIds.includes(m.id)}
                        onCheckedChange={() => toggleMember(m.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          KES {remaining.toLocaleString()} remaining
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <Label>Custom Message (optional)</Label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              placeholder="Leave blank to use the default personalized message..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              If empty, each member gets a personalized message automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleSend}
              disabled={sending || selectedIds.length === 0}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}