"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import type { User, UserListItem, UsersResponse } from "@/types/models";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function EngineerPage() {
  const { user, loading } = useAuth();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewDetail, setViewDetail] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiFetch<UsersResponse>("/users?role=engineer")
      .then((res) => setUsers(res.users))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load engineers"));
  }, [user]);

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

  if (loading || !user) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Engineers</h1>

      <p className="text-sm text-muted-foreground">List engineers.</p>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{u.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={loadingDetail}
                    onClick={() => openUserDetail(u.id)}
                  >
                    View
                  </Button>
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
        <DialogContent className="max-w-md">
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
    </div>
  );
}
