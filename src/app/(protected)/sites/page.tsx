"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Site, SiteListItem, SitesResponse } from "@/types/models";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function SitesPage() {
  const { user, loading } = useAuth();
  const canManageSites =
    user?.role === "super_admin" || user?.role === "trade_manager";

  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewDetail, setViewDetail] = useState<Site | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteListItem | null>(null);
  const [deletingSite, setDeletingSite] = useState<SiteListItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    site_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    postcode: "",
    contact_name: "",
    contact_phone: "",
    contact_email: ""
  });
  const [editForm, setEditForm] = useState({
    client_name: "",
    site_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    postcode: "",
    contact_name: "",
    contact_phone: "",
    contact_email: ""
  });

  async function loadSites() {
    const res = await apiFetch<SitesResponse>("/sites");
    setSites(res.sites);
  }

  useEffect(() => {
    if (!user) return;
    loadSites().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load sites");
    });
  }, [user]);

  async function openSiteDetail(id: number) {
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await apiFetch<Site>(`/sites/${id}`);
      setViewDetail(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load site");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/sites", {
        method: "POST",
        body: JSON.stringify({
          client_name: form.client_name,
          site_name: form.site_name || null,
          address_line_1: form.address_line_1,
          address_line_2: form.address_line_2 || null,
          city: form.city,
          postcode: form.postcode,
          contact_name: form.contact_name || null,
          contact_phone: form.contact_phone || null,
          contact_email: form.contact_email || null
        })
      });
      await loadSites();
      const t = toast({ title: "Site created successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setShowForm(false);
      setForm({ client_name: "", site_name: "", address_line_1: "", address_line_2: "", city: "", postcode: "", contact_name: "", contact_phone: "", contact_email: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create site");
    } finally {
      setSubmitting(false);
    }
  }

  async function startEditSite(site: SiteListItem) {
    setError(null);
    try {
      const detail = await apiFetch<Site>(`/sites/${site.id}`);
      setEditingSite(site);
      setEditForm({
        client_name: detail.client_name ?? "",
        site_name: detail.site_name ?? "",
        address_line_1: detail.address_line_1 ?? "",
        address_line_2: detail.address_line_2 ?? "",
        city: detail.city ?? "",
        postcode: detail.postcode ?? "",
        contact_name: detail.contact_name ?? "",
        contact_phone: detail.contact_phone ?? "",
        contact_email: detail.contact_email ?? ""
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load site for editing");
    }
  }

  async function handleUpdateSite(e: FormEvent) {
    e.preventDefault();
    if (!editingSite) return;
    setError(null);
    setSavingEdit(true);
    try {
      await apiFetch(`/sites/${editingSite.id}`, {
        method: "PUT",
        body: JSON.stringify({
          client_name: editForm.client_name,
          site_name: editForm.site_name || null,
          address_line_1: editForm.address_line_1,
          address_line_2: editForm.address_line_2 || null,
          city: editForm.city,
          postcode: editForm.postcode,
          contact_name: editForm.contact_name || null,
          contact_phone: editForm.contact_phone || null,
          contact_email: editForm.contact_email || null
        })
      });
      await loadSites();
      const t = toast({ title: "Site updated successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setEditingSite(null);
      if (viewDetail?.id === editingSite.id) {
        setViewDetail(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update site");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteSite() {
    if (!deletingSite) return;
    setError(null);
    setDeleting(true);
    try {
      await apiFetch(`/sites/${deletingSite.id}`, { method: "DELETE" });
      await loadSites();
      const t = toast({ title: "Site deleted successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setDeletingSite(null);
      if (viewDetail?.id === deletingSite.id) {
        setViewDetail(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete site");
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sites</h1>
        {canManageSites && (
          <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((v) => !v)}>
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create site
              </>
            )}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New site</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client name <span className="text-destructive">*</span></Label>
                  <Input id="client_name" required value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site name</Label>
                  <Input id="site_name" value={form.site_name} onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address_line_1">Address line 1 <span className="text-destructive">*</span></Label>
                  <Input id="address_line_1" required value={form.address_line_1} onChange={(e) => setForm((f) => ({ ...f, address_line_1: e.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address_line_2">Address line 2</Label>
                  <Input id="address_line_2" value={form.address_line_2} onChange={(e) => setForm((f) => ({ ...f, address_line_2: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                  <Input id="city" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode <span className="text-destructive">*</span></Label>
                  <Input id="postcode" required value={form.postcode} onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact name</Label>
                  <Input id="contact_name" value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact phone</Label>
                  <Input id="contact_phone" type="tel" value={form.contact_phone} onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="contact_email">Contact email</Label>
                  <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create site
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
              <TableHead>Client</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Jobs</TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell>{site.client_name}</TableCell>
                <TableCell className="text-muted-foreground">{site.site_name ?? "-"}</TableCell>
                <TableCell>
                  {[site.address_line_1, site.address_line_2, site.city, site.postcode]
                    .filter((part) => !!part)
                    .join(", ")}
                </TableCell>
                <TableCell>{site.job_count ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={loadingDetail}
                      onClick={() => openSiteDetail(site.id)}
                    >
                      View
                    </Button>
                    {canManageSites && (
                      <>
                        <Button variant="outline" size="sm" className="hover:bg-transparent hover:text-foreground" onClick={() => startEditSite(site)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeletingSite(site)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sites.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {canManageSites ? "No sites yet. Create one above." : "No sites yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!viewDetail} onOpenChange={(open) => !open && setViewDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[12px]">
          <DialogHeader>
            <DialogTitle>
              {viewDetail?.site_name ?? viewDetail?.client_name ?? "Site"}
            </DialogTitle>
          </DialogHeader>
          {viewDetail && (
            <div className="space-y-4 text-sm">
              {viewDetail.site_name && viewDetail.client_name && (
                <p><span className="font-medium text-muted-foreground">Client:</span> {viewDetail.client_name}</p>
              )}
              <div>
                <p className="font-medium text-muted-foreground mb-1">Address</p>
                <p>
                  {viewDetail.address_line_1}
                  {viewDetail.address_line_2 ? `, ${viewDetail.address_line_2}` : ""}
                  <br />
                  {viewDetail.city} {viewDetail.postcode}
                </p>
              </div>
              {(viewDetail.contact_name || viewDetail.contact_phone || viewDetail.contact_email) && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Contact</p>
                  <p>
                    {viewDetail.contact_name && <span>{viewDetail.contact_name}<br /></span>}
                    {viewDetail.contact_phone && <span>{viewDetail.contact_phone}<br /></span>}
                    {viewDetail.contact_email && <span>{viewDetail.contact_email}</span>}
                  </p>
                </div>
              )}
              {viewDetail.notes && (
                <p><span className="font-medium text-muted-foreground">Notes:</span> {viewDetail.notes}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSite} onOpenChange={(open) => !open && setEditingSite(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Edit site</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client_name">Client name <span className="text-destructive">*</span></Label>
                <Input id="edit-client_name" required value={editForm.client_name} onChange={(e) => setEditForm((f) => ({ ...f, client_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-site_name">Site name</Label>
                <Input id="edit-site_name" value={editForm.site_name} onChange={(e) => setEditForm((f) => ({ ...f, site_name: e.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-address_line_1">Address line 1 <span className="text-destructive">*</span></Label>
                <Input id="edit-address_line_1" required value={editForm.address_line_1} onChange={(e) => setEditForm((f) => ({ ...f, address_line_1: e.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-address_line_2">Address line 2</Label>
                <Input id="edit-address_line_2" value={editForm.address_line_2} onChange={(e) => setEditForm((f) => ({ ...f, address_line_2: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City <span className="text-destructive">*</span></Label>
                <Input id="edit-city" required value={editForm.city} onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postcode">Postcode <span className="text-destructive">*</span></Label>
                <Input id="edit-postcode" required value={editForm.postcode} onChange={(e) => setEditForm((f) => ({ ...f, postcode: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_name">Contact name</Label>
                <Input id="edit-contact_name" value={editForm.contact_name} onChange={(e) => setEditForm((f) => ({ ...f, contact_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_phone">Contact phone</Label>
                <Input id="edit-contact_phone" type="tel" value={editForm.contact_phone} onChange={(e) => setEditForm((f) => ({ ...f, contact_phone: e.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-contact_email">Contact email</Label>
                <Input id="edit-contact_email" type="email" value={editForm.contact_email} onChange={(e) => setEditForm((f) => ({ ...f, contact_email: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingSite(null)} disabled={savingEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingSite} onOpenChange={(open) => !open && setDeletingSite(null)}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Delete site</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {deletingSite?.site_name ?? deletingSite?.client_name ?? "this site"}?
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeletingSite(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteSite} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
