"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { User, UserListItem, UsersResponse } from "@/types/models";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function EngineerPage() {
  const { user, loading } = useAuth();
  const canManageEngineers =
    user?.role === "super_admin" || user?.role === "trade_manager";

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewDetail, setViewDetail] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [editForm, setEditForm] = useState({
    is_active: true,
  });

  async function loadEngineers() {
    const res = await apiFetch<UsersResponse>("/users?role=engineer");
    setUsers(res.users);
  }

  useEffect(() => {
    if (!user || !canManageEngineers) return;
    loadEngineers().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load engineers");
    });
  }, [user, canManageEngineers]);

  async function openUserDetail(id: number) {
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await apiFetch<User>(`/users/${id}`);
      setViewDetail(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load engineer");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: "engineer",
        }),
      });
      await loadEngineers();
      const t = toast({ title: "Engineer created successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setShowForm(false);
      setForm({ email: "", password: "", full_name: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create engineer");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditUser(target: UserListItem) {
    setError(null);
    setEditingUser(target);
    setEditForm({
      is_active: target.is_active,
    });
  }

  async function handleUpdateUser(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    setSavingEdit(true);
    try {
      await apiFetch(`/users/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          is_active: editForm.is_active,
        }),
      });
      await loadEngineers();
      const t = toast({ title: "Engineer updated successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setEditingUser(null);
      if (viewDetail?.id === editingUser.id) {
        setViewDetail(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update engineer");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;
    setError(null);
    setDeleting(true);
    try {
      await apiFetch(`/users/${deletingUser.id}`, { method: "DELETE" });
      await loadEngineers();
      const t = toast({ title: "Engineer deleted successfully." });
      setTimeout(() => t.dismiss(), 4000);
      if (viewDetail?.id === deletingUser.id) {
        setViewDetail(null);
      }
      setDeletingUser(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete engineer");
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!canManageEngineers) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">You do not have permission to view engineers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Engineers</h1>
        <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((v) => !v)}>
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create engineer
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">List engineers and create engineer accounts.</p>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New engineer</CardTitle>
            <CardDescription>Add an engineer account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name <span className="text-destructive">*</span></Label>
                  <Input
                    id="full_name"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="password"
                    required
                    type="password"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create engineer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[240px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{u.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={loadingDetail}
                      onClick={() => openUserDetail(u.id)}
                    >
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-transparent hover:text-foreground" onClick={() => startEditUser(u)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingUser(u)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No engineers in this list.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!viewDetail} onOpenChange={(open) => !open && setViewDetail(null)}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>{viewDetail?.full_name ?? "Engineer"}</DialogTitle>
          </DialogHeader>
          {viewDetail && (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium text-muted-foreground">Email:</span> {viewDetail.email}</p>
              <p><span className="font-medium text-muted-foreground">Role:</span> <span className="capitalize">{viewDetail.role.replace("_", " ")}</span></p>
              <p><span className="font-medium text-muted-foreground">Active:</span> {viewDetail.is_active ? "Yes" : "No"}</p>
              {viewDetail.created_at && (
                <p className="text-muted-foreground text-xs">
                  Created {new Date(viewDetail.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Edit engineer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            {editingUser && (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm space-y-1">
                <p><span className="font-medium">Engineer:</span> {editingUser.full_name}</p>
                <p className="text-muted-foreground">{editingUser.email}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-engineer-active">Active</Label>
              <select
                id="edit-engineer-active"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editForm.is_active ? "true" : "false"}
                onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.value === "true" }))}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={savingEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Delete engineer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {deletingUser?.full_name ?? "this engineer"}?
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeletingUser(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
