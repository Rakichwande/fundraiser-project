import { useState, useEffect } from "react";
import MemberTable from "../components/members/MemberTable";
import MemberFormDialog from "../components/members/MemberFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import API from "../api/apiClient";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  // 🔹 Load Members (only on page load)
  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/members");
      setMembers(res.data);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // ✅ NEW: Handle create/update without re-fetch
  const handleMemberSaved = (member) => {
    setMembers((prev) => {
      const exists = prev.find((m) => m.id === member.id);

      if (exists) {
        return prev.map((m) =>
          m.id === member.id ? member : m
        );
      }

      return [...prev, member];
    });
  };

  // 🔹 Filter logic
  const filtered = members.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone_number?.includes(search);

    const matchStatus =
      statusFilter === "all" || m.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ✅ UPDATED: Delete without reload
  const handleDelete = async () => {
    if (!deleteMember) return;

    try {
      await API.delete(`/members/${deleteMember.id}`);

      setMembers((prev) =>
        prev.filter((m) => m.id !== deleteMember.id)
      );

      setDeleteMember(null);
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  // 🔹 Export CSV
  const handleExport = () => {
    const headers = ["Name", "Phone", "Pledged", "Paid", "Remaining", "Status"];

    const rows = filtered.map((m) => [
      m.name,
      m.phone_number,
      m.pledged_amount || 0,
      m.total_paid || 0,
      (m.pledged_amount || 0) - (m.total_paid || 0),
      m.status,
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "members_export.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  // 🔹 Loading UI
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
            Members
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} total members
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditMember(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="defaulted">Defaulted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <MemberTable
        members={filtered}
        onEdit={(m) => {
          setEditMember(m);
          setShowForm(true);
        }}
        onDelete={setDeleteMember}
      />

      {/* Form Dialog */}
      {showForm && (
        <MemberFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          member={editMember}
          onSaved={handleMemberSaved} 
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteMember}
        onOpenChange={() => setDeleteMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteMember?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}