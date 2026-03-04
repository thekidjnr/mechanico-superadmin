"use client";
import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { CatalogService, SubService, VehicleBrand } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  LuWrench,
  LuCar,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuChevronDown,
  LuChevronRight,
  LuImage,
} from "react-icons/lu";
import {
  createService,
  updateService,
  deleteService,
  createSubService,
  updateSubService,
  deleteSubService,
  createVehicleBrand,
  updateVehicleBrand,
  deleteVehicleBrand,
} from "@/lib/actions/catalog.actions";

// ── Types for dialog state ────────────────────────────────────────────────────

type ServiceDialog =
  | { mode: "add" }
  | { mode: "edit"; service: CatalogService };

type SubServiceDialog =
  | { mode: "add"; serviceId: number; serviceName: string }
  | { mode: "edit"; serviceId: number; subService: SubService };

type BrandDialog =
  | { mode: "add" }
  | { mode: "edit"; brand: VehicleBrand };

// ── Root component ────────────────────────────────────────────────────────────

export function CatalogManager({
  initialServices,
  initialBrands,
}: {
  initialServices: CatalogService[];
  initialBrands: VehicleBrand[];
}) {
  const [activeTab, setActiveTab] = useState<"services" | "brands">("services");
  const [services, setServices] = useState<CatalogService[]>(initialServices);
  const [brands, setBrands] = useState<VehicleBrand[]>(initialBrands);

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
        {(["services", "brands"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "services" ? <LuWrench size={14} /> : <LuCar size={14} />}
            {tab === "services" ? "Services" : "Vehicle Brands"}
          </button>
        ))}
      </div>

      {activeTab === "services" ? (
        <ServicesPanel services={services} setServices={setServices} />
      ) : (
        <BrandsPanel brands={brands} setBrands={setBrands} />
      )}
    </div>
  );
}

// ── Services panel ────────────────────────────────────────────────────────────

