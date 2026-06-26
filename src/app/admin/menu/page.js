"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Plus, Pencil, Trash2, Upload, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

const EMPTY_ITEM = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  tags: "",
  allergens: "",
  prepTimeMinutes: 15,
  isFeatured: false,
};

export default function AdminMenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [isUploading, setIsUploading] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/menu/categories"),
        fetch("/api/menu?includeUnavailable=true"),
      ]);
      const catData = await catRes.json();
      const itemData = await itemRes.json();
      setCategories(catData.categories || []);
      setItems(itemData.items || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((i) => (i.category?._id || i.category) === activeCategory);

  function openCreate() {
    setEditingItem(null);
    setForm(EMPTY_ITEM);
    setItemDialogOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category?._id || item.category,
      imageUrl: item.imageUrl || "",
      tags: (item.tags || []).join(", "),
      allergens: (item.allergens || []).join(", "),
      prepTimeMinutes: item.prepTimeMinutes || 15,
      isFeatured: item.isFeatured || false,
    });
    setItemDialogOpen(true);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveItem() {
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price, and category are required.");
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
      prepTimeMinutes: Number(form.prepTimeMinutes),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      allergens: form.allergens.split(",").map((t) => t.trim()).filter(Boolean),
      isAvailable: true,
    };

    const url = editingItem ? `/api/menu/${editingItem._id}` : "/api/menu";
    const method = editingItem ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not save item");
      return;
    }
    toast.success(editingItem ? "Item updated" : "Item created");
    setItemDialogOpen(false);
    loadAll();
  }

  async function toggleAvailability(item) {
    const res = await fetch(`/api/menu/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`${item.name} marked ${!item.isAvailable ? "available" : "unavailable"}`);
      loadAll();
    }
  }

  async function handleDeleteItem() {
    const res = await fetch(`/api/menu/${deleteTarget._id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Item deleted");
      setDeleteTarget(null);
      loadAll();
    } else {
      toast.error(data.error);
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error);
      return;
    }
    toast.success("Category created");
    setNewCategoryName("");
    setCategoryDialogOpen(false);
    loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-gf-cream">Menu Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="size-3.5" /> Category
          </Button>
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="size-3.5" /> Menu Item
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm",
            activeCategory === "all"
              ? "border-gf-gold bg-gf-gold text-gf-bg"
              : "border-gf-border text-gf-muted hover:text-gf-gold"
          )}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm",
              activeCategory === cat._id
                ? "border-gf-gold bg-gf-gold text-gf-bg"
                : "border-gf-border text-gf-muted hover:text-gf-gold"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-gf-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={cn(
                "overflow-hidden rounded-lg border bg-gf-bg-card",
                item.isAvailable ? "border-gf-border" : "border-gf-border opacity-60"
              )}
            >
              <div className="h-36 bg-gf-bg-elevated">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gf-muted-2">
                    <ImageOff className="size-6" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg text-gf-cream">{item.name}</h3>
                  <span className="text-gf-gold">{formatCurrency(item.price)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gf-muted">{item.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={item.isAvailable} onCheckedChange={() => toggleAvailability(item)} />
                    <span className="text-xs text-gf-muted">
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-gf-danger" onClick={() => setDeleteTarget(item)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {item.isFeatured && (
                  <Badge variant="gold" className="mt-2 text-[10px]">Featured</Badge>
                )}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full rounded-lg border border-gf-border bg-gf-bg-card py-16 text-center text-gf-muted-2">
              No items in this category yet.
            </div>
          )}
        </div>
      )}

      {/* Item create/edit dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prep time (min)</Label>
                <Input
                  type="number"
                  value={form.prepTimeMinutes}
                  onChange={(e) => setForm({ ...form, prepTimeMinutes: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="" className="size-12 rounded object-cover" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tags (comma separated)</Label>
                <Input
                  placeholder="vegan, spicy"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Allergens (comma separated)</Label>
                <Input
                  placeholder="nuts, dairy"
                  value={form.allergens}
                  onChange={(e) => setForm({ ...form, allergens: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-gf-border p-3">
              <Label htmlFor="featured">Feature on homepage</Label>
              <Switch
                id="featured"
                checked={form.isFeatured}
                onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="gold" onClick={handleSaveItem}>
              {editingItem ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category create dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="e.g. Desserts"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="gold" onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the item from the menu. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-gf-danger text-white hover:bg-gf-danger/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
