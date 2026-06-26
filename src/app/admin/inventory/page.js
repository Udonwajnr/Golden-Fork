"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, AlertTriangle, PackagePlus, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EMPTY_INGREDIENT = {
  name: "",
  unit: "kg",
  currentStock: "",
  lowStockThreshold: "",
  costPerUnit: "",
  supplier: "",
};

const EMPTY_SUPPLIER = { name: "", contactName: "", email: "", phone: "", address: "" };

export default function AdminInventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [form, setForm] = useState(EMPTY_INGREDIENT);
  const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ingRes, supRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/inventory/suppliers"),
      ]);
      const ingData = await ingRes.json();
      const supData = await supRes.json();
      setIngredients(ingData.ingredients || []);
      setSuppliers(supData.suppliers || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const lowStockItems = ingredients.filter((i) => i.currentStock <= i.lowStockThreshold);

  async function handleCreateIngredient() {
    if (!form.name || form.currentStock === "" || form.lowStockThreshold === "") {
      toast.error("Name, current stock, and threshold are required.");
      return;
    }
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not add ingredient");
      return;
    }
    toast.success("Ingredient added");
    setForm(EMPTY_INGREDIENT);
    setIngredientDialogOpen(false);
    load();
  }

  async function handleRestock() {
    const qty = Number(restockAmount);
    if (!qty || qty <= 0) {
      toast.error("Enter a valid restock quantity.");
      return;
    }
    const res = await fetch(`/api/inventory/${restockTarget._id}/restock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not restock");
      return;
    }
    toast.success(`${restockTarget.name} restocked by ${qty}${restockTarget.unit}`);
    setRestockTarget(null);
    setRestockAmount("");
    load();
  }

  async function handleCreateSupplier() {
    if (!supplierForm.name) {
      toast.error("Supplier name is required.");
      return;
    }
    const res = await fetch("/api/inventory/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplierForm),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not add supplier");
      return;
    }
    toast.success("Supplier added");
    setSupplierForm(EMPTY_SUPPLIER);
    setSupplierDialogOpen(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-gf-cream">Inventory</h1>
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-lg border border-gf-warning/40 bg-gf-warning/10 p-4">
          <div className="flex items-center gap-2 text-gf-warning">
            <AlertTriangle className="size-4" />
            <span className="font-medium">Low Stock Alerts</span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gf-warning/90">
            {lowStockItems.map((i) => (
              <p key={i._id}>
                Only {i.currentStock}{i.unit} of {i.name} remaining (threshold: {i.lowStockThreshold}{i.unit}).
              </p>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="ingredients">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ingredients" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" size="sm" onClick={() => setIngredientDialogOpen(true)}>
              <Plus className="size-3.5" /> Add Ingredient
            </Button>
          </div>

          <div className="rounded-lg border border-gf-border bg-gf-bg-card">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-6 animate-spin text-gf-gold" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ing) => {
                    const low = ing.currentStock <= ing.lowStockThreshold;
                    return (
                      <TableRow key={ing._id}>
                        <TableCell className="font-medium text-gf-cream">{ing.name}</TableCell>
                        <TableCell className={cn(low && "text-gf-warning")}>
                          {ing.currentStock}{ing.unit}
                        </TableCell>
                        <TableCell className="text-gf-muted">{ing.lowStockThreshold}{ing.unit}</TableCell>
                        <TableCell className="text-gf-muted">{ing.supplier?.name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={low ? "warning" : "success"}>
                            {low ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setRestockTarget(ing)}>
                            <PackagePlus className="size-3.5" /> Restock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {ingredients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-gf-muted-2">
                        No ingredients tracked yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" size="sm" onClick={() => setSupplierDialogOpen(true)}>
              <Plus className="size-3.5" /> Add Supplier
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((s) => (
              <div key={s._id} className="rounded-lg border border-gf-border bg-gf-bg-card p-4">
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-gf-gold" />
                  <h3 className="font-display text-lg text-gf-cream">{s.name}</h3>
                </div>
                <div className="mt-2 space-y-1 text-sm text-gf-muted">
                  {s.contactName && <p>{s.contactName}</p>}
                  {s.email && <p>{s.email}</p>}
                  {s.phone && <p>{s.phone}</p>}
                </div>
              </div>
            ))}
            {suppliers.length === 0 && (
              <div className="col-span-full rounded-lg border border-gf-border bg-gf-bg-card py-16 text-center text-gf-muted-2">
                No suppliers added yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add ingredient dialog */}
      <Dialog open={ingredientDialogOpen} onOpenChange={setIngredientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ingredient</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["g", "kg", "ml", "l", "pcs", "oz", "lb"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cost per unit ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.costPerUnit}
                  onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Current Stock</Label>
                <Input
                  type="number"
                  value={form.currentStock}
                  onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Low Stock Threshold</Label>
                <Input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Supplier (optional)</Label>
              <Select value={form.supplier} onValueChange={(v) => setForm({ ...form, supplier: v })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="gold" onClick={handleCreateIngredient}>Add Ingredient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock dialog */}
      <Dialog open={!!restockTarget} onOpenChange={(o) => !o && setRestockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock {restockTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Quantity to add ({restockTarget?.unit})</Label>
            <Input
              type="number"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="gold" onClick={handleRestock}>Confirm Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add supplier dialog */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Supplier name</Label>
              <Input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact name</Label>
              <Input value={supplierForm.contactName} onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="gold" onClick={handleCreateSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