function ServicesPanel({
  services,
  setServices,
}: {
  services: CatalogService[];
  setServices: React.Dispatch<React.SetStateAction<CatalogService[]>>;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [serviceDialog, setServiceDialog] = useState<ServiceDialog | null>(null);
  const [subDialog, setSubDialog] = useState<SubServiceDialog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "service"; id: number; name: string }
    | { kind: "sub"; id: number; name: string; serviceId: number }
    | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSaveService = (title: string) => {
    if (!title.trim()) return;
    startTransition(async () => {
      if (serviceDialog?.mode === "add") {
        const res = await createService(title.trim());
        if ("error" in res) { toast.error(res.error); return; }
        setServices((prev) => [...prev, res.service!]);
        toast.success("Service created");
      } else if (serviceDialog?.mode === "edit") {
        const res = await updateService(serviceDialog.service.id, title.trim());
        if ("error" in res) { toast.error(res.error); return; }
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceDialog.service.id ? { ...s, title: title.trim() } : s
          )
        );
        toast.success("Service updated");
      }
      setServiceDialog(null);
    });
  };

  const handleSaveSubService = (title: string) => {
    if (!title.trim() || !subDialog) return;
    startTransition(async () => {
      if (subDialog.mode === "add") {
        const res = await createSubService(subDialog.serviceId, title.trim());
        if ("error" in res) { toast.error(res.error); return; }
        setServices((prev) =>
          prev.map((s) =>
            s.id === subDialog.serviceId
              ? { ...s, sub_services: [...s.sub_services, res.subService!] }
              : s
          )
        );
        toast.success("Sub-service created");
      } else if (subDialog.mode === "edit") {
        const res = await updateSubService(subDialog.subService.id, title.trim());
        if ("error" in res) { toast.error(res.error); return; }
        setServices((prev) =>
          prev.map((s) =>
            s.id === subDialog.serviceId
              ? {
                  ...s,
                  sub_services: s.sub_services.map((ss) =>
                    ss.id === subDialog.subService.id
                      ? { ...ss, title: title.trim() }
                      : ss
                  ),
                }
              : s
          )
        );
        toast.success("Sub-service updated");
      }
      setSubDialog(null);
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      if (deleteTarget.kind === "service") {
        const res = await deleteService(deleteTarget.id);
        if ("error" in res) { toast.error(res.error); return; }
        setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        toast.success("Service deleted");
      } else {
        const res = await deleteSubService(deleteTarget.id);
        if ("error" in res) { toast.error(res.error); return; }
        setServices((prev) =>
          prev.map((s) =>
            s.id === deleteTarget.serviceId
              ? { ...s, sub_services: s.sub_services.filter((ss) => ss.id !== deleteTarget.id) }
              : s
          )
        );
        toast.success("Sub-service deleted");
      }
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {services.length} service{services.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          variant="accent"
          onClick={() => setServiceDialog({ mode: "add" })}
        >
          <LuPlus size={14} />
          Add Service
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
        {services.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            No services yet. Add one to get started.
          </p>
        )}
        {services.map((service) => {
          const isOpen = expanded.has(service.id);
          return (
            <div key={service.id}>
              {/* Service row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleExpand(service.id)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isOpen ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
                </button>
                <span className="flex-1 text-sm font-medium text-slate-800">
                  {service.title}
                </span>
                <span className="text-xs text-slate-400">
                  {service.sub_services.length} sub-service
                  {service.sub_services.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setServiceDialog({ mode: "edit", service })}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Edit service"
                >
                  <LuPencil size={13} />
                </button>
                <button
                  onClick={() =>
                    setDeleteTarget({ kind: "service", id: service.id, name: service.title })
                  }
                  className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete service"
                >
                  <LuTrash2 size={13} />
                </button>
              </div>

              {/* Sub-services */}
              {isOpen && (
                <div className="border-t border-slate-50 bg-slate-50/50 px-4 pb-3 pt-2">
                  <div className="space-y-1 pl-6">
                    {service.sub_services.length === 0 && (
                      <p className="py-2 text-xs text-slate-400">No sub-services yet.</p>
                    )}
                    {service.sub_services.map((ss) => (
                      <div
                        key={ss.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 group"
                      >
                        <span className="flex-1 text-sm text-slate-700">{ss.title}</span>
                        <button
                          onClick={() =>
                            setSubDialog({ mode: "edit", serviceId: service.id, subService: ss })
                          }
                          className="rounded p-1 text-slate-300 group-hover:text-slate-500 hover:bg-slate-200 transition-colors"
                          title="Edit sub-service"
                        >
                          <LuPencil size={12} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ kind: "sub", id: ss.id, name: ss.title, serviceId: service.id })
                          }
                          className="rounded p-1 text-slate-300 group-hover:text-red-400 hover:bg-red-50 transition-colors"
                          title="Delete sub-service"
                        >
                          <LuTrash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setSubDialog({ mode: "add", serviceId: service.id, serviceName: service.title })
                    }
                    className="mt-2 ml-6 flex items-center gap-1.5 text-xs font-medium text-admin-accent hover:underline"
                  >
                    <LuPlus size={12} />
                    Add sub-service
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service dialog */}
      <TitleDialog
        open={serviceDialog !== null}
        onClose={() => setServiceDialog(null)}
        title={serviceDialog?.mode === "edit" ? "Edit Service" : "Add Service"}
        label="Service name"
        initialValue={serviceDialog?.mode === "edit" ? serviceDialog.service.title : ""}
        onSave={handleSaveService}
        isPending={isPending}
      />

      {/* Add / Edit Sub-service dialog */}
      <TitleDialog
        open={subDialog !== null}
        onClose={() => setSubDialog(null)}
        title={
          subDialog?.mode === "edit"
            ? "Edit Sub-service"
            : `Add Sub-service`
        }
        description={
          subDialog?.mode === "add" ? `Under: ${subDialog.serviceName}` : undefined
        }
        label="Sub-service name"
        initialValue={subDialog?.mode === "edit" ? subDialog.subService.title : ""}
        onSave={handleSaveSubService}
        isPending={isPending}
      />

      {/* Delete confirm dialog */}
      <DeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        name={deleteTarget?.name ?? ""}
        description={
          deleteTarget?.kind === "service"
            ? "This will also delete all sub-services under it."
            : undefined
        }
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </div>
  );
}

// ── Vehicle Brands panel ──────────────────────────────────────────────────────

function BrandsPanel({
  brands,
  setBrands,
}: {
  brands: VehicleBrand[];
  setBrands: React.Dispatch<React.SetStateAction<VehicleBrand[]>>;
}) {
  const [brandDialog, setBrandDialog] = useState<BrandDialog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleBrand | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      if (brandDialog?.mode === "add") {
        const res = await createVehicleBrand(formData);
        if ("error" in res) { toast.error(res.error); return; }
        setBrands((prev) =>
          [...prev, res.brand!].sort((a, b) => a.title.localeCompare(b.title))
        );
        toast.success("Brand created");
      } else if (brandDialog?.mode === "edit") {
        const res = await updateVehicleBrand(brandDialog.brand.id, formData);
        if ("error" in res) { toast.error(res.error); return; }
        setBrands((prev) =>
          prev
            .map((b) => (b.id === brandDialog.brand.id ? res.brand! : b))
            .sort((a, b) => a.title.localeCompare(b.title))
        );
        toast.success("Brand updated");
      }
      setBrandDialog(null);
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteVehicleBrand(deleteTarget.id, deleteTarget.logo_file_name);
      if ("error" in res) { toast.error(res.error); return; }
      setBrands((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success("Brand deleted");
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {brands.length} brand{brands.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" variant="accent" onClick={() => setBrandDialog({ mode: "add" })}>
          <LuPlus size={14} />
          Add Brand
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {brands.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">
            No vehicle brands yet.
          </p>
        )}
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="group relative flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Logo */}
            <div className="flex size-16 items-center justify-center rounded-lg bg-slate-50 overflow-hidden">
              {brand.logo_access_url ? (
                <img
                  src={brand.logo_access_url}
                  alt={brand.title}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <LuImage size={24} className="text-slate-300" />
              )}
            </div>
            <p className="text-center text-sm font-medium text-slate-800 leading-tight">
              {brand.title}
            </p>
            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
              <button
                onClick={() => setBrandDialog({ mode: "edit", brand })}
                className="rounded p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm transition-colors"
                title="Edit brand"
              >
                <LuPencil size={12} />
              </button>
              <button
                onClick={() => setDeleteTarget(brand)}
                className="rounded p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-red-600 shadow-sm transition-colors"
                title="Delete brand"
              >
                <LuTrash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Brand dialog */}
      <BrandDialog
        open={brandDialog !== null}
        onClose={() => setBrandDialog(null)}
        mode={brandDialog?.mode ?? "add"}
        brand={brandDialog?.mode === "edit" ? brandDialog.brand : undefined}
        onSave={handleSave}
        isPending={isPending}
      />

      {/* Delete confirm */}
      <DeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        name={deleteTarget?.title ?? ""}
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </div>
  );
}

// ── Shared dialogs ────────────────────────────────────────────────────────────

function TitleDialog({
  open,
  onClose,
  title,
  description,
  label,
  initialValue,
  onSave,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  label: string;
  initialValue: string;
  onSave: (value: string) => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  // Sync initial value when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o) setValue(initialValue);
    else onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="title-input">{label}</Label>
            <Input
              id="title-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSave(value);
                }
              }}
              placeholder="Enter name..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild>
              <Button variant="ghost" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              variant="accent"
              onClick={() => onSave(value)}
              disabled={isPending || !value.trim()}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BrandDialog({
  open,
  onClose,
  mode,
  brand,
  onSave,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  brand?: VehicleBrand;
  onSave: (formData: FormData) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(brand?.title ?? "");
  const [preview, setPreview] = useState<string | null>(brand?.logo_access_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setTitle(brand?.title ?? "");
      setPreview(brand?.logo_access_url ?? null);
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.append("title", title.trim());
    if (fileRef.current?.files?.[0]) {
      fd.append("logo", fileRef.current.files[0]);
    }
    if (mode === "edit" && brand) {
      fd.append("current_logo_key", brand.logo_file_name ?? "");
      fd.append("current_logo_url", brand.logo_access_url ?? "");
      fd.append("current_logo_mime", brand.logo_mime_type ?? "");
    }
    onSave(fd);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Brand" : "Add Vehicle Brand"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="brand-title">Brand name</Label>
            <Input
              id="brand-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Toyota"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Logo (optional)</Label>
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-contain p-1" />
                ) : (
                  <LuImage size={22} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPreview(URL.createObjectURL(f));
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                >
                  {preview ? "Change logo" : "Upload logo"}
                </Button>
                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="mt-1.5 w-full text-center text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild>
              <Button variant="ghost" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              variant="accent"
              onClick={handleSubmit}
              disabled={isPending || !title.trim()}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  onClose,
  name,
  description,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  description?: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{name}&rdquo;?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          This action cannot be undone.
          {description && <span className="block mt-1">{description}</span>}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">Cancel</Button>
          </DialogClose>
          <Button
            size="sm"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
