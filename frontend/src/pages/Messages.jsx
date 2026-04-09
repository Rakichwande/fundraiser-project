import { useState, useEffect } from "react";
import SendReminderDialog from "../components/messages/SendReminderDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, Loader2, MessageSquare } from "lucide-react";
import moment from "moment";
import API from "../api/apiClient";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showReminder, setShowReminder] = useState(false);

  // 🔹 Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [msgRes, memberRes] = await Promise.all([
        API.get("/messages"),
        API.get("/members"),
      ]);
      setMessages(msgRes.data);
      setMembers(memberRes.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Helper: Get member name
  const getMemberName = (member_id) => {
    const member = members.find((m) => m.id === member_id);
    return member ? member.name : "Unknown";
  };

  // 🔹 Filtered messages
  const filtered = messages.filter((msg) => {
    const memberName = getMemberName(msg.member_id).toLowerCase();
    return (
      memberName.includes(search.toLowerCase()) ||
      msg.message_content?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // 🔹 Status colors
  const statusColor = {
    sent: "bg-green-100 text-green-700",
    delivered: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  // 🔹 Callback when reminder is sent
  const handleReminderSent = (newMessages) => {
    setMessages((prev) => [...prev, ...newMessages]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Messages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.length} messages sent
          </p>
        </div>

        <Button size="sm" onClick={() => setShowReminder(true)}>
          <Send className="h-4 w-4 mr-2" /> Send Reminders
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Messages list */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No messages found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Send your first reminder to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {getMemberName(msg.member_id)?.charAt(0)?.toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">
                        {getMemberName(msg.member_id)}
                      </p>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${
                          statusColor[msg.status] || statusColor.sent
                        }`}
                      >
                        {msg.status}
                      </span>

                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground capitalize">
                        {msg.channel}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line line-clamp-3">
                      {msg.message_content}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {moment(msg.created_date).fromNow()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Reminder Dialog */}
      {showReminder && (
        <SendReminderDialog
          open={showReminder}
          onOpenChange={setShowReminder}
          members={members}
          preselectedIds={[]}
          onSent={handleReminderSent}
        />
      )}
    </div>
  );
}