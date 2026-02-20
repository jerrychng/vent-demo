"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
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

export default function TradeManagersPage() {
  const { user, loading } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewDetail, setViewDetail] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    if (!user || !isSuperAdmin) return;
    apiFetch<UsersResponse>("/users?role=trade_manager")
      .then((res) => setUsers(res.users))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load trade managers"));
  }, [user, isSuperAdmin]);

  async function openUserDetail(id: number) {
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await apiFetch<User>(`/users/${id}`);
      setViewDetail(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load trade manager");
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
          phone_number: form.phone_number.trim(),
          address: form.address.trim(),
          role: "trade_manager",
        })
      });
      const res = await apiFetch<UsersResponse>("/users?role=trade_manager");
      setUsers(res.users);
      setShowForm(false);
      setForm({ email: "", password: "", full_name: "", phone_number: "", address: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create trade manager");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">You do not have permission to view trade managers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trade Managers</h1>
        <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Create trade manager"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">List trade managers and create trade manager accounts.</p>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New trade manager</CardTitle>
            <CardDescription>Add a trade manager account</CardDescription>
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
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone number <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone_number"
                    required
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="address"
                    required
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create trade manager"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Name</TableHead>
              <TableHead className="w-[180px]">Email</TableHead>
              <TableHead className="w-[130px]">Phone</TableHead>
              <TableHead className="w-[200px]">Address</TableHead>
              <TableHead className="w-[70px]">Active</TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="align-top whitespace-normal break-words">{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground align-top whitespace-normal break-words">{u.email}</TableCell>
                <TableCell className="align-top whitespace-normal break-words">{u.phone_number ?? "-"}</TableCell>
                <TableCell className="align-top whitespace-normal break-words">{u.address ?? "-"}</TableCell>
                <TableCell className="align-top">{u.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right align-top">
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No trade managers in this list.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!viewDetail} onOpenChange={(open) => !open && setViewDetail(null)}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>{viewDetail?.full_name ?? "Trade Manager"}</DialogTitle>
          </DialogHeader>
          {viewDetail && (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium text-muted-foreground">Email:</span> {viewDetail.email}</p>
              <p><span className="font-medium text-muted-foreground">Phone:</span> {viewDetail.phone_number ?? "-"}</p>
              <p><span className="font-medium text-muted-foreground">Address:</span> {viewDetail.address ?? "-"}</p>
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
    </div>
  );
}
