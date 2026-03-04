import { getServices, getVehicleBrands } from "@/lib/actions/catalog.actions";
import { CatalogManager } from "@/components/CatalogManager";

export default async function CatalogPage() {
  const [services, brands] = await Promise.all([getServices(), getVehicleBrands()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catalog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage services, sub-services, and vehicle brands available to merchants.
        </p>
      </div>
      <CatalogManager initialServices={services} initialBrands={brands} />
    </div>
  );
}
