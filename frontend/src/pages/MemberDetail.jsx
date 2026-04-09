import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import API from "../api/apiClient";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CreditCard,
  MessageSquare,
  Pencil,
  Loader2,
  Phone,
} from "lucide-react";
import moment from "moment";
import MemberFormDialog from "../components/members/MemberFormDialog";
import PaymentFormDialog from "../components/payments/PaymentFormDialog";
import SendReminderDialog from "../components/messages/SendReminderDialog";

const statusStyles = {
  active: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  defaulted: "bg-red-100 text-red-700",
};

const methodLabels = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Money",
  check: "Check",
  other: "Other",
};

export default function MemberDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // 🔹 Load member, payments & messages
  const loadData = async () => {
    try {
      setLoading(true);

      const [memberRes, paymentRes, messageRes] = await Promise.all([
        API.get(`/members/${id}`),
        API.get(`/payments/member/${id}`),
        API.get(`/messages/member/${id}`),
      ]);

      setMember(memberRes.data);
      setPayments(paymentRes.data);
      setMessages(messageRes.data);
    } catch (error) {
      console.error("Error loading member detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 🔹 Handle updates locally without polling
  const handlePaymentSaved = (newPayment) => {
    setPayments((prev) => [...prev, newPayment]);

    // Update member total_paid and status locally
    setMember((prev) => {
      if (!prev) return prev;
      const totalPaid = (prev.total_paid || 0) + newPayment.amount;
      let newStatus = prev.status;
      if (totalPaid >= (prev.pledged_amount || 0)) {
        newStatus = "completed";
      } else if (prev.status === "completed") {
        newStatus = "active";
      }
      return {
        ...prev,
        total_paid: totalPaid,
        status: newStatus,
      };
    });
  };

  const handleReminderSent = (newMessages) => {
    setMessages((prev) => [...prev, ...newMessages]);
  };

  // 🔹 Loading UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 🔹 Not found
  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Member not found</p>
        <Link
          to="/members"
          className="text-primary hover:underline text-sm mt-2 inline-block"
        >
          Back to Members
        </Link>
      </div>
    );
  }

  // 🔹 Payment stats
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = (member.pledged_amount || 0) - totalPaid;
  const progress = member.pledged_amount
    ? (totalPaid / member.pledged_amount) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/members"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold">
              {member.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h1 className="text-xl font-bold">{member.name}</h1>

              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3" />
                {isAdmin
                  ? member.phone_number
                  : member.phone_number
                  ? member.phone_number.slice(0, 7) +
                    "***" +
                    member.phone_number.slice(-3)
                  : ""}
              </div>

              {member.notes && (
                <p className="text-sm mt-2 bg-muted p-2 rounded">{member.notes}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowEdit(true)} size="sm">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowReminder(true)}
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-1" /> Remind
            </Button>

            <Button onClick={() => setShowPayment(true)} size="sm">
              <CreditCard className="h-4 w-4 mr-1" /> Payment
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 grid grid-cols-3 text-center">
          <div>
            <p className="text-xs">Pledged</p>
            <p className="font-bold">
              KES {(member.pledged_amount || 0).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs">Paid</p>
            <p className="font-bold text-green-600">
              KES {totalPaid.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs">Remaining</p>
            <p className="font-bold">KES {remaining.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-green-500 h-2 rounded"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-right mt-1">{progress.toFixed(1)}%</p>
        </div>
      </div>

      {/* Payments */}
      <div className="bg-card p-4 rounded border">
        <h3 className="font-semibold mb-3">Payments</h3>

        {payments.map((p) => (
          <div key={p.id} className="text-sm mb-2">
            KES {p.amount} — {moment(p.created_date).format("MMM D")}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="bg-card p-4 rounded border">
        <h3 className="font-semibold mb-3">Messages</h3>

        {messages.map((m) => (
          <div key={m.id} className="text-sm mb-2">
            {m.message_content}
          </div>
        ))}
      </div>

      {/* Dialogs */}
      {showEdit && (
        <MemberFormDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          member={member}
          onSaved={loadData} // still reloads member info
        />
      )}

      {showPayment && (
        <PaymentFormDialog
          open={showPayment}
          onOpenChange={setShowPayment}
          members={[member]}
          preselectedMemberId={member.id}
          onSaved={handlePaymentSaved}
        />
      )}

      {showReminder && (
        <SendReminderDialog
          open={showReminder}
          onOpenChange={setShowReminder}
          members={[member]}
          preselectedIds={[member.id]}
          onSent={handleReminderSent}
        />
      )}
    </div>
  );
}