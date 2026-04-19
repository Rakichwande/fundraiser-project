import { useState, useEffect } from "react";
import StatsCards from "../components/dashboard/StatsCards";
import RecentActivity from "../components/dashboard/RecentActivity";
import MemberOverview from "../components/dashboard/MemberOverview";
import { Loader2 } from "lucide-react";
import API from "../api/apiClient";

export default function Dashboard() {
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
  try {
    setLoading(true);

    const membersRes = await API.get("/members");
    setMembers(membersRes.data || []);

    const paymentsRes = await API.get("/payments");
    setPayments(paymentsRes.data || []);

  } catch (error) {
    console.error("Dashboard load error:", error);
    setMembers([]);
    setPayments([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight leading-tight">
          ACK CHRIST CHURCH RIM HOUSE PARISH
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Funds drive towards the Construction of the Children, Teens and Youth Centre (CTYC)
        </p>
      </div>

      <StatsCards members={members} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberOverview members={members} />
        <RecentActivity payments={payments} members={members} />
      </div>
    </div>
  );
}